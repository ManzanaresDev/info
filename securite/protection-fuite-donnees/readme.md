# 🔐 Protection contre les fuites de données avec Next.js
> Manuel complet de sécurité — Next.js (App Router & Pages Router)

---

## Table des matières

1. [Introduction](#introduction)
2. [Les vecteurs de fuite les plus courants](#les-vecteurs-de-fuite-les-plus-courants)
3. [Variables d'environnement](#variables-denvironnement)
4. [Exposition involontaire via les Server Components](#exposition-involontaire-via-les-server-components)
5. [API Routes et Route Handlers](#api-routes-et-route-handlers)
6. [Sécurisation des données côté client](#sécurisation-des-données-côté-client)
7. [Authentification et autorisation](#authentification-et-autorisation)
8. [Headers HTTP de sécurité](#headers-http-de-sécurité)
9. [Protection contre les attaques CSRF](#protection-contre-les-attaques-csrf)
10. [Validation et assainissement des entrées](#validation-et-assainissement-des-entrées)
11. [Journalisation et audit](#journalisation-et-audit)
12. [Gestion des uploads de fichiers](#gestion-des-uploads-de-fichiers)
13. [Base de données : bonnes pratiques](#base-de-données--bonnes-pratiques)
14. [Checklist de sécurité](#checklist-de-sécurité)

---

## Introduction

Next.js est un framework React full-stack qui exécute du code à la fois **côté serveur** et **côté client**. Cette dualité crée des risques spécifiques de fuite de données si les bonnes pratiques ne sont pas respectées.

Ce manuel couvre les menaces principales et les contre-mesures à appliquer dans tout projet Next.js en production.

---

## Les vecteurs de fuite les plus courants

| Vecteur | Description | Criticité |
|--------|-------------|-----------|
| Variables `.env` exposées côté client | Utilisation de `NEXT_PUBLIC_` sur des secrets | 🔴 Critique |
| Props passées depuis le serveur vers le client | Données sensibles sérialisées dans le HTML | 🔴 Critique |
| API routes sans vérification d'auth | Endpoints accessibles sans authentification | 🔴 Critique |
| Logs contenant des données sensibles | Clés API, mots de passe dans les logs | 🟠 Élevé |
| CORS mal configuré | Accès cross-origin non contrôlé | 🟠 Élevé |
| Uploads non validés | Exécution de fichiers malveillants | 🟠 Élevé |
| Requêtes SQL non paramétrées | Injection SQL | 🟠 Élevé |
| Tokens exposés dans l'URL | Historique de navigation, logs serveur | 🟡 Moyen |

---

## Variables d'environnement

### Règle fondamentale

Next.js expose **uniquement** les variables préfixées par `NEXT_PUBLIC_` au navigateur. Toutes les autres restent côté serveur.

```bash
# .env.local

# ✅ Variable SERVEUR uniquement — jamais envoyée au client
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=super_secret_key_512bits
STRIPE_SECRET_KEY=sk_live_...

# ⚠️ Variable exposée au NAVIGATEUR — ne jamais y mettre de secret
NEXT_PUBLIC_API_URL=https://api.monsite.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

### ❌ Mauvaise pratique

```bash
# NE JAMAIS FAIRE — le secret sera dans le bundle JS public
NEXT_PUBLIC_DATABASE_PASSWORD=monmotdepasse
NEXT_PUBLIC_JWT_SECRET=monsecret
```

### ✅ Vérification au démarrage

Créez un fichier `env.ts` pour valider les variables au boot :

```typescript
// lib/env.ts
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
  return value;
}

export const env = {
  // Serveur uniquement
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),

  // Client (préfixe NEXT_PUBLIC_)
  apiUrl: requireEnv('NEXT_PUBLIC_API_URL'),
};
```

### Ignorer les fichiers `.env` dans Git

```gitignore
# .gitignore
.env
.env.local
.env.development.local
.env.production.local
.env.*.local
```

---

## Exposition involontaire via les Server Components

### Le problème

Dans l'App Router, les Server Components peuvent passer des données au client via les props. Si vous ne filtrez pas, des données sensibles peuvent se retrouver **sérialisées dans le HTML** envoyé au navigateur.

### ❌ Exemple dangereux

```typescript
// app/profile/page.tsx (Server Component)
async function ProfilePage() {
  const user = await db.user.findUnique({ where: { id: session.userId } });

  // ❌ DANGER : passwordHash, internalNotes, etc. sont envoyés au client !
  return <ProfileClient user={user} />;
}
```

### ✅ Filtrage des données avant passage au client

```typescript
// app/profile/page.tsx (Server Component)
async function ProfilePage() {
  const user = await db.user.findUnique({
    where: { id: session.userId },
    // ✅ Ne sélectionner que les champs nécessaires
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      // passwordHash: false — exclu
      // internalNotes: false — exclu
    },
  });

  return <ProfileClient user={user} />;
}
```

### Utiliser un type DTO (Data Transfer Object)

```typescript
// types/user.dto.ts
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

// Fonction de transformation
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}
```

---

## API Routes et Route Handlers

### Vérification systématique de l'authentification

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // ✅ Toujours vérifier la session en premier
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true }, // Jamais le password !
  });

  return NextResponse.json(users);
}
```

### Limitation du débit (Rate Limiting)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requêtes / 10 secondes
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Configuration CORS stricte

```typescript
// app/api/data/route.ts
const ALLOWED_ORIGINS = [
  'https://monsite.com',
  'https://www.monsite.com',
];

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') ?? '';

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

---

## Sécurisation des données côté client

### Ne jamais stocker de secrets dans localStorage / sessionStorage

```typescript
// ❌ DANGER : accessible via JavaScript, vulnérable au XSS
localStorage.setItem('jwt_token', token);
localStorage.setItem('api_key', key);

// ✅ Utiliser des cookies HttpOnly (gérés côté serveur)
// Le serveur définit le cookie :
response.cookies.set('session', token, {
  httpOnly: true,   // Inaccessible via JavaScript
  secure: true,     // HTTPS uniquement
  sameSite: 'lax',  // Protection CSRF
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: '/',
});
```

### Content Security Policy (CSP)

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();
```

---

## Authentification et autorisation

### Middleware de protection des routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques : pas de vérification
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = await verifyToken(token);

    // Injecter l'utilisateur dans les headers pour les Route Handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalide ou expiré
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Vérification des autorisations par ressource (ABAC)

```typescript
// lib/permissions.ts
export async function canUserAccessDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  const document = await db.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true, sharedWith: true },
  });

  if (!document) return false;

  return (
    document.ownerId === userId ||
    document.sharedWith.includes(userId)
  );
}

// Utilisation dans un Route Handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get('x-user-id')!;

  const hasAccess = await canUserAccessDocument(userId, params.id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  // ... retourner le document
}
```

---

## Headers HTTP de sécurité

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Empêche le clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },

          // Empêche le sniffing de type MIME
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Active la protection XSS du navigateur
          { key: 'X-XSS-Protection', value: '1; mode=block' },

          // Contrôle les infos de référence
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Force HTTPS pendant 2 ans
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },

          // Restreint les API du navigateur
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Protection contre les attaques CSRF

### Avec les Server Actions

Les Server Actions de Next.js incluent une protection CSRF automatique via l'en-tête `Origin`. Assurez-vous cependant de :

```typescript
// app/actions/update-profile.ts
'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  // ✅ Toujours vérifier la session dans les Server Actions
  const session = await getSession();
  if (!session) {
    throw new Error('Non authentifié');
  }

  const name = formData.get('name') as string;

  // Valider et mettre à jour
  await db.user.update({
    where: { id: session.userId },
    data: { name },
  });

  revalidatePath('/profile');
}
```

### Token CSRF pour les API Routes classiques

```typescript
// lib/csrf.ts
import { createHmac, randomBytes } from 'crypto';

const SECRET = process.env.CSRF_SECRET!;

export function generateCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString('hex');
  const hmac = createHmac('sha256', SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest('hex');
  return `${nonce}:${hmac}`;
}

export function verifyCsrfToken(token: string, sessionId: string): boolean {
  const [nonce, hmac] = token.split(':');
  const expected = createHmac('sha256', SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest('hex');
  return hmac === expected;
}
```

---

## Validation et assainissement des entrées

### Avec Zod (recommandé)

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères invalides'),

  email: z.string().email('Adresse email invalide').toLowerCase(),

  password: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis')
    .regex(/[^a-zA-Z0-9]/, 'Au moins un caractère spécial requis'),
});

// Utilisation dans un Route Handler
export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // result.data est maintenant typé et validé
  const { name, email, password } = result.data;
  // ...
}
```

### Prévention de l'injection SQL avec Prisma

```typescript
// ❌ DANGER : injection SQL possible
const users = await db.$queryRaw(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ✅ Toujours utiliser les paramètres Prisma
const users = await db.user.findMany({
  where: { email: email },
});

// ✅ Ou avec $queryRaw paramétré
const users = await db.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

---

## Journalisation et audit

### Ne jamais logger de données sensibles

```typescript
// lib/logger.ts
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey', 'creditCard'];

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
        return [key, '[REDACTED]'];
      }
      if (typeof value === 'object' && value !== null) {
        return [key, sanitize(value as Record<string, unknown>)];
      }
      return [key, value];
    })
  );
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data: data ? sanitize(data) : undefined,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message: string, error?: unknown) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      // Ne pas logger le stack complet en production
      error: process.env.NODE_ENV === 'development' ? error : 'Internal error',
      timestamp: new Date().toISOString(),
    }));
  },
};
```

### Journal d'audit des accès sensibles

```typescript
// lib/audit.ts
export async function logAuditEvent({
  userId,
  action,
  resource,
  resourceId,
  metadata,
}: AuditEvent) {
  await db.auditLog.create({
    data: {
      userId,
      action, // 'READ', 'CREATE', 'UPDATE', 'DELETE'
      resource, // 'User', 'Document', etc.
      resourceId,
      metadata: JSON.stringify(metadata),
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
      createdAt: new Date(),
    },
  });
}
```

---

## Gestion des uploads de fichiers

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
  }

  // ✅ Vérifier le type MIME
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Type non autorisé. Types acceptés : ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // ✅ Vérifier la taille
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Fichier trop volumineux. Maximum : ${MAX_SIZE_MB} Mo` },
      { status: 400 }
    );
  }

  // ✅ Générer un nom de fichier aléatoire (pas celui d'origine !)
  const extension = file.name.split('.').pop()?.toLowerCase();
  const safeFilename = `${randomUUID()}.${extension}`;

  // ✅ Stocker hors du répertoire public
  const uploadDir = join(process.cwd(), 'private-uploads');
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, safeFilename), Buffer.from(bytes));

  // Enregistrer en base avec le nom d'origine pour l'affichage
  await db.file.create({
    data: {
      userId: session.userId,
      originalName: file.name,
      storedName: safeFilename,
      mimeType: file.type,
      size: file.size,
    },
  });

  return NextResponse.json({ success: true, fileId: safeFilename });
}
```

---

## Base de données : bonnes pratiques

### Principe du moindre privilège

```sql
-- Créer un utilisateur dédié avec droits limités
CREATE USER nextjs_app WITH PASSWORD 'mot_de_passe_fort';

-- Accorder uniquement les droits nécessaires
GRANT SELECT, INSERT, UPDATE ON TABLE users TO nextjs_app;
GRANT SELECT, INSERT ON TABLE audit_logs TO nextjs_app;

-- Jamais :
-- GRANT ALL PRIVILEGES ON DATABASE mydb TO nextjs_app;
-- GRANT SUPERUSER TO nextjs_app;
```

### Chiffrement des données sensibles

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Format : iv:tag:données
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, dataHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  return decipher.update(data) + decipher.final('utf8');
}

// Utilisation : chiffrer les données PII avant stockage
await db.user.create({
  data: {
    email: user.email,
    phoneNumber: encrypt(user.phoneNumber), // Chiffré en base
  },
});
```

---

## Checklist de sécurité

Utilisez cette liste avant chaque mise en production :

### Variables d'environnement
- [ ] Aucun secret dans les variables `NEXT_PUBLIC_*`
- [ ] Fichiers `.env*` dans `.gitignore`
- [ ] Variables d'environnement validées au démarrage
- [ ] Secrets rotatifs régulièrement

### API et Routes
- [ ] Toutes les routes protégées vérifient l'authentification
- [ ] Autorisations vérifiées par ressource (pas seulement par rôle)
- [ ] Rate limiting en place sur les endpoints sensibles
- [ ] CORS configuré strictement

### Données
- [ ] DTOs utilisés pour filtrer les données avant envoi au client
- [ ] Données sensibles chiffrées en base
- [ ] Requêtes SQL paramétrées (pas de concaténation)
- [ ] Données de log assainies (pas de mots de passe, tokens)

### Cookies et sessions
- [ ] Cookies de session en `HttpOnly`, `Secure`, `SameSite`
- [ ] Sessions invalidées à la déconnexion
- [ ] Durée de session raisonnable

### Uploads
- [ ] Types MIME vérifiés côté serveur
- [ ] Taille maximale imposée
- [ ] Noms de fichiers randomisés
- [ ] Fichiers stockés hors du répertoire public

### Configuration serveur
- [ ] Headers de sécurité HTTP configurés
- [ ] HTTPS forcé en production
- [ ] HSTS activé
- [ ] Dépendances auditées régulièrement (`npm audit`)
- [ ] Next.js à jour (version LTS)

### Monitoring
- [ ] Journaux d'audit pour les accès sensibles
- [ ] Alertes sur les tentatives d'accès inhabituelles
- [ ] Revue régulière des logs

---

## Ressources

- [Documentation officielle Next.js — Sécurité](https://nextjs.org/docs/app/building-your-application/authentication)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Zod — Validation de schémas](https://zod.dev)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [next-safe-action](https://next-safe-action.dev) — Server Actions sécurisées

---

*Manuel rédigé pour Next.js 14+ (App Router). Certaines pratiques s'appliquent également au Pages Router.*
