# Manuel complet — Dashboard Admin sécurisé avec Auth.js et Next.js

## Introduction

Ce manuel explique comment protéger une page d’administration dans une application utilisant :

- Next.js App Router
- Server Components
- Auth.js (anciennement NextAuth)
- Authentification par credentials
- Middleware de protection
- Sessions JWT

L’objectif est de sécuriser un dashboard permettant de gérer des avis utilisateurs (validation/suppression).

---

# Pourquoi protéger une page admin ?

Une page d’administration non protégée permet à n’importe qui de :

- supprimer des avis
- valider des contenus
- automatiser des requêtes malveillantes
- accéder à des données sensibles

Une URL cachée n’est pas une protection.

La sécurité doit être vérifiée côté serveur.

---

# Architecture du projet

```text
app/
├── admin/
│   └── page.jsx
├── login/
│   └── page.jsx
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.js

middleware.js
auth.js
```

---

# Installation

```bash
npm install next-auth
```

---

# Génération du AUTH_SECRET

Auth.js utilise un secret pour :

- signer les JWT
- sécuriser les cookies
- empêcher la falsification des sessions

## Génération avec OpenSSL

```bash
openssl rand -base64 32
```

Exemple :

```env
AUTH_SECRET=J9xgD7wXz0zj3bM5nTnX0kV0sA6cF2mQpQe7uWlR4bI=
```

---

## Génération avec Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exemple :

```env
AUTH_SECRET=4f2b8e6a8b4fbb8d9f8c2d2f7f6e8d3a1c4b5f6e7d8c9a0b
```

---

## Génération avec la commande officielle Auth.js

```bash
npx auth secret
```

---

# Variables d’environnement

Créer :

```text
.env.local
```

Contenu :

```env
AUTH_SECRET=ta_cle_ultra_securisee
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=monmotdepasse
```

Important :

- ne jamais commit le fichier .env
- utiliser des secrets longs et aléatoires
- changer le secret invalide toutes les sessions existantes

---

# Configuration Auth.js

Créer :

```text
auth.js
```

Code :

```js
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "1",
            name: "Admin",
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
});
```

---

# Route API Auth.js

Créer :

```text
app/api/auth/[...nextauth]/route.js
```

Code :

```js
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

---

# Création de la page Login

Créer :

```text
app/login/page.jsx
```

Code :

```jsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result.error) {
      setError("Identifiants invalides");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" />

      <input type="password" name="password" placeholder="Mot de passe" />

      <button>Connexion</button>

      {error && <p>{error}</p>}
    </form>
  );
}
```

---

# Protection de la page admin

Créer :

```text
app/admin/page.jsx
```

Code :

```jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  // Non connecté
  if (!session) {
    redirect("/login");
  }

  // Non admin
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <div>Dashboard Admin</div>;
}
```

---

# Middleware de protection globale

Créer :

```text
middleware.js
```

Code :

```js
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*"],
};
```

Ce middleware protège automatiquement toutes les routes :

```text
/admin
/admin/users
/admin/comments
/admin/settings
```

---

# Déconnexion

Créer un composant :

```jsx
"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return <button onClick={() => signOut()}>Déconnexion</button>;
}
```

---

# Fonctionnement des sessions

Auth.js crée automatiquement :

- un cookie sécurisé
- une session JWT
- une gestion des connexions
- une persistance des sessions

Le cookie est :

- httpOnly
- signé
- sécurisé
- inaccessible via JavaScript côté client

---

# Protection des Server Actions

Même avec une page protégée, il faut protéger les actions serveur.

Exemple :

```js
"use server";

import { auth } from "@/auth";

export async function deleteReview(id) {
  const session = await auth();

  if (!session) {
    throw new Error("Non autorisé");
  }

  if (session.user.role !== "admin") {
    throw new Error("Accès refusé");
  }

  // Suppression sécurisée
}
```

---

# Honeypot anti-spam

Un honeypot est un champ invisible destiné à piéger les bots.

## Frontend

```jsx
<input
  type="text"
  name="website"
  style={{ display: "none" }}
  tabIndex="-1"
  autoComplete="off"
/>
```

---

## Backend

```js
if (website) {
  return Response.json(
    {
      message: "Spam détecté",
    },
    {
      status: 400,
    },
  );
}
```

---

# Bonnes pratiques de sécurité

## Toujours :

- vérifier l’authentification côté serveur
- utiliser HTTPS
- protéger les Server Actions
- utiliser des mots de passe hashés
- limiter les tentatives de connexion
- ajouter du rate limiting
- stocker les secrets dans .env

---

# Évolution recommandée pour la production

## Au lieu de variables .env :

Utiliser une base de données.

Exemple :

```text
admins
├── id
├── email
├── password_hash
├── role
└── createdAt
```

---

# Hash des mots de passe

Installer :

```bash
npm install bcrypt
```

Hash :

```js
import bcrypt from "bcrypt";

const hash = await bcrypt.hash(password, 10);
```

Vérification :

```js
const isValid = await bcrypt.compare(password, hash);
```

---

# Résumé

Avec cette architecture :

- les pages admin sont protégées
- les sessions sont sécurisées
- les Server Components restent compatibles
- les actions serveur sont protégées
- les bots spam sont filtrés
- le dashboard devient exploitable en production

Cette structure constitue une base solide pour :

- dashboard admin
- modération d’avis
- CMS
- back-office
- applications SaaS
- plateformes communautaires
