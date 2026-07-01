# Tutoriel : Configuration de la sécurité et de l'authentification

Ce tutoriel explique en détail la configuration de sécurité mise en place dans le projet, répartie sur trois fichiers :

1. `next.config.ts` — en-têtes de sécurité HTTP
2. `auth.ts` — authentification via NextAuth (Google)
3. `proxy.ts` (middleware) — protection des routes et Content Security Policy (CSP)

---

## 1. `next.config.ts` — Les en-têtes de sécurité HTTP

Ce fichier applique des en-têtes HTTP de sécurité à **toutes les routes** du site via la fonction `headers()` de Next.js.

```ts
async headers() {
  return [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ];
},
```

Le pattern `/:path*` signifie que ces en-têtes s'appliquent à **toutes les URLs** du site, sans exception.

### Détail de chaque en-tête

| En-tête | Valeur | Rôle |
|---|---|---|
| `X-Frame-Options` | `DENY` | Empêche le site d'être affiché dans une `<iframe>` sur un autre domaine. Protège contre le **clickjacking**. |
| `X-Content-Type-Options` | `nosniff` | Empêche le navigateur de deviner le type MIME d'un fichier. Évite qu'un fichier malveillant soit exécuté comme du JS ou du HTML. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limite les informations envoyées dans l'en-tête `Referer` lors de la navigation vers un autre site : seule l'origine (pas le chemin complet) est transmise en cross-origin. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Désactive explicitement l'accès à la caméra, au micro, à la géolocalisation et aux API de paiement pour toutes les pages du site. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force le navigateur à toujours utiliser HTTPS pendant 1 an (`max-age` en secondes), y compris pour les sous-domaines, et permet l'inscription du domaine dans la liste de préchargement HSTS des navigateurs. |

> 💡 Ces en-têtes constituent une **base de sécurité statique**, appliquée indépendamment de la logique métier. Ils ne bougent pas d'une requête à l'autre.

---

## 2. `auth.ts` — Authentification avec NextAuth

Ce fichier configure **NextAuth (Auth.js)** avec Google comme fournisseur d'identité (OAuth).

### Vérification des variables d'environnement

```ts
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_SECRET) {
  throw new Error("GOOGLE AUTH CONFIGURATION is not defined");
}
```

Cette vérification empêche l'application de démarrer si les variables essentielles ne sont pas définies — un **fail-fast** qui évite de déployer une app avec une auth mal configurée.

> ⚠️ Point d'attention : la condition vérifie `AUTH_GOOGLE_ID` et `AUTH_SECRET`, mais le provider utilise aussi `AUTH_GOOGLE_SECRET` (`clientSecret`) qui n'est pas vérifié dans ce `if`. Si cette variable manque, l'erreur ne sera pas détectée au démarrage.

### Le provider Google

```ts
providers: [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),
],
```

Configure l'authentification OAuth2 via Google. Les identifiants (`clientId` / `clientSecret`) sont obtenus depuis la [Google Cloud Console](https://console.cloud.google.com/) et stockés en variables d'environnement (jamais en dur dans le code).

### Page de connexion personnalisée

```ts
pages: {
  signIn: "/login",
},
```

Redirige vers une page `/login` personnalisée plutôt que vers la page par défaut de NextAuth.

### Callback d'autorisation

```ts
callbacks: {
  authorized({ auth }) {
    return !!auth?.user;
  },
},
```

Ce callback est utilisé par NextAuth (notamment en middleware) pour décider si une requête est autorisée :
- `true` → accès autorisé
- `false` → redirection automatique vers la page de login

Ici, la règle est simple : **il faut être connecté** (`auth.user` existe) pour être autorisé.

---

## 3. `proxy.ts` — Middleware : protection des routes et CSP

Ce fichier est le **middleware Next.js**, exécuté avant chaque requête matchée. Il a deux responsabilités distinctes :

### a) Protection de la route `/dashboard`

```ts
const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

if (isDashboard && !req.auth?.user) {
  const loginUrl = new URL("/login", req.nextUrl.origin);
  return NextResponse.redirect(loginUrl);
}
```

Toute route commençant par `/dashboard` nécessite une session active. Sans utilisateur connecté, la requête est redirigée vers `/login`.

> Notez que cette logique est **indépendante** du callback `authorized` défini dans `auth.ts` — ici c'est une vérification manuelle explicite dans le middleware lui-même.

### b) Génération d'une Content Security Policy (CSP) dynamique

Contrairement aux en-têtes statiques de `next.config.ts`, la CSP est générée **à chaque requête** car elle inclut un **nonce** unique.

#### Le nonce

```ts
const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
```

Un nonce est une valeur aléatoire à usage unique, générée pour chaque requête. Il permet d'autoriser des scripts spécifiques (ceux qui portent l'attribut `nonce="..."` correspondant) sans avoir à autoriser `'unsafe-inline'`, ce qui bloquerait toute injection de script externe.

#### Construction de la CSP

