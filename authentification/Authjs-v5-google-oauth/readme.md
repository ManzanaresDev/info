# Manuel complet — Authentification Google avec Auth.js v5 (Next.js)

> **Stack :** Next.js 14+ (App Router) · Auth.js v5 (NextAuth) · Google OAuth 2.0  
> **Dernière mise à jour :** Juin 2026

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Création du projet Google Cloud](#2-création-du-projet-google-cloud)
3. [Configuration de l'écran de consentement OAuth](#3-configuration-de-lécran-de-consentement-oauth)
4. [Création des identifiants OAuth (Client ID)](#4-création-des-identifiants-oauth-client-id)
5. [Installation et configuration d'Auth.js v5](#5-installation-et-configuration-dauthjs-v5)
6. [Variables d'environnement](#6-variables-denvironnement)
7. [Structure des fichiers](#7-structure-des-fichiers)
8. [Configuration Auth.js](#8-configuration-authjs)
9. [Route Handler](#9-route-handler)
10. [Middleware (protection des routes)](#10-middleware-protection-des-routes)
11. [Composants UI — Boutons de connexion/déconnexion](#11-composants-ui--boutons-de-connexiondéconnexion)
12. [Accéder à la session](#12-accéder-à-la-session)
13. [Ajouter des utilisateurs de test (mode développement)](#13-ajouter-des-utilisateurs-de-test-mode-développement)
14. [Passer en production](#14-passer-en-production)
15. [Dépannage](#15-dépannage)
16. [Récapitulatif des fichiers créés](#16-récapitulatif-des-fichiers-créés)

---

## 1. Prérequis

- Node.js 18.17+ installé
- Un projet Next.js existant (ou à créer)
- Un compte Google

Pour créer un nouveau projet Next.js :

```bash
npx create-next-app@latest mon-projet --typescript --app --tailwind
cd mon-projet
```

---

## 2. Création du projet Google Cloud

### 2.1 — Accéder à Google Cloud Console

Rendez-vous sur [https://console.cloud.google.com](https://console.cloud.google.com)

### 2.2 — Créer un nouveau projet

1. Cliquez sur le sélecteur de projet en haut à gauche
2. Cliquez sur **« Nouveau projet »**
3. Donnez un nom à votre projet (ex: `mon-app-auth`)
4. Cliquez sur **« Créer »**
5. Attendez la création, puis sélectionnez ce projet

### 2.3 — Activer l'API Google Auth Platform

1. Dans le menu latéral, allez dans **« API et services »** → **« Bibliothèque »**
2. Recherchez **« Google Auth Platform »** (ou « Identity »)
3. Cliquez sur l'API, puis sur **« Activer »**

> Alternativement, accédez directement à : [https://console.cloud.google.com/auth](https://console.cloud.google.com/auth)

---

## 3. Configuration de l'écran de consentement OAuth

L'écran de consentement est la page que verront vos utilisateurs lorsqu'ils se connecteront.

### 3.1 — Accéder à la configuration

Dans le menu **Google Auth Platform**, cliquez sur **« Branding »** (ou « Écran de consentement OAuth »).

### 3.2 — Informations de base

| Champ | Valeur |
|-------|--------|
| Nom de l'application | Nom visible par l'utilisateur (ex: `Mon App`) |
| E-mail d'assistance | Votre adresse Gmail |
| Logo | Optionnel (PNG, max 1 Mo) |

### 3.3 — Domaines autorisés

En développement : laissez vide.  
En production : ajoutez `votre-domaine.fr`

### 3.4 — Coordonnées du développeur

Entrez votre adresse e-mail.

### 3.5 — Audience

Choisissez **« Externe »** pour permettre à n'importe quel compte Google de se connecter (en passant par la liste des utilisateurs de test en développement).

Cliquez sur **« Enregistrer et continuer »** jusqu'à la fin.

---

## 4. Création des identifiants OAuth (Client ID)

### 4.1 — Accéder aux clients OAuth

Dans le menu **Google Auth Platform**, cliquez sur **« Clients »** → **« + Créer un client »**

### 4.2 — Paramètres du client

| Champ | Valeur |
|-------|--------|
| Type d'application | **Application Web** |
| Nom | ex: `mon-app` |

### 4.3 — Origines JavaScript autorisées

> ⚠️ Ces champs acceptent **uniquement le domaine**, sans chemin ni slash final.

| Environnement | Valeur |
|---|---|
| Développement | `http://localhost:3000` |
| Production | `https://votre-domaine.fr` |

### 4.4 — URI de redirection autorisés

> ⚠️ C'est ici que vont les URLs de callback Auth.js (avec le chemin complet).

| Environnement | Valeur |
|---|---|
| Développement | `http://localhost:3000/api/auth/callback/google` |
| Production | `https://votre-domaine.fr/api/auth/callback/google` |

Cliquez sur **« Créer »**.

### 4.5 — Récupérer vos identifiants

Une boîte de dialogue affiche :

- **ID client** : `xxxxxxxxxx.apps.googleusercontent.com`
- **Code secret du client** : `GOCSPX-xxxxxxxxxx`

> ⚠️ **Copiez le code secret immédiatement.** Il n'est plus affiché après fermeture de la boîte de dialogue. Si vous le perdez, vous devrez en créer un nouveau.

---

## 5. Installation et configuration d'Auth.js v5

### 5.1 — Installer Auth.js

```bash
npm install next-auth@beta
```

> Auth.js v5 est encore en phase bêta mais stable pour la production.

### 5.2 — Générer le secret AUTH_SECRET

```bash
npx auth secret
```

Cette commande génère automatiquement une clé aléatoire sécurisée et l'ajoute à votre fichier `.env.local`.

> Si la commande ne fonctionne pas, générez manuellement :
> ```bash
> openssl rand -base64 32
> ```

---

## 6. Variables d'environnement

Créez (ou complétez) le fichier `.env.local` à la racine du projet :

```env
# Auth.js — Secret de chiffrement des sessions (généré par npx auth secret)
AUTH_SECRET=votre_secret_genere_ici

# Google OAuth
AUTH_GOOGLE_ID=xxxxxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxx

# Optionnel : URL de base (nécessaire en production)
# AUTH_URL=https://votre-domaine.fr
```

> ⚠️ **Ne commitez jamais `.env.local`** dans Git. Vérifiez que `.gitignore` contient bien `.env*.local`.

### Vérifier le .gitignore

```
# .gitignore
.env*.local
.env.local
```

---

## 7. Structure des fichiers

Voici l'arborescence finale après configuration :

```
mon-projet/
├── auth.ts                          ← Configuration principale Auth.js
├── middleware.ts                    ← Protection des routes
├── .env.local                       ← Variables d'environnement (ne pas committer)
└── app/
    ├── api/
    │   └── auth/
    │       └── [...nextauth]/
    │           └── route.ts         ← Route handler Next.js
    ├── layout.tsx                   ← Layout racine (SessionProvider)
    ├── page.tsx                     ← Page d'accueil
    └── dashboard/
        └── page.tsx                 ← Page protégée (exemple)
```

---

## 8. Configuration Auth.js

Créez le fichier `auth.ts` **à la racine du projet** (au même niveau que `package.json`) :

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

  // Pages personnalisées (optionnel)
  pages: {
    signIn: "/login",    // Redirige vers /login au lieu de la page Auth.js par défaut
  },

  // Callbacks (optionnel) — pour enrichir la session
  callbacks: {
    // Ajouter l'ID utilisateur dans la session
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },

    // Contrôler qui peut se connecter (optionnel)
    async signIn({ user }) {
      // Exemple : autoriser uniquement certains domaines e-mail
      // if (!user.email?.endsWith("@votreentreprise.fr")) return false
      return true
    },
  },
})
```

---

## 9. Route Handler

Créez le fichier `app/api/auth/[...nextauth]/route.ts` :

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

C'est tout ce qu'il faut pour cette route. Auth.js gère automatiquement :
- `GET /api/auth/signin` — page de connexion
- `GET /api/auth/signout` — déconnexion
- `GET /api/auth/callback/google` — callback OAuth Google
- `GET /api/auth/session` — données de session

---

## 10. Middleware (protection des routes)

Créez le fichier `middleware.ts` **à la racine du projet** :

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

// Configurer les routes à protéger
export const config = {
  matcher: [
    // Protéger toutes les routes sauf :
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
```

### Middleware avancé (avec logique personnalisée)

Si vous avez besoin de plus de contrôle :

```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/", "/login", "/about"].includes(req.nextUrl.pathname)

  if (isAuthRoute) return NextResponse.next()

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 11. Composants UI — Boutons de connexion/déconnexion

### 11.1 — Composant bouton de connexion

```typescript
// components/sign-in-button.tsx
import { signIn } from "@/auth"

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <button type="submit">
        Se connecter avec Google
      </button>
    </form>
  )
}
```

### 11.2 — Composant bouton de déconnexion

```typescript
// components/sign-out-button.tsx
import { signOut } from "@/auth"

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit">
        Se déconnecter
      </button>
    </form>
  )
}
```

### 11.3 — Redirection après connexion

```typescript
// Rediriger vers une page spécifique après connexion
await signIn("google", { redirectTo: "/dashboard" })

// Rediriger vers une page spécifique après déconnexion
await signOut({ redirectTo: "/" })
```

---

## 12. Accéder à la session

### 12.1 — Dans un Server Component (recommandé)

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  // Rediriger si non connecté
  if (!session) {
    redirect("/login")
  }

  return (
    <div>
      <h1>Bonjour, {session.user?.name} !</h1>
      <p>Email : {session.user?.email}</p>
      <img src={session.user?.image ?? ""} alt="Avatar" />
    </div>
  )
}
```

### 12.2 — Dans un Client Component

Enveloppez d'abord votre app dans `SessionProvider` :

```typescript
// app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

Puis dans vos composants client :

```typescript
// components/user-info.tsx
"use client"

import { useSession } from "next-auth/react"

export function UserInfo() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Chargement...</p>
  if (status === "unauthenticated") return <p>Non connecté</p>

  return (
    <div>
      <p>Connecté en tant que : {session?.user?.name}</p>
      <p>Email : {session?.user?.email}</p>
    </div>
  )
}
```

### 12.3 — Dans une Route API

```typescript
// app/api/mon-endpoint/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  return NextResponse.json({
    message: "Données privées",
    user: session.user,
  })
}
```

---

## 13. Ajouter des utilisateurs de test (mode développement)

Tant que votre app OAuth est en **mode Test** (non publiée), seuls les comptes listés peuvent se connecter.

### Comment ajouter des utilisateurs de test

1. Allez sur [https://console.cloud.google.com/auth](https://console.cloud.google.com/auth)
2. Cliquez sur **« Audience »** dans le menu latéral
3. Dans la section **« Utilisateurs de test »**, cliquez sur **« + Ajouter des utilisateurs »**
4. Entrez les adresses Gmail autorisées
5. Cliquez sur **« Enregistrer »**

> Vous pouvez ajouter jusqu'à 100 utilisateurs de test.

---

## 14. Passer en production

### 14.1 — Variables d'environnement sur le serveur

Sur Vercel (ou votre hébergeur), ajoutez ces variables d'environnement :

```
AUTH_SECRET=votre_secret_de_production
AUTH_GOOGLE_ID=xxxxxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxx
AUTH_URL=https://votre-domaine.fr
```

### 14.2 — Mettre à jour les URIs dans Google Cloud

Dans **Google Auth Platform → Clients → votre client OAuth**, ajoutez :

**Origines JavaScript autorisées :**
```
https://votre-domaine.fr
```

**URI de redirection autorisés :**
```
https://votre-domaine.fr/api/auth/callback/google
```

### 14.3 — Publier l'application OAuth

Pour permettre à n'importe quel compte Google de se connecter (pas seulement les comptes de test) :

1. Allez dans **Google Auth Platform → Audience**
2. Cliquez sur **« Publier l'application »**
3. Si votre app demande des scopes sensibles, une vérification Google sera nécessaire (pour les scopes de base email/profil, c'est généralement rapide)

> Pour une app interne à une organisation Google Workspace, restez en mode interne.

---

## 15. Dépannage

### Erreur : `redirect_uri_mismatch`

**Cause :** L'URI de redirection dans votre app ne correspond pas à celle configurée dans Google Cloud.

**Solution :**
- Vérifiez que `http://localhost:3000/api/auth/callback/google` est bien dans les **URI de redirection autorisés** (pas dans les origines JS).
- Vérifiez l'absence de slash final (`/`) dans les origines JS.

---

### Erreur : `invalid_client`

**Cause :** `AUTH_GOOGLE_ID` ou `AUTH_GOOGLE_SECRET` incorrect.

**Solution :**
- Vérifiez vos variables dans `.env.local`.
- Redémarrez le serveur Next.js après modification des variables d'environnement.

---

### Erreur : `access_denied`

**Cause :** L'utilisateur n'est pas dans la liste des utilisateurs de test.

**Solution :** Ajoutez son adresse Gmail dans **Audience → Utilisateurs de test**.

---

### Erreur : `AUTH_SECRET` manquant

```
[auth][error] MissingSecret: Please define a `secret`
```

**Solution :**
```bash
npx auth secret
```

---

### La session est `null` en Server Component

**Cause :** `AUTH_URL` non défini en production, ou cookies bloqués.

**Solution :** Définissez `AUTH_URL=https://votre-domaine.fr` dans vos variables d'environnement de production.

---

### Erreur CORS en développement

**Cause :** Le middleware bloque les requêtes Auth.js.

**Solution :** Vérifiez que `/api/auth` est exclu dans le `matcher` du middleware :

```typescript
matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
```

---

## 16. Récapitulatif des fichiers créés

| Fichier | Rôle |
|---------|------|
| `auth.ts` | Configuration Auth.js (providers, callbacks) |
| `middleware.ts` | Protection des routes |
| `app/api/auth/[...nextauth]/route.ts` | Route handler pour tous les endpoints Auth.js |
| `.env.local` | Variables d'environnement sensibles |
| `components/sign-in-button.tsx` | Bouton de connexion Google |
| `components/sign-out-button.tsx` | Bouton de déconnexion |

---

## Ressources

- [Documentation Auth.js v5](https://authjs.dev)
- [Guide Next.js Auth.js](https://authjs.dev/getting-started/installation?framework=next.js)
- [Google Cloud Console](https://console.cloud.google.com)
- [Google Auth Platform](https://console.cloud.google.com/auth)
- [Dépôt GitHub Auth.js](https://github.com/nextauthjs/next-auth)

---

*Manuel rédigé pour Auth.js v5 (beta) avec Next.js App Router.*
