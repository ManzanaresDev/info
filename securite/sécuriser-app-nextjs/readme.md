# 🔒 Guide complet de sécurisation d'une application Next.js

Ce document présente l'ensemble des mécanismes de sécurité mis en place dans le projet ainsi que les bonnes pratiques recommandées pour une application **Next.js (App Router)** moderne.

Il couvre :

- la configuration des en-têtes HTTP de sécurité ;
- l'authentification avec Auth.js (NextAuth) ;
- la protection des routes via un middleware ;
- la mise en place d'une Content Security Policy (CSP) avec nonce ;
- la sécurisation des cookies et des données côté client ;
- la gestion sûre des variables d'environnement ;
- la prévention des fuites de données via les Server Components ;
- la sécurisation des API Routes / Route Handlers (auth, autorisation, CORS) ;
- la protection contre les attaques CSRF ;
- la validation des données utilisateur ;
- le rate limiting ;
- la protection des formulaires contre les bots (technique Honeypot) ;
- la journalisation et l'audit ;
- la gestion sécurisée des uploads de fichiers ;
- les bonnes pratiques de base de données (moindre privilège, chiffrement) ;
- les bonnes pratiques de maintenance et de vérification.

---

# Architecture générale

La sécurité repose sur trois fichiers principaux :

| Fichier                      | Rôle                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `next.config.ts`             | Configure les en-têtes HTTP de sécurité appliqués à toutes les routes                            |
| `auth.ts`                    | Configure Auth.js (NextAuth), Google OAuth et la gestion des sessions                            |
| `proxy.ts` / `middleware.ts` | Protège les routes sensibles, génère un nonce CSP et applique la politique de sécurité dynamique |

En complément, plusieurs bonnes pratiques applicatives sont mises en œuvre :

- cookies sécurisés ;
- validation des entrées utilisateur ;
- rate limiting ;
- protection anti-bot des formulaires (honeypot) ;
- gestion des dépendances ;
- vérifications de sécurité.

---

# Vue d'ensemble

```text
                 Requête HTTP
                      │
                      ▼
        ┌────────────────────────────┐
        │ next.config.ts             │
        │ Headers HTTP statiques     │
        │ HSTS, XFO, Permissions...  │
        └────────────────────────────┘
                      │
                      ▼
        ┌────────────────────────────┐
        │ proxy.ts / middleware.ts   │
        │ • vérifie les routes       │
        │ • génère un nonce CSP      │
        │ • applique la CSP          │
        │ • redirections             │
        └────────────────────────────┘
                      │
                      ▼
        ┌────────────────────────────┐
        │ auth.ts                    │
        │ Auth.js / Google OAuth     │
        │ req.auth.user              │
        └────────────────────────────┘
                      │
                      ▼
                Rendu de la page
                      │
                      ▼
        ┌────────────────────────────┐
        │ Formulaires côté client    │
        │ • Honeypot                 │
        │ • Rate limiting            │
        │ • CSRF token                │
        └────────────────────────────┘
```

---

# 1. Configuration des headers HTTP

Le fichier `next.config.ts` applique des en-têtes de sécurité à toutes les routes :

```ts
async headers() {
  return [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ];
}
```

Le pattern `/:path*` signifie que les headers sont appliqués sur **l'ensemble du site**.

## Headers utilisés

| Header                            | Objectif                                       |
| --------------------------------- | ---------------------------------------------- |
| `Strict-Transport-Security`       | Force l'utilisation du HTTPS                   |
| `X-Frame-Options: DENY`           | Protège contre le clickjacking                 |
| `X-Content-Type-Options: nosniff` | Empêche le MIME Sniffing                       |
| `Referrer-Policy`                 | Limite les informations envoyées au site cible |
| `Permissions-Policy`              | Désactive les API navigateur inutiles          |
| `Cross-Origin-Opener-Policy`      | Isolation des contextes de navigation          |
| `Cross-Origin-Resource-Policy`    | Protection des ressources                      |
| `Content-Security-Policy`         | Contrôle le chargement des ressources          |

