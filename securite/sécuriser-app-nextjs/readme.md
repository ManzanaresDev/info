# 🔒 Guide de sécurisation d'une application Next.js

Ce guide couvre la configuration des headers de sécurité, des cookies, de la validation, du rate limiting et du middleware pour une application Next.js moderne (App Router).

---

## 1. Étapes à suivre

### Étape 1 — Configurer `next.config.ts`
Désactiver le header `X-Powered-By` et ajouter les headers de sécurité HTTP (CSP, HSTS, etc.) — voir section 3.

### Étape 2 — Mettre en place un middleware de sécurité
Créer un `middleware.ts` à la racine pour générer un `nonce` CSP par requête, appliquer du rate limiting basique et vérifier les routes sensibles.

### Étape 3 — Sécuriser les cookies
Pour toute session ou token, utiliser systématiquement :
```ts
cookies().set('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax', // ou 'strict' selon le besoin
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
});
```

### Étape 4 — Valider toutes les entrées utilisateur
Utiliser Zod (ou équivalent) sur **chaque** route API / Server Action recevant des données externes :
```ts
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

const result = schema.safeParse(await req.json());
if (!result.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}
```

### Étape 5 — Rate limiting sur les routes sensibles
Appliquer un rate limiting (login, reset password, endpoints publics) via un middleware ou une lib type `@upstash/ratelimit` / `rate-limiter-flexible`.

### Étape 6 — Authentification
- Hasher les mots de passe avec `bcrypt` ou `argon2` (jamais de hash maison).
- Limiter les tentatives de connexion.
- Utiliser des tokens courts + refresh tokens si JWT.
- Invalider les sessions côté serveur (pas seulement côté client).

### Étape 7 — Dépendances
- Activer Dependabot / Renovate.
- Lancer régulièrement `npm audit` ou `pnpm audit`.
- Éviter les dépendances non maintenues.

### Étape 8 — Tests de vérification
- Vérifier les headers avec [securityheaders.com](https://securityheaders.com) ou `curl -I`.
- Tester la CSP en mode `report-only` avant passage en `enforce`.
- Vérifier qu'aucune donnée sensible ne fuit dans les logs ou les réponses d'erreur.

---

## 2. ✅ Checklist de validation

### Headers HTTP
- [ ] `poweredByHeader: false` dans `next.config.ts`
- [ ] `Content-Security-Policy` configurée avec `nonce`
- [ ] `Strict-Transport-Security` (HSTS) activé
- [ ] `Referrer-Policy` définie (`strict-origin-when-cross-origin` recommandé)
- [ ] `Permissions-Policy` restrictive (désactive caméra/micro/géoloc si non utilisés)
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] `Cross-Origin-Resource-Policy: same-origin`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (ou géré via CSP `frame-ancestors`)

### Cookies & sessions
- [ ] Cookies `Secure`
- [ ] Cookies `HttpOnly`
- [ ] Cookies `SameSite` défini explicitement
- [ ] Durée de vie des sessions limitée et renouvelée
- [ ] Sessions révocables côté serveur

### Validation & API
- [ ] Validation Zod (ou équivalent) sur toutes les entrées (body, query, params)
- [ ] Sanitization des sorties HTML si contenu utilisateur affiché
- [ ] Messages d'erreur génériques (pas de stack trace en prod)

### Protection applicative
- [ ] Rate limiting sur login / signup / reset password
- [ ] Rate limiting sur les routes API publiques
- [ ] Middleware de sécurité actif (`middleware.ts`)
- [ ] Protection CSRF sur les mutations sensibles (si cookies de session utilisés)

### Authentification
- [ ] Mots de passe hashés (bcrypt/argon2)
- [ ] Politique de mot de passe minimale appliquée
- [ ] 2FA disponible pour comptes sensibles (si pertinent)
- [ ] Verrouillage après N tentatives échouées

### Maintenance
- [ ] Dépendances à jour
- [ ] Audit de sécurité automatisé (CI)
- [ ] Variables d'environnement hors du code source (`.env` non commité)
- [ ] Logs sans données sensibles (mots de passe, tokens)

### Vérification finale
- [ ] Headers testés sur [securityheaders.com](https://securityheaders.com)
- [ ] CSP testée en `report-only` puis passée en `enforce`
- [ ] Scan de vulnérabilités (`npm audit`, Snyk, etc.) sans faille critique

---

## 3. Configuration `next.config.ts`

```ts
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const cspDirectives = [
  "default-src 'self'",
  // En dev, Next.js a besoin de 'unsafe-eval' pour le HMR
  `script-src 'self' 'nonce-{NONCE}'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'", // idéalement, utiliser aussi un nonce pour les styles
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspDirectives,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Applique les headers à toutes les routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

> ⚠️ Le placeholder `{NONCE}` dans la CSP doit être remplacé dynamiquement à chaque requête via le middleware (voir section 4), car `next.config.ts` est statique et ne peut pas générer de valeur aléatoire par requête.

---

## 4. Exemple de `middleware.ts` (nonce CSP + rate limiting basique)

```ts
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting en mémoire (à remplacer par Redis/Upstash en production multi-instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Rate limiting sur les routes sensibles
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Remplace le placeholder CSP par le nonce généré
  const csp = response.headers.get('Content-Security-Policy');
  if (csp) {
    response.headers.set(
      'Content-Security-Policy',
      csp.replace('{NONCE}', nonce)
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Dans vos composants serveur, récupérez le nonce via les headers pour l'injecter dans vos balises `<script>` si nécessaire.

---

## 5. Ressources complémentaires

- [Documentation Next.js — Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [securityheaders.com](https://securityheaders.com) — pour tester vos headers en production

---

**Rappel important** : ces mesures couvrent la couche transport/HTTP et les bonnes pratiques applicatives génériques. La sécurité de l'authentification, de la logique métier et des autorisations (contrôle d'accès) doit être auditée séparément, car elle dépend entièrement de votre implémentation.
