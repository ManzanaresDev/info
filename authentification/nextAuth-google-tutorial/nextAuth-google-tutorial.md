# Authentification Google avec NextAuth.js (Auth.js v5) dans Next.js

> **Stack** : Next.js 14+ (App Router) · Auth.js v5 (NextAuth beta) · TypeScript

---

## Vue d'ensemble du flux

```
Utilisateur → "Se connecter" → Redirection Google OAuth → Callback NextAuth → Session créée → Accès protégé
```

**Structure des fichiers créés :**

```
mon-projet/
├── auth.ts                               ← config centrale
├── middleware.ts                         ← protection des routes
├── .env.local                            ← secrets (jamais commité)
└── app/
    ├── api/auth/[...nextauth]/route.ts   ← handler OAuth
    ├── login/page.tsx                    ← page de connexion
    └── dashboard/page.tsx                ← page protégée
```

---

## Étape 1 — Créer un projet Google OAuth

Rendez-vous sur [console.cloud.google.com](https://console.cloud.google.com) et suivez ce chemin :

**Créer un projet** → **APIs & Services** → **Identifiants** → **Créer des identifiants** → **ID client OAuth 2.0**

Dans **URI de redirection autorisés**, ajoutez :

- Dev : `http://localhost:3000/api/auth/callback/google`
- Prod : `https://votre-domaine.com/api/auth/callback/google`

Récupérez votre **Client ID** et **Client Secret**.

---

## Étape 2 — Installation

```bash
npm install next-auth@beta
```

Générez un secret fort pour chiffrer les sessions :

```bash
npx auth secret
```

---

## Étape 3 — Variables d'environnement

```bash
# .env.local

# Généré par `npx auth secret`
AUTH_SECRET=votre_secret_généré

# Depuis Google Cloud Console
AUTH_GOOGLE_ID=123456789-xxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-votre_secret
```

> ⚠️ Ne committez jamais `.env.local` sur Git. Vérifiez qu'il est bien dans `.gitignore`.

---

## Étape 4 — Configuration Auth.js

Créez le fichier de configuration central à la racine du projet :

```typescript
// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Ajouter l'ID utilisateur à la session
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
})
```

---

## Étape 5 — Route handler API

NextAuth a besoin d'une route pour gérer les callbacks OAuth. Elle s'auto-configure en une ligne :

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

---

## Étape 6 — Middleware (protection des routes)

Le middleware protège les routes côté serveur, avant même que le composant ne se charge :

```typescript
// middleware.ts
export { auth as default } from "@/auth"

export const config = {
  matcher: [
    /*
     * Protège toutes les routes sauf :
     * - les fichiers statiques (_next/static, images…)
     * - la page de login et les callbacks auth
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
```

---

## Étape 7 — Page de connexion

Utilisez un Server Action pour déclencher la connexion Google :

```tsx
// app/login/page.tsx
import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <main>
      <h1>Connexion</h1>

      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/dashboard" })
        }}
      >
        <button type="submit">Se connecter avec Google</button>
      </form>
    </main>
  )
}
```

---

## Étape 8 — Utiliser la session dans les composants

### Server Component (recommandé)

Zéro JS côté client, plus rapide et plus sécurisé :

```tsx
// app/dashboard/page.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()

  if (!session) redirect("/login")

  return (
    <div>
      <p>Bonjour, {session.user?.name} !</p>
      <img src={session.user?.image ?? ""} alt="Avatar" />

      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      >
        <button type="submit">Se déconnecter</button>
      </form>
    </div>
  )
}
```

### Client Component

Si vous avez besoin de la session dans un composant interactif côté client :

```tsx
// components/user-menu.tsx
"use client"
import { useSession } from "next-auth/react"

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Chargement…</p>
  if (!session) return <p>Non connecté</p>

  return <p>{session.user?.email}</p>
}
```

> ℹ️ Pour utiliser `useSession`, wrappez votre app dans `<SessionProvider>` dans votre `app/layout.tsx` :

```tsx
// app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

---

## Résumé

| Fichier | Rôle |
|---|---|
| `auth.ts` | Config centrale : providers, callbacks, secret |
| `middleware.ts` | Protection des routes avant rendu |
| `app/api/auth/[...nextauth]/route.ts` | Handler OAuth (callbacks Google) |
| `app/login/page.tsx` | Déclenchement du flux de connexion |
| `app/dashboard/page.tsx` | Page protégée avec session |

**Points clés :**

- Privilégiez `await auth()` dans les **Server Components** plutôt que `useSession` côté client.
- Le **middleware** est la première ligne de défense — il bloque avant même que React ne charge.
- En production, ajoutez l'URI de redirection Google avec votre vrai domaine dans la Google Cloud Console.
- Lancez `npm run dev` et testez sur `http://localhost:3000/login`.

---

## Aller plus loin

- [Ajouter un adapter Prisma](https://authjs.dev/getting-started/adapters/prisma) — persister les sessions en base de données
- [Autres providers OAuth](https://authjs.dev/getting-started/providers) — GitHub, Discord, Microsoft…
- [Protection des routes API](https://authjs.dev/getting-started/session-management/protecting) — sécuriser les endpoints backend
- [Documentation officielle Auth.js](https://authjs.dev)