Ces headers constituent la **première ligne de défense** de l'application.

---

# 2. Variables d'environnement

## Règle fondamentale

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

## ❌ Mauvaise pratique

```bash
# NE JAMAIS FAIRE — le secret sera dans le bundle JS public
NEXT_PUBLIC_DATABASE_PASSWORD=monmotdepasse
NEXT_PUBLIC_JWT_SECRET=monsecret
```

## ✅ Vérification au démarrage

La bonne pratique **fail-fast** consiste à valider la présence des variables requises dès le boot de l'application, pour éviter un déploiement avec une configuration incomplète.

Créez un fichier `env.ts` dédié :

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
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),

  // Client (préfixe NEXT_PUBLIC_)
  apiUrl: requireEnv("NEXT_PUBLIC_API_URL"),
};
```

Le même principe s'applique aux identifiants d'authentification (voir section suivante) :

```ts
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_SECRET) {
    throw new Error(...)
}
```

Il est recommandé de vérifier également `AUTH_GOOGLE_SECRET`.

## Ignorer les fichiers `.env` dans Git

```gitignore
# .gitignore
.env
.env.local
.env.development.local
.env.production.local
.env.*.local
```

---

# 3. Authentification

L'application utilise **Auth.js (NextAuth)** avec Google OAuth.

---

## Configuration du provider

```ts
Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
});
```

Les identifiants sont stockés uniquement dans les variables d'environnement.

---

## Page de connexion

```ts
pages: {
  signIn: "/login";
}
```

Une page personnalisée remplace la page par défaut de NextAuth.

---

## Callback `authorized`

```ts
authorized({ auth }) {
    return !!auth?.user;
}
```

Une requête est autorisée uniquement lorsqu'un utilisateur authentifié est présent.

---

# 3. Middleware de sécurité

Le middleware intervient avant le rendu de la page.

Ses responsabilités sont :

- protéger les routes privées ;
- générer un nonce CSP ;
- appliquer la politique CSP ;
- transmettre le nonce à l'application.

---

## Protection des routes

Exemple :

```ts
if (isDashboard && !req.auth?.user) {
    return NextResponse.redirect(...)
}
```

Toutes les routes commençant par :

```
/dashboard
```

nécessitent une session valide.

## Autre implémentation possible (JWT manuel)

Selon la stratégie d'authentification retenue (session Auth.js ou JWT géré manuellement), le middleware peut aussi vérifier et décoder un token, puis injecter l'identité de l'utilisateur dans les headers pour les Route Handlers :

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques : pas de vérification
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyToken(token);

    // Injecter l'utilisateur dans les headers pour les Route Handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalide ou expiré
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Autorisation par ressource (ABAC)

Vérifier qu'un utilisateur est authentifié ne suffit pas : il faut aussi vérifier qu'il a **le droit d'accéder à la ressource précise** qu'il demande (Attribute-Based Access Control), et pas seulement se fier à son rôle global.

```typescript
// lib/permissions.ts
export async function canUserAccessDocument(
  userId: string,
  documentId: string,
): Promise<boolean> {
  const document = await db.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true, sharedWith: true },
  });

  if (!document) return false;

  return document.ownerId === userId || document.sharedWith.includes(userId);
}