```ts
const csp = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""} 'strict-dynamic';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://*.vercel-insights.com ${isDev ? "ws: wss:" : ""};
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`;
```

| Directive | Valeur | Effet |
|---|---|---|
| `default-src` | `'self'` | Par défaut, seules les ressources du même domaine sont autorisées. |
| `script-src` | `'self' 'nonce-...' 'strict-dynamic'` (+ `'unsafe-eval'` en dev) | Seuls les scripts du domaine ou portant le bon nonce sont exécutés. `strict-dynamic` permet aux scripts de confiance de charger d'autres scripts dynamiquement. `unsafe-eval` est activé uniquement en développement (souvent requis par les outils de dev/HMR). |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Autorise les styles du domaine, les styles inline, et Google Fonts. |
| `img-src` | `'self' data: https:` | Autorise les images locales, en base64 (`data:`) et depuis n'importe quelle source HTTPS. |
| `font-src` | `'self' https://fonts.gstatic.com` | Polices locales + Google Fonts. |
| `connect-src` | domaines Google Analytics, Clarity, Vercel Insights (+ `ws:`/`wss:` en dev) | Restreint les requêtes réseau (fetch, XHR, WebSocket) à ces domaines précis. Les WebSockets sont autorisés en dev pour le hot-reload. |
| `object-src` | `'none'` | Bloque les plugins type Flash/Java (`<object>`, `<embed>`). |
| `frame-ancestors` | `'none'` | Équivalent CSP de `X-Frame-Options: DENY` — personne ne peut embarquer le site dans une iframe. |
| `base-uri` | `'self'` | Empêche l'injection d'une balise `<base>` pointant vers un autre domaine. |
| `form-action` | `'self'` | Les formulaires ne peuvent soumettre que vers le domaine lui-même. |
| `upgrade-insecure-requests` | — | Force la conversion automatique des requêtes HTTP en HTTPS. |

#### Transmission du nonce à l'application

```ts
const requestHeaders = new Headers(req.headers);
requestHeaders.set("x-nonce", nonce);
requestHeaders.set("Content-Security-Policy", csp);

const response = NextResponse.next({
  request: { headers: requestHeaders },
});
response.headers.set("Content-Security-Policy", csp);
```

Le nonce est transmis de deux façons :
1. Dans les **headers de la requête** (`x-nonce`) — pour que les composants serveur (layouts, pages) puissent le lire et l'injecter dans les balises `<script nonce="...">`.
2. Dans les **headers de la réponse** (`Content-Security-Policy`) — pour que le navigateur applique effectivement la politique.

> Pour que la CSP fonctionne réellement, il faut que chaque `<script>` inline du site utilise ce nonce, généralement récupéré via `headers()` dans un composant serveur Next.js.

### Le matcher

```ts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

Le middleware s'exécute sur **toutes les routes sauf** :
- `/api/*` (les routes API, souvent gérées différemment)
- `/_next/static/*` et `/_next/image/*` (fichiers statiques et images optimisées de Next.js)
- `/favicon.ico`

Cela évite d'appliquer inutilement la logique d'auth et de CSP sur des ressources statiques ou des endpoints API qui ont leurs propres règles.

---

## 4. Vue d'ensemble : comment ces trois fichiers s'articulent

```
Requête entrante
      │
      ▼
┌─────────────────────────┐
│  next.config.ts          │  → ajoute les en-têtes statiques
│  (X-Frame-Options, HSTS, │     (toujours, sur toutes les routes)
│   Permissions-Policy...) │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│  proxy.ts (middleware)   │  → 1. vérifie l'auth si /dashboard
│  utilise auth() défini   │     2. génère un nonce + CSP dynamique
│  dans auth.ts            │     3. redirige vers /login si non connecté
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│  auth.ts (NextAuth)      │  → fournit req.auth.user
│  Provider Google         │     et le callback authorized()
└─────────────────────────┘
      │
      ▼
   Page rendue avec
   les en-têtes de sécurité
   + CSP + nonce appliqués
```

**En résumé :**
- `next.config.ts` pose une **base de sécurité générale et statique**.
- `auth.ts` définit **qui peut se connecter** et **comment** (Google OAuth).
- `proxy.ts` **applique** cette authentification sur les routes sensibles et ajoute une **CSP dynamique** propre à chaque requête grâce au nonce.

---

## 5. Points de vigilance / axes d'amélioration possibles

- ✅ **Bonne pratique** : `frame-ancestors 'none'` en CSP est redondant avec `X-Frame-Options: DENY` mais c'est volontaire — CSP prime sur les anciens navigateurs qui ne supportent que `X-Frame-Options`.
- ⚠️ La vérification de démarrage dans `auth.ts` n'inclut pas `AUTH_GOOGLE_SECRET` — à ajouter pour un fail-fast complet.
- ⚠️ `style-src 'unsafe-inline'` reste une ouverture assez large ; envisager un nonce pour les styles aussi si possible, ou une stratégie CSS-in-JS compatible CSP stricte.
- 💡 Pensez à vérifier que `x-nonce` est bien lu côté layout/page pour injecter le nonce dans les balises `<script>` du site, sinon la CSP bloquera les scripts inline légitimes.