// Utilisation dans un Route Handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const userId = request.headers.get("x-user-id")!;

  const hasAccess = await canUserAccessDocument(userId, params.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  // ... retourner le document
}
```

---

# 4. Exposition involontaire via les Server Components

## Le problème

Dans l'App Router, les Server Components peuvent passer des données au client via les props. Si vous ne filtrez pas, des données sensibles peuvent se retrouver **sérialisées dans le HTML** envoyé au navigateur.

## ❌ Exemple dangereux

```typescript
// app/profile/page.tsx (Server Component)
async function ProfilePage() {
  const user = await db.user.findUnique({ where: { id: session.userId } });

  // ❌ DANGER : passwordHash, internalNotes, etc. sont envoyés au client !
  return <ProfileClient user={user} />;
}
```

## ✅ Filtrage des données avant passage au client

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

## Utiliser un type DTO (Data Transfer Object)

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

# 5. Content Security Policy (CSP)

La CSP est générée **à chaque requête**.

Contrairement aux autres headers, elle contient un **nonce** aléatoire.

## Génération du nonce

```ts
const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
```

Chaque requête possède donc un nonce différent.

---

## Pourquoi utiliser un nonce ?

Sans nonce, les scripts inline sont interdits.

Le nonce permet :

- d'autoriser uniquement les scripts légitimes ;
- d'empêcher les attaques XSS ;
- d'éviter l'utilisation de `unsafe-inline`.

---

## Principales directives CSP

| Directive                 | Rôle                                 |
| ------------------------- | ------------------------------------ |
| default-src               | ressources locales uniquement        |
| script-src                | scripts autorisés                    |
| style-src                 | feuilles de style                    |
| img-src                   | images                               |
| font-src                  | polices                              |
| connect-src               | appels réseau                        |
| object-src                | désactive Flash/Object               |
| frame-ancestors           | interdit les iframes                 |
| form-action               | protège les formulaires              |
| base-uri                  | interdit la modification de `<base>` |
| upgrade-insecure-requests | force HTTPS                          |

---

# 5. Transmission du nonce

Le nonce est ajouté dans les headers :

```ts
requestHeaders.set("x-nonce", nonce);
```

Puis la CSP est renvoyée au navigateur :

```ts
response.headers.set("Content-Security-Policy", csp);
```

Les composants serveur peuvent ensuite récupérer :

```ts
headers().get("x-nonce");
```

pour injecter :

```html
<script nonce="...">
```

---

# 6. Cookies sécurisés et données côté client

## Ne jamais stocker de secrets dans localStorage / sessionStorage

```typescript
// ❌ DANGER : accessible via JavaScript, vulnérable au XSS
localStorage.setItem("jwt_token", token);
localStorage.setItem("api_key", key);
```

Un jeton ou une clé stockés dans `localStorage`/`sessionStorage` sont lisibles par n'importe quel script exécuté sur la page — y compris un script injecté via une faille XSS. La bonne pratique est d'utiliser des cookies `HttpOnly`, inaccessibles en JavaScript et gérés côté serveur :

```ts
cookies().set("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
```

## Recommandations

- `HttpOnly`
- `Secure`
- `SameSite`
- durée limitée
- révocation côté serveur

---

# 7. API Routes, Route Handlers et CORS

## Vérification systématique de l'authentification

Toute route sensible doit vérifier la session **avant** tout traitement, puis restreindre explicitement les champs renvoyés :

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // ✅ Toujours vérifier la session en premier
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true }, // Jamais le password !
  });

  return NextResponse.json(users);
}
```

## Configuration CORS stricte

Un CORS mal configuré (origine reflétée sans validation, `*` avec credentials) permet à un site tiers de lire les réponses de votre API pour un utilisateur authentifié.

```typescript
// app/api/data/route.ts
const ALLOWED_ORIGINS = ["https://monsite.com", "https://www.monsite.com"];

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
```

---

# 8. Protection contre les attaques CSRF

## Avec les Server Actions

Les Server Actions de Next.js incluent une protection CSRF automatique via l'en-tête `Origin`. Il faut malgré tout systématiquement revérifier la session à l'intérieur de l'action, car une Server Action reste un point d'entrée exécutable :

```typescript
// app/actions/update-profile.ts
"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  // ✅ Toujours vérifier la session dans les Server Actions
  const session = await getSession();
  if (!session) {
    throw new Error("Non authentifié");
  }

  const name = formData.get("name") as string;

  // Valider et mettre à jour
  await db.user.update({
    where: { id: session.userId },
    data: { name },
  });

  revalidatePath("/profile");
}
```

## Token CSRF pour les API Routes classiques

Pour les endpoints qui ne passent pas par les Server Actions (API Routes traditionnelles appelées depuis un formulaire HTML classique), un token CSRF signé (HMAC) reste nécessaire :

```typescript
// lib/csrf.ts
import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.CSRF_SECRET!;

export function generateCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const hmac = createHmac("sha256", SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest("hex");
  return `${nonce}:${hmac}`;
}

export function verifyCsrfToken(token: string, sessionId: string): boolean {
  const [nonce, hmac] = token.split(":");
  const expected = createHmac("sha256", SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest("hex");
  return hmac === expected;
}
```

---

# 9. Validation des données

Toutes les données provenant de l'utilisateur doivent être validées, sur les routes API, les Server Actions, les paramètres d'URL et les paramètres de requête.

## Avec Zod (recommandé)

```typescript
// schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Caractères invalides"),

  email: z.string().email("Adresse email invalide").toLowerCase(),

  password: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule requise")
    .regex(/[0-9]/, "Au moins un chiffre requis")
    .regex(/[^a-zA-Z0-9]/, "Au moins un caractère spécial requis"),
});

// Utilisation dans un Route Handler
export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 },
    );
  }

  // result.data est maintenant typé et validé
  const { name, email, password } = result.data;
  // ...
}
```

## Prévention de l'injection SQL avec Prisma

```typescript
// ❌ DANGER : injection SQL possible
const users = await db.$queryRaw(
  `SELECT * FROM users WHERE email = '${email}'`,
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

# 10. Rate limiting

Les routes sensibles doivent être protégées :

- login ;
- reset password ;
- endpoints publics.

Une implémentation mémoire est suffisante en développement.

En production, préférer :

- Upstash Redis ;
- rate-limiter-flexible.

---

# 9. Protection des formulaires contre les bots (Honeypot)

En complément de la validation des données et du rate limiting, une technique **Honeypot** permet de filtrer efficacement les soumissions automatisées de formulaires, sans friction pour l'utilisateur et sans dépendance externe (contrairement aux CAPTCHAs).

## Qu'est-ce qu'un Honeypot ?

Un **honeypot** (littéralement « pot de miel ») est un champ piège invisible ajouté à un formulaire pour détecter les bots automatisés. Le principe :

- Un **humain** ne voit pas le champ (il est caché) → il le laisse vide.
- Un **bot** remplit tous les champs qu'il trouve dans le DOM → il remplit le champ piège.
- Si le champ est rempli à la soumission → c'est un bot → on rejette la requête.

## Pourquoi placer le champ hors écran plutôt qu'en `display: none` ?

C'est la subtilité clé de cette technique :

```html
<!-- ❌ Moins efficace -->
<div style="display: none;">
  <input type="text" name="website" />
</div>

<!-- ✅ Plus efficace -->
<div style="position: absolute; left: -9999px;" aria-hidden="true">
  <input type="text" name="website" />
</div>
```

Beaucoup de bots modernes sont entraînés à **ignorer les champs masqués par CSS** (`display: none`, `visibility: hidden`, `opacity: 0`). En revanche, un champ positionné à `-9999px` de l'écran est **présent dans le DOM, visuellement absent** — les bots moins sophistiqués le remplissent sans hésiter.

| Méthode                             | Invisible à l'utilisateur | Détecté par un bot basique | Détecté par un bot avancé |
| ----------------------------------- | ------------------------- | -------------------------- | ------------------------- |
| `display: none`                     | ✅                        | ⚠️ Parfois ignoré          | ❌ Souvent ignoré         |
| `visibility: hidden`                | ✅                        | ⚠️ Parfois ignoré          | ❌ Souvent ignoré         |
| `position: absolute; left: -9999px` | ✅                        | ✅ Souvent rempli          | ⚠️ Parfois ignoré         |

> **Note :** L'attribut `aria-hidden="true"` est important pour l'accessibilité — il indique aux lecteurs d'écran d'ignorer ce champ, évitant toute confusion pour les utilisateurs malvoyants.

## Implémentation

### HTML / CSS vanilla

```html
<form action="/submit" method="POST">
  <!-- Champ honeypot hors écran -->
  <div class="honeypot-wrapper" aria-hidden="true" tabindex="-1">
    <label for="website">Ne pas remplir ce champ</label>
    <input
      type="text"
      id="website"
      name="website"
      tabindex="-1"
      autocomplete="off"
    />
  </div>

  <!-- Champs normaux du formulaire -->
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Envoyer</button>
</form>
```

```css
.honeypot-wrapper {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

### React (avec Tailwind CSS)

```jsx
function ContactForm() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
    website: "", // champ honeypot
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérification côté client (optionnel, la vraie vérification est côté serveur)
    if (formData.website !== "") {
      console.log("Bot détecté, soumission ignorée.");
      return;
    }

    // Envoi normal du formulaire
    submitForm({ email: formData.email, message: formData.message });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Champ honeypot — hors écran */}
      <div
        className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Ne pas remplir</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
      </div>

      {/* Champs normaux */}
      <input
        type="email"
        name="email"
        placeholder="Votre email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <textarea
        name="message"
        placeholder="Votre message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />

      <button type="submit">Envoyer</button>
    </form>
  );
}
```

## Vérification côté serveur

La vérification **doit** se faire côté serveur. La validation côté client est triviale à contourner.

### Node.js / Express

```js
app.post("/submit", (req, res) => {
  const { email, message, website } = req.body;

  // Si le champ honeypot est rempli → bot
  if (website && website.trim() !== "") {
    return res.status(400).json({ error: "Soumission rejetée." });
    // OU simplement faire semblant d'accepter pour ne pas alerter le bot :
    // return res.status(200).json({ success: true });
  }

  // Traitement normal
  saveToDatabase({ email, message });
  res.status(200).json({ success: true });
});
```

### PHP

```php
<?php
$honeypot = $_POST['website'] ?? '';

if (!empty($honeypot)) {
    // Bot détecté — on rejette silencieusement
    http_response_code(200); // On fait semblant d'accepter
    exit;
}

// Traitement normal du formulaire
$email   = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$message = htmlspecialchars($_POST['message'] ?? '');
// ...
```

> **Astuce :** Renvoyer un `200 OK` même pour les bots (plutôt qu'une erreur) évite qu'ils adaptent leur comportement et réessaient avec d'autres méthodes.

## Bonnes pratiques

### Nommer le champ de façon crédible

Évitez les noms trop évidents comme `honeypot` ou `trap`. Préférez des noms qui semblent légitimes à un bot :

```html
<!-- ✅ Crédible pour un bot -->
<input type="text" name="website" />
<input type="text" name="url" />
<input type="text" name="phone_number" />

<!-- ❌ Trop évident -->
<input type="text" name="honeypot" />
<input type="text" name="bot_trap" />
```

### Toujours ajouter `tabindex="-1"`

Empêche les utilisateurs naviguant au clavier de tomber accidentellement dans le champ.

```html
<input type="text" name="website" tabindex="-1" />
```

### Toujours ajouter `autocomplete="off"`

Évite que le navigateur propose une valeur à l'utilisateur (ce qui ferait un faux positif).

```html
<input type="text" name="website" autocomplete="off" />
```

### Ne jamais marquer le champ comme `required`

Un humain ne le verrait pas et ne pourrait pas soumettre le formulaire.

## Limites de la technique

| Limitation               | Explication                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Bots sophistiqués**    | Les bots avancés analysent le DOM et détectent les champs hors écran                      |
| **Faux positifs rares**  | Un gestionnaire de mots de passe ou un outil d'auto-remplissage pourrait remplir le champ |
| **Protection partielle** | Ne remplace pas une vraie solution anti-spam pour les formulaires très exposés            |

## Combinaison avec d'autres protections

Le honeypot est efficace en première ligne, mais se combine bien avec les autres mécanismes présentés dans ce guide :

- **Vérification de l'origine** (`Referer`, `Origin` headers)
- **Rate limiting** (section 8) — limiter le nombre de soumissions par IP
- **Token CSRF** — protège contre les soumissions forgées
- **reCAPTCHA v3 (invisible)** — pour les formulaires très ciblés par les bots

```
Honeypot → Rate limiting → CSRF token → (optionnel) reCAPTCHA
```

## Récapitulatif Honeypot

```
✅ Champ texte avec un nom crédible (website, url...)
✅ Positionné hors écran avec position: absolute; left: -9999px
✅ aria-hidden="true" pour l'accessibilité
✅ tabindex="-1" pour la navigation clavier
✅ autocomplete="off" pour éviter les auto-remplissages
✅ Vérification côté serveur (jamais uniquement côté client)
✅ Réponse 200 même pour les bots (discrétion)
```

La technique honeypot est une protection simple, sans friction, qui filtre efficacement la majorité des bots automatisés avec très peu de code.

---

# 10. Sécurité des dépendances

Bonnes pratiques :

- Dependabot
- Renovate
- `npm audit`
- `pnpm audit`

Éviter les bibliothèques non maintenues.

---

# 11. Checklist de sécurité

## Headers

- [ ] poweredByHeader désactivé
- [ ] CSP configurée
- [ ] HSTS
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] COOP
- [ ] CORP

## Cookies

- [ ] Secure
- [ ] HttpOnly
- [ ] SameSite
- [ ] expiration limitée

## Validation

- [ ] Validation Zod
- [ ] Sanitization HTML
- [ ] erreurs génériques

## Authentification

- [ ] mots de passe hashés
- [ ] limitation des tentatives
- [ ] 2FA si nécessaire
- [ ] sessions révocables

## Protection

- [ ] middleware actif
- [ ] rate limiting
- [ ] protection CSRF
- [ ] honeypot sur les formulaires publics

## Maintenance

- [ ] dépendances à jour
- [ ] audit automatique
- [ ] variables d'environnement hors du dépôt
- [ ] logs sans données sensibles

---

# 12. Points d'attention

## ✅ Bonnes pratiques déjà présentes

- CSP avec nonce
- HSTS
- X-Frame-Options
- Permissions-Policy
- Referrer-Policy
- Middleware de protection
- Google OAuth

## Améliorations possibles

- vérifier également `AUTH_GOOGLE_SECRET` au démarrage ;
- remplacer progressivement `style-src 'unsafe-inline'` par une stratégie basée sur un nonce ;
- mettre en place un véritable rate limiting distribué (Redis/Upstash) ;
- ajouter une CSP `report-only` avant un passage en mode strict ;
- vérifier que tous les scripts inline utilisent bien le nonce généré ;
- ajouter un champ honeypot sur les formulaires publics exposés (contact, inscription).

---

# 13. Ressources

- Documentation Next.js — Headers
- Documentation Auth.js
- OWASP Secure Headers Project
- OWASP ASVS
- OWASP Top 10
- securityheaders.com
- Mozilla Observatory

---

# Conclusion

La sécurité de l'application repose sur plusieurs couches complémentaires :

1. **Headers HTTP** pour sécuriser le transport.
2. **Auth.js** pour gérer l'authentification.
3. **Middleware** pour contrôler les accès et appliquer une CSP dynamique.
4. **Validation des données** pour empêcher les entrées malveillantes.
5. **Cookies sécurisés** pour protéger les sessions.
6. **Rate limiting** pour limiter les abus.
7. **Honeypot** pour filtrer les soumissions de formulaires par des bots.
8. **Maintenance continue** afin de conserver un niveau de sécurité élevé.

Cette approche « Defense in Depth » permet de réduire significativement la surface d'attaque tout en conservant une architecture claire et maintenable.
