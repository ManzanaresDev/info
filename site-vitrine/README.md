# 📚 Documentation — Site Vitrine Next.js

Guide complet pour mettre en place un site vitrine avec **Next.js App Router**, incluant l'arborescence du projet, l'authentification Firebase (email + Google), un système de panier avec paiement Stripe & PayPal, et l'envoi automatique d'un email de confirmation avec facture PDF après chaque achat.

---

## 📋 Sommaire

- [1. Arborescence du projet](#1-arborescence-du-projet)
  - [Approche 1 — Monorepo](#-approche-1--monorepo-front--back-dans-nextjs)
  - [Approche 2 — Projets séparés](#-approche-2--deux-projets-séparés-front--back-indépendants)
  - [Quelle approche choisir ?](#-quelle-approche-choisir-)
  - [Démarrage](#-démarrage)
  - [Stack recommandée](#-stack-recommandée)
- [2. Authentification Firebase](#2-authentification-firebase)
  - [Installation](#-1-installation-des-dépendances)
  - [Variables d'environnement](#-2-configuration-des-variables-denvironnement)
  - [Arborescence Auth](#-3-arborescence-des-fichiers-à-créer)
  - [Code des fichiers Auth](#-4-code-des-fichiers)
  - [Connexion Google](#-5-connexion-google-oauth)
  - [Récupérer le token](#-6-récupérer-le-token-dans-un-composant)
  - [Vérifier le token côté serveur](#-7-vérifier-le-token-dans-une-api-route)
  - [Flux complet Auth](#-8-flux-complet-dauthentification)
  - [Points importants Auth](#-points-importants)
- [3. Panier & Paiement](#3-panier--paiement)
  - [Configurer Supabase](#-0-configurer-supabase)
  - [Installation Panier](#-1-installation-des-dépendances-1)
  - [Variables d'environnement Paiement](#-2-variables-denvironnement-1)
  - [Arborescence Panier](#-3-arborescence-des-fichiers-à-créer-1)
  - [Schéma Prisma](#-4-schéma-prisma)
  - [Définition des modèles](#-41-définition-et-rôle-des-modèles)
  - [Code des fichiers Panier](#-5-code-des-fichiers-1)
  - [Flux complet Paiement](#-6-flux-complet)
  - [Points importants Paiement](#-7-points-importants-1)
- [4. Email de confirmation & Facture PDF](#4-email-de-confirmation--facture-pdf)
  - [Installation](#-1-installation-des-dépendances-2)
  - [Variables d'environnement](#-2-variables-denvironnement-2)
  - [Arborescence](#-3-arborescence-des-fichiers-à-créer-2)
  - [Génération du PDF](#-4-génération-de-la-facture-pdf)
  - [Template email HTML](#-5-template-email-html)
  - [Service d'envoi Resend](#-6-service-denvoi-resend)
  - [Intégration Stripe webhook](#-7-intégration-dans-le-webhook-stripe)
  - [Intégration PayPal capture](#-8-intégration-dans-la-capture-paypal)
  - [Flux complet email](#-9-flux-complet)
  - [Points importants email](#-10-points-importants)

---

# 1. Arborescence du projet

Structure du projet basée sur le **App Router** de Next.js 13+.

---

## 🟢 Approche 1 — Monorepo (Front + Back dans Next.js)

Recommandée pour un site vitrine simple. Next.js gère le frontend **et** le backend via les **API Routes**.

```
mon-site-vitrine/
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero/
│   │   └── gallery/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Layout racine (html, body, header, footer)
│   │   ├── page.tsx                    # Page d'accueil (/)
│   │   ├── globals.css
│   │   ├── about/
│   │   │   └── page.tsx                # /about
│   │   ├── services/
│   │   │   └── page.tsx                # /services
│   │   ├── contact/
│   │   │   └── page.tsx                # /contact
│   │   ├── mentions-legales/
│   │   │   └── page.tsx                # /mentions-legales
│   │   └── api/                        # ⚙️ Backend (API Routes)
│   │       ├── contact/
│   │       │   └── route.ts            # POST /api/contact (envoi de mail)
│   │       └── revalidate/
│   │           └── route.ts            # Revalidation du cache
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── HeroSection.tsx
│   ├── lib/                            # Partagé front/back
│   │   ├── mailer.ts                   # Logique d'envoi de mail
│   │   └── utils.ts                    # Fonctions utilitaires
│   ├── hooks/                          # Custom hooks
│   ├── types/
│   │   └── index.ts                    # Types TypeScript globaux
│   └── data/
│       └── content.ts                  # Contenu statique (textes, liens, etc.)
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 📁 Description des dossiers

| Dossier | Rôle |
|---|---|
| `public/` | Fichiers statiques accessibles via URL (images, fonts, favicon) |
| `src/app/` | Pages et routing (chaque dossier = une route) |
| `src/app/api/` | Routes backend (API REST intégrée à Next.js) |
| `src/components/layout/` | Composants structurels persistants (Header, Footer, Navbar) |
| `src/components/ui/` | Composants réutilisables au sein des pages |
| `src/lib/` | Logique partagée entre le front et le back |
| `src/hooks/` | Custom React hooks |
| `src/types/` | Types TypeScript globaux |
| `src/data/` | Contenu statique centralisé (textes, liens, descriptions) |

---

## 🔵 Approche 2 — Deux projets séparés (Front + Back indépendants)

Recommandée si le backend est plus complexe (Node/Express, NestJS, Strapi...) ou si tu utilises un **CMS headless**.

```
mon-projet/
├── frontend/                           # 🖥️ Next.js
│   ├── public/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── hero/
│   │   │   └── gallery/
│   │   └── fonts/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   └── mentions-legales/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── HeroSection.tsx
│   │   ├── lib/
│   │   │   └── api.ts                  # Appels vers le backend
│   │   ├── hooks/
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── data/
│   │       └── content.ts
│   ├── .env.local
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                            # ⚙️ Node.js / NestJS / Express
│   ├── src/
│   │   ├── routes/
│   │   │   └── contact.route.ts
│   │   ├── controllers/
│   │   │   └── contact.controller.ts
│   │   ├── services/
│   │   │   └── mailer.service.ts
│   │   └── models/                     # Si base de données
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore                          # Commun aux deux projets
└── package.json                        # Workspace racine (npm/yarn workspaces)
```

### 📁 Description des dossiers

| Dossier | Rôle |
|---|---|
| `frontend/` | Application Next.js complète |
| `frontend/src/lib/api.ts` | Centralise les appels HTTP vers le backend |
| `backend/src/routes/` | Définition des endpoints de l'API |
| `backend/src/controllers/` | Logique de traitement des requêtes |
| `backend/src/services/` | Logique métier (mail, BDD, etc.) |
| `backend/src/models/` | Schémas de données (si base de données) |

---

## 🤔 Quelle approche choisir ?

| Cas | Approche |
|---|---|
| Site vitrine avec formulaire de contact | ✅ **Approche 1** — API Routes Next.js suffisent |
| Site vitrine + CMS headless (Strapi, Sanity...) | ✅ **Approche 2** — Deux projets séparés |
| Site vitrine + auth, base de données complexe | ✅ **Approche 2** — Deux projets séparés |

---

## 🚀 Démarrage

### Approche 1 — Monorepo

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm start
```

### Approche 2 — Projets séparés

```bash
# Frontend
cd frontend
npm install
npm run dev       # http://localhost:3000

# Backend
cd backend
npm install
npm run dev       # http://localhost:5000
```

---

## 🛠️ Stack recommandée

| Couche | Technologie |
|---|---|
| **Frontend** | Next.js 14+, TypeScript, Tailwind CSS |
| **Backend (simple)** | API Routes Next.js |
| **Backend (complexe)** | Node.js + Express ou NestJS |
| **Base de données** | Supabase (PostgreSQL hébergé, gratuit) |
| **ORM** | Prisma |
| **Auth** | Firebase Authentication |
| **CMS Headless** | Strapi, Sanity, Contentful |
| **Déploiement Frontend** | Vercel |
| **Déploiement Backend** | Railway, Render, VPS |

---

# 2. Authentification Firebase

Mise en place d'une authentification utilisateur avec **Firebase Auth** (email/mot de passe + Google OAuth) + génération d'un **token JWT** dans un projet Next.js (App Router).

---

## 📦 1. Installation des dépendances

```bash
npm install firebase firebase-admin
```

---

## 🔧 2. Configuration des variables d'environnement

Ajoute dans ton `.env.local` :

```env
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (serveur uniquement — ne jamais exposer côté client)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> 💡 Les variables préfixées `NEXT_PUBLIC_` sont exposées côté client. Les variables `FIREBASE_ADMIN_*` ne sont utilisées que côté serveur.

---

## 🗂️ 3. Arborescence des fichiers à créer

```
src/
├── lib/
│   ├── firebase.ts               # Config client Firebase
│   └── firebase-admin.ts         # Config serveur Firebase Admin
├── hooks/
│   └── useAuth.ts                # Hook React pour l'auth
├── context/
│   └── AuthContext.tsx           # Context global d'authentification
├── components/
│   └── ui/
│       ├── LoginForm.tsx         # Formulaire de connexion (email + Google)
│       ├── RegisterForm.tsx      # Formulaire d'inscription
│       └── GoogleSignInButton.tsx # Bouton connexion Google
└── app/
    ├── layout.tsx
    ├── login/
    │   └── page.tsx
    ├── register/
    │   └── page.tsx
    └── api/
        └── auth/
            └── session/
                └── route.ts      # API Route : création du cookie de session
```

---

## 📄 4. Code des fichiers

---

### `src/lib/firebase.ts` — Configuration client

```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Évite de réinitialiser Firebase si déjà initialisé (Next.js hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
```

---

### `src/lib/firebase-admin.ts` — Configuration serveur (Admin SDK)

```ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Remplace les \n échappés dans la clé privée
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = admin.auth();
export default admin;
```

---

### `src/context/AuthContext.tsx` — Context global d'authentification

```tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Récupère le token JWT (fonctionne pour email ET Google)
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);

        // Envoie le token au serveur pour créer un cookie de session
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

### `src/hooks/useAuth.ts` — Hook utilitaire

```ts
export { useAuth } from "@/context/AuthContext";
```

---

### `src/app/layout.tsx` — Wrap avec AuthProvider

```tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon Site Vitrine",
  description: "Site vitrine Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

### `src/components/ui/GoogleSignInButton.tsx` — Bouton connexion Google

```tsx
"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function GoogleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Le AuthContext détecte automatiquement la connexion via onAuthStateChanged
      router.push("/");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Erreur lors de la connexion avec Google. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50 transition"
      >
        {/* Logo Google SVG */}
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {loading ? "Connexion..." : "Continuer avec Google"}
        </span>
      </button>
    </div>
  );
}
```

---

### `src/components/ui/LoginForm.tsx` — Formulaire de connexion (email + Google)

```tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "./GoogleSignInButton";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
      <h2 className="text-2xl font-bold">Connexion</h2>

      {/* Connexion Google */}
      <GoogleSignInButton />

      <div className="flex items-center gap-2 text-gray-400">
        <hr className="flex-1" />
        <span className="text-sm">ou</span>
        <hr className="flex-1" />
      </div>

      {/* Connexion Email */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500">
        Pas encore de compte ?{" "}
        <a href="/register" className="text-blue-600 hover:underline">
          Créer un compte
        </a>
      </p>
    </div>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found": return "Aucun compte trouvé avec cet email.";
    case "auth/wrong-password": return "Mot de passe incorrect.";
    case "auth/invalid-email": return "Email invalide.";
    case "auth/too-many-requests": return "Trop de tentatives. Réessayez plus tard.";
    default: return "Une erreur est survenue. Réessayez.";
  }
}
```

---

### `src/components/ui/RegisterForm.tsx` — Formulaire d'inscription

```tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "./GoogleSignInButton";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      router.push("/");
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
      <h2 className="text-2xl font-bold">Créer un compte</h2>

      {/* Inscription via Google */}
      <GoogleSignInButton />

      <div className="flex items-center gap-2 text-gray-400">
        <hr className="flex-1" />
        <span className="text-sm">ou</span>
        <hr className="flex-1" />
      </div>

      {/* Inscription Email */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Mot de passe (min. 6 caractères)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer un compte"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500">
        Déjà un compte ?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Se connecter
        </a>
      </p>
    </div>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use": return "Cet email est déjà utilisé.";
    case "auth/invalid-email": return "Email invalide.";
    case "auth/weak-password": return "Le mot de passe doit contenir au moins 6 caractères.";
    default: return "Une erreur est survenue. Réessayez.";
  }
}
```

---

### `src/app/login/page.tsx`

```tsx
import LoginForm from "@/components/ui/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </main>
  );
}
```

---

### `src/app/register/page.tsx`

```tsx
import RegisterForm from "@/components/ui/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <RegisterForm />
    </main>
  );
}
```

---

### `src/app/api/auth/session/route.ts` — Cookie de session

```ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000; // 5 jours

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ status: "success" });
}
```

---

### `src/lib/auth-server.ts` — Vérification côté serveur

```ts
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
```

---

### `middleware.ts` — Protection des routes

```ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const PROTECTED_ROUTES = ["/dashboard", "/profile", "/admin", "/panier", "/checkout"];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  let isAuthenticated = false;
  if (session) {
    try {
      await adminAuth.verifySessionCookie(session, true);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 🔵 5. Connexion Google OAuth

### Activer Google dans Firebase Console

1. Va dans **Firebase Console** → ton projet → **Authentication** → **Sign-in method**
2. Active le provider **Google**
3. Renseigne ton **Project support email**
4. Sauvegarde

> ✅ Aucune variable d'environnement supplémentaire n'est nécessaire — Firebase gère OAuth automatiquement via `authDomain`.

### Fonctionnement

Le bouton `GoogleSignInButton` utilise `signInWithPopup` qui ouvre une fenêtre Google. Une fois l'utilisateur authentifié, `onAuthStateChanged` dans le `AuthContext` détecte automatiquement la connexion, récupère le token JWT et crée le cookie de session — **exactement comme pour la connexion email**.

---

## 🔑 6. Récupérer le token dans un composant

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function TokenDisplay() {
  const { user, token } = useAuth();

  if (!user) return <p>Non connecté</p>;

  return (
    <div>
      <p>Connecté en tant que : {user.displayName ?? user.email}</p>
      <p>Provider : {user.providerData[0]?.providerId}</p>
      <p>Token JWT : {token?.slice(0, 40)}...</p>
    </div>
  );
}
```

Pour **rafraîchir le token** (valable 1 heure) :

```ts
const refreshedToken = await user.getIdToken(true);
```

---

## 🛡️ 7. Vérifier le token dans une API Route

```ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session, true);
    return NextResponse.json({
      message: "Accès autorisé",
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }
}
```

---

## 🔄 8. Flux complet d'authentification

```
┌─── EMAIL / MOT DE PASSE ───────────────────────────────────┐
│  Utilisateur remplit le formulaire                          │
│  → signInWithEmailAndPassword()                             │
│  → Firebase retourne un idToken (JWT)                       │
└─────────────────────────────────────────────────────────────┘
        ↕ (les deux méthodes convergent ici)
┌─── GOOGLE OAUTH ────────────────────────────────────────────┐
│  Utilisateur clique "Continuer avec Google"                 │
│  → signInWithPopup(auth, googleProvider)                    │
│  → Firebase ouvre la fenêtre Google                         │
│  → Firebase retourne un idToken (JWT)                       │
└─────────────────────────────────────────────────────────────┘
        ↓
onAuthStateChanged détecte la connexion
        ↓
AuthContext envoie l'idToken → POST /api/auth/session
        ↓
Firebase Admin vérifie l'idToken → crée un sessionCookie signé
        ↓
Cookie httpOnly stocké dans le navigateur
        ↓
Middleware vérifie le cookie sur les routes protégées
```

---

## ⚠️ Points importants

- Le **idToken** Firebase expire après **1 heure** — utilise `getIdToken(true)` pour le rafraîchir.
- Le **sessionCookie** peut durer jusqu'à **14 jours** maximum.
- Ne jamais stocker le `idToken` brut dans `localStorage` — préfère les cookies `httpOnly`.
- Les variables `FIREBASE_ADMIN_*` ne doivent **jamais** être préfixées `NEXT_PUBLIC_`.
- La `FIREBASE_ADMIN_PRIVATE_KEY` doit conserver ses sauts de ligne (`\n`) dans le `.env`.
- Pour la connexion Google en production, ajoute ton domaine dans **Firebase Console** → Authentication → **Authorized domains**.

---

# 3. Panier & Paiement

Mise en place d'un **panier persistant (base de données)** avec **Stripe** et **PayPal** dans une architecture Next.js App Router (Approche 1 — Monorepo).

La base de données utilisée est **Supabase** (PostgreSQL hébergé, gratuit sans carte bancaire) connectée via **Prisma** comme ORM.

---

## 🗄️ 0. Configurer Supabase

### Pourquoi Supabase ?

| | Supabase | Firestore |
|---|---|---|
| Gratuit | ✅ Sans carte bancaire | ❌ Plan Blaze requis pour Next.js |
| Type | PostgreSQL relationnel | NoSQL document |
| Prisma | ✅ Compatible natif | ❌ Non compatible |
| Dashboard | ✅ Éditeur SQL + UI | ✅ Console Firebase |

### Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un compte gratuit
2. Clique **New Project** → choisis un nom, un mot de passe (garde-le précieusement), une région
3. Attends ~2 minutes que le projet soit prêt
4. Va dans **Settings** → **Database** → section **Connection string**
5. Sélectionne **URI** et copie la chaîne de connexion — elle ressemble à :

```
postgresql://postgres:[MOT_DE_PASSE]@db.[REF].supabase.co:5432/postgres
```

6. Remplace `[MOT_DE_PASSE]` par le mot de passe choisi à l'étape 2

> ⚠️ Pour les environnements **serverless** (Vercel, Netlify), utilise la **connection string avec PgBouncer** (mode `Transaction`) disponible dans Settings → Database → **Connection pooling**. Elle utilise le port `6543` au lieu de `5432`.

```
# Connection directe (migrations Prisma)
DATABASE_URL="postgresql://postgres:[MOT_DE_PASSE]@db.[REF].supabase.co:5432/postgres"

# Connection pooling (runtime Next.js sur Vercel)
DIRECT_URL="postgresql://postgres:[MOT_DE_PASSE]@db.[REF].supabase.co:5432/postgres"
DATABASE_URL="postgresql://postgres:[MOT_DE_PASSE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 📦 1. Installation des dépendances

```bash
npm install stripe @stripe/stripe-js @paypal/react-paypal-js @paypal/paypal-js
npm install prisma @prisma/client
npm install zustand
```

> 💡 On utilise **Prisma** comme ORM pour communiquer avec la base **Supabase (PostgreSQL)**, et **Zustand** pour synchroniser l'état du panier côté client.

---

## 🔧 2. Variables d'environnement

Ajoute dans ton `.env.local` :

```env
# ── Supabase / Prisma ──────────────────────────────────────────
# Connection pooling pour le runtime Next.js (Vercel)
DATABASE_URL="postgresql://postgres:[MOT_DE_PASSE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connection directe pour les migrations Prisma
DIRECT_URL="postgresql://postgres:[MOT_DE_PASSE]@db.[REF].supabase.co:5432/postgres"

# ── URL de base ────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ── Stripe ────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── PayPal ────────────────────────────────────────────────────
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

---

## 🗂️ 3. Arborescence des fichiers à créer

```
src/
├── app/
│   ├── boutique/
│   │   └── page.tsx                        # Liste des produits
│   ├── panier/
│   │   └── page.tsx                        # Page panier
│   ├── checkout/
│   │   └── page.tsx                        # Page de paiement
│   ├── success/
│   │   └── page.tsx                        # Confirmation de commande
│   └── api/
│       ├── cart/
│       │   ├── route.ts                    # GET, POST /api/cart
│       │   └── [itemId]/
│       │       └── route.ts                # PUT, DELETE /api/cart/:itemId
│       ├── stripe/
│       │   ├── checkout/
│       │   │   └── route.ts                # POST /api/stripe/checkout
│       │   └── webhook/
│       │       └── route.ts                # POST /api/stripe/webhook
│       └── paypal/
│           ├── create-order/
│           │   └── route.ts                # POST /api/paypal/create-order
│           └── capture-order/
│               └── route.ts                # POST /api/paypal/capture-order
├── components/
│   └── ui/
│       ├── ProductCard.tsx
│       ├── CartDrawer.tsx
│       ├── CartItem.tsx
│       ├── StripeCheckout.tsx
│       └── PayPalCheckout.tsx
├── store/
│   └── cartStore.ts                        # Zustand — état local du panier
├── lib/
│   ├── prisma.ts
│   ├── stripe.ts
│   └── paypal.ts
└── types/
    └── index.ts
```

---

## 📐 4. Schéma Prisma

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    # Connection pooling (runtime)
  directUrl = env("DIRECT_URL")      # Connection directe (migrations)
}

model Product {
  id          String     @id @default(cuid())
  name        String
  description String?
  price       Float
  image       String?
  stock       Int        @default(0)
  createdAt   DateTime   @default(now())
  cartItems   CartItem[]
  orderItems  OrderItem[]
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  status     OrderStatus @default(PENDING)
  total      Float
  provider   String      # "stripe" ou "paypal"
  providerId String?
  items      OrderItem[]
  createdAt  DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  CANCELLED
}
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🧠 4.1 Définition et rôle des modèles

### Vue d'ensemble des relations

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   Product   │        │    Cart     │        │    Order    │
│─────────────│        │─────────────│        │─────────────│
│ id          │◄──┐    │ id          │        │ id          │
│ name        │   │    │ userId      │        │ userId      │
│ description │   │    │ createdAt   │        │ status      │
│ price       │   │    │ updatedAt   │        │ total       │
│ image       │   │    └──────┬──────┘        │ provider    │
│ stock       │   │           │ 1             │ providerId  │
│ createdAt   │   │           │               └──────┬──────┘
└─────────────┘   │           │ N                    │ 1
                  │    ┌──────▼──────┐               │ N
                  │    │  CartItem   │        ┌──────▼──────┐
                  │    │─────────────│        │  OrderItem  │
                  └────┤ productId   │        │─────────────│
                  └────┤ cartId      │        │ orderId     ├────►Order
                       │ quantity    │        │ productId   ├────►Product
                       └─────────────┘        │ quantity    │
                                              │ price       │
                                              └─────────────┘
```

---

### `Product` — Le catalogue de produits

C'est la table centrale qui représente les articles disponibles à la vente.

| Champ | Type | Rôle |
|---|---|---|
| `id` | String | Identifiant unique généré automatiquement (`cuid`) |
| `name` | String | Nom du produit affiché sur le site |
| `description` | String? | Description optionnelle du produit |
| `price` | Float | Prix unitaire en euros |
| `image` | String? | URL de l'image du produit (optionnelle) |
| `stock` | Int | Quantité disponible — empêche d'ajouter un produit épuisé |
| `createdAt` | DateTime | Date de création, générée automatiquement |
| `cartItems` | CartItem[] | Relation : tous les paniers qui contiennent ce produit |
| `orderItems` | OrderItem[] | Relation : toutes les commandes qui contiennent ce produit |

> 💡 `price` est sauvegardé dans `OrderItem` au moment de l'achat pour conserver le prix historique — si le prix du produit change plus tard, les anciennes commandes restent correctes.

---

### `Cart` — Le panier de l'utilisateur

Un utilisateur possède **un seul panier** actif à la fois (`userId` est `@unique`). Le panier est créé lors du premier ajout et vidé après un paiement réussi — il n'est jamais supprimé, juste vidé.

| Champ | Type | Rôle |
|---|---|---|
| `id` | String | Identifiant unique du panier |
| `userId` | String | UID Firebase de l'utilisateur — relie le panier à son propriétaire |
| `items` | CartItem[] | Relation : la liste des produits dans ce panier |
| `createdAt` | DateTime | Date de création du panier |
| `updatedAt` | DateTime | Mis à jour automatiquement à chaque modification |

---

### `CartItem` — Un article dans le panier

C'est la **table de jointure** entre `Cart` et `Product`. Elle représente "X exemplaires du produit Y dans le panier Z".

| Champ | Type | Rôle |
|---|---|---|
| `id` | String | Identifiant unique de la ligne |
| `cartId` | String | Référence vers le panier auquel appartient cet item |
| `productId` | String | Référence vers le produit concerné |
| `quantity` | Int | Nombre d'exemplaires souhaités (min. 1) |
| `cart` | Cart | Relation vers le panier parent |
| `product` | Product | Relation vers le produit — permet d'accéder au nom, prix, image |

> 💡 `onDelete: Cascade` signifie que si un panier est supprimé, tous ses `CartItem` sont supprimés automatiquement. Pas besoin de le faire manuellement.

---

### `Order` — Une commande passée

Une commande est créée **avant** le paiement (statut `PENDING`) et mise à jour **après** la confirmation du paiement (statut `PAID`). Elle représente l'intention d'achat et son résultat.

| Champ | Type | Rôle |
|---|---|---|
| `id` | String | Identifiant unique de la commande |
| `userId` | String | UID Firebase — identifie l'acheteur |
| `status` | OrderStatus | État de la commande : `PENDING`, `PAID`, `SHIPPED`, `CANCELLED` |
| `total` | Float | Montant total calculé au moment de la commande |
| `provider` | String | Plateforme de paiement utilisée : `"stripe"` ou `"paypal"` |
| `providerId` | String? | ID de la transaction chez Stripe ou PayPal (renseigné après paiement) |
| `items` | OrderItem[] | Relation : les produits inclus dans cette commande |
| `createdAt` | DateTime | Date de passage de la commande |

#### Cycle de vie du statut

```
PENDING → PAID → SHIPPED → (livré)
    └──→ CANCELLED
```

- `PENDING` : commande créée, paiement en attente
- `PAID` : paiement confirmé par Stripe webhook ou capture PayPal
- `SHIPPED` : commande expédiée (à mettre à jour manuellement depuis ton back-office)
- `CANCELLED` : commande annulée (paiement échoué ou remboursement)

---

### `OrderItem` — Un article dans une commande

Similaire à `CartItem` mais pour une commande finalisée. La différence clé est le champ `price` qui **capture le prix au moment de l'achat**.

| Champ | Type | Rôle |
|---|---|---|
| `id` | String | Identifiant unique de la ligne |
| `orderId` | String | Référence vers la commande parente |
| `productId` | String | Référence vers le produit acheté |
| `quantity` | Int | Nombre d'exemplaires achetés |
| `price` | Float | Prix unitaire **au moment de l'achat** — figé, indépendant du prix actuel |
| `order` | Order | Relation vers la commande parente |
| `product` | Product | Relation vers le produit — pour afficher le nom dans l'historique |

---

### `OrderStatus` — L'énumération des statuts

```prisma
enum OrderStatus {
  PENDING    // En attente de paiement
  PAID       // Paiement confirmé
  SHIPPED    // Expédiée
  CANCELLED  // Annulée
}
```

Un `enum` garantit que le champ `status` ne peut contenir **que** ces valeurs — Prisma et PostgreSQL rejettent toute autre valeur automatiquement.

---

### Pourquoi séparer `Cart`/`CartItem` et `Order`/`OrderItem` ?

C'est une question légitime puisque les deux ressemblent. La raison est qu'ils ont des **cycles de vie différents** :

| | Cart / CartItem | Order / OrderItem |
|---|---|---|
| **Durée de vie** | Temporaire — vidé après achat | Permanent — archivé pour toujours |
| **Modifiable** | Oui — quantités, ajouts, suppressions | Non — figé au moment du paiement |
| **Prix** | Prix actuel du produit | Prix figé au moment de l'achat |
| **Usage** | UX du panier en temps réel | Historique, facturation, SAV |

---

## 📄 5. Code des fichiers

---

### `src/lib/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query"] : [] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### `src/lib/stripe.ts`

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});
```

---

### `src/lib/paypal.ts`

```ts
export async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}
```

---

### `src/types/index.ts`

```ts
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  stock: number;
}

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: Product;
}
```

---

### `src/store/cartStore.ts`

```ts
import { create } from "zustand";
import { CartItemWithProduct } from "@/types";

interface CartStore {
  items: CartItemWithProduct[];
  isOpen: boolean;
  setItems: (items: CartItemWithProduct[]) => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  setItems: (items) => set({ items }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
  getTotalPrice: () =>
    get().items.reduce((t, i) => t + i.product.price * i.quantity, 0),
}));
```

---

### `src/app/api/cart/route.ts` — GET et POST panier

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
  } catch { return null; }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(cart ?? { items: [] });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { productId, quantity = 1 } = await request.json();

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(updatedCart);
}
```

---

### `src/app/api/cart/[itemId]/route.ts` — PUT et DELETE item

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
  } catch { return null; }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { quantity } = await request.json();

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: params.itemId } });
    return NextResponse.json({ message: "Item supprimé" });
  }

  const updated = await prisma.cartItem.update({
    where: { id: params.itemId },
    data: { quantity },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.cartItem.delete({ where: { id: params.itemId } });
  return NextResponse.json({ message: "Item supprimé" });
}
```

---

### `src/app/api/stripe/checkout/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const userId = decoded.uid;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0)
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });

  const order = await prisma.order.create({
    data: {
      userId,
      provider: "stripe",
      total: cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      items: {
        create: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.product.price,
        })),
      },
    },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product.name,
          images: item.product.image ? [item.product.image] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: { orderId: order.id },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/panier`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

---

### `src/app/api/stripe/webhook/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", providerId: session.payment_intent as string },
      });

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
        if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }
  }

  return NextResponse.json({ received: true });
}
```

---

### `src/app/api/paypal/create-order/route.ts`

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayPalAccessToken } from "@/lib/paypal";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const userId = decoded.uid;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0)
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });

  const total = cart.items
    .reduce((s, i) => s + i.product.price * i.quantity, 0)
    .toFixed(2);

  const order = await prisma.order.create({
    data: {
      userId,
      provider: "paypal",
      total: parseFloat(total),
      items: {
        create: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.product.price,
        })),
      },
    },
  });

  const accessToken = await getPayPalAccessToken();
  const paypalResponse = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: order.id,
        amount: {
          currency_code: "EUR",
          value: total,
          breakdown: { item_total: { currency_code: "EUR", value: total } },
        },
        items: cart.items.map((i) => ({
          name: i.product.name,
          quantity: String(i.quantity),
          unit_amount: { currency_code: "EUR", value: i.product.price.toFixed(2) },
        })),
      }],
    }),
  });

  const paypalOrder = await paypalResponse.json();
  return NextResponse.json({ orderId: paypalOrder.id, internalOrderId: order.id });
}
```

---

### `src/app/api/paypal/capture-order/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayPalAccessToken } from "@/lib/paypal";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { paypalOrderId, internalOrderId } = await request.json();
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    }
  );

  const data = await response.json();

  if (data.status === "COMPLETED") {
    await prisma.order.update({
      where: { id: internalOrderId },
      data: { status: "PAID", providerId: paypalOrderId },
    });

    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (session) {
      const decoded = await adminAuth.verifySessionCookie(session, true);
      const cart = await prisma.cart.findUnique({ where: { userId: decoded.uid } });
      if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Paiement non complété" }, { status: 400 });
}
```

---

### `src/components/ui/ProductCard.tsx`

```tsx
"use client";

import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

export default function ProductCard({ product }: { product: Product }) {
  const { toggleCart, setItems } = useCartStore();

  const addToCart = async () => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    const res = await fetch("/api/cart");
    const cart = await res.json();
    setItems(cart.items ?? []);
    toggleCart();
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {product.image && (
        <div className="relative h-48 w-full">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        {product.description && <p className="text-gray-500 text-sm">{product.description}</p>}
        <p className="text-blue-600 font-bold text-xl">{product.price.toFixed(2)} €</p>
        <button
          onClick={addToCart}
          disabled={product.stock === 0}
          className="mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
```

---

### `src/components/ui/CartItem.tsx`

```tsx
"use client";

import { CartItemWithProduct } from "@/types";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

export default function CartItem({ item }: { item: CartItemWithProduct }) {
  const setItems = useCartStore((s) => s.setItems);

  const refresh = async () => {
    const res = await fetch("/api/cart");
    const cart = await res.json();
    setItems(cart.items ?? []);
  };

  const updateQty = async (qty: number) => {
    await fetch(`/api/cart/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    refresh();
  };

  const remove = async () => {
    await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b">
      {item.product.image && (
        <div className="relative h-16 w-16 flex-shrink-0">
          <Image src={item.product.image} alt={item.product.name} fill className="object-cover rounded" />
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium">{item.product.name}</p>
        <p className="text-sm text-gray-500">{item.product.price.toFixed(2)} €</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => updateQty(item.quantity - 1)} className="w-7 h-7 rounded border flex items-center justify-center">−</button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button onClick={() => updateQty(item.quantity + 1)} className="w-7 h-7 rounded border flex items-center justify-center">+</button>
      </div>
      <button onClick={remove} className="text-red-500 text-sm ml-2">Supprimer</button>
    </div>
  );
}
```

---

### `src/components/ui/CartDrawer.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import CartItem from "./CartItem";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, setItems, getTotalPrice } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/cart").then((r) => r.json()).then((c) => setItems(c.items ?? []));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={toggleCart} />
      <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Mon panier</h2>
          <button onClick={toggleCart} className="text-gray-500 text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0
            ? <p className="text-gray-400 text-center mt-10">Votre panier est vide.</p>
            : items.map((item) => <CartItem key={item.id} item={item} />)
          }
        </div>
        {items.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>{getTotalPrice().toFixed(2)} €</span>
            </div>
            <button
              onClick={() => { toggleCart(); router.push("/checkout"); }}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700"
            >
              Passer la commande
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### `src/components/ui/StripeCheckout.tsx`

```tsx
"use client";

import { useState } from "react";

export default function StripeCheckout() {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Redirection..." : "💳 Payer avec Stripe"}
    </button>
  );
}
```

---

### `src/components/ui/PayPalCheckout.tsx`

```tsx
"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

export default function PayPalCheckout() {
  const router = useRouter();

  const createOrder = async () => {
    const res = await fetch("/api/paypal/create-order", { method: "POST" });
    const { orderId, internalOrderId } = await res.json();
    sessionStorage.setItem("internalOrderId", internalOrderId);
    return orderId;
  };

  const onApprove = async (data: { orderID: string }) => {
    const internalOrderId = sessionStorage.getItem("internalOrderId");
    await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paypalOrderId: data.orderID, internalOrderId }),
    });
    router.push(`/success?orderId=${internalOrderId}`);
  };

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
      <PayPalButtons style={{ layout: "vertical", color: "gold" }} createOrder={createOrder} onApprove={onApprove} />
    </PayPalScriptProvider>
  );
}
```

---

### `src/app/checkout/page.tsx`

```tsx
import StripeCheckout from "@/components/ui/StripeCheckout";
import PayPalCheckout from "@/components/ui/PayPalCheckout";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 border rounded-2xl shadow-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">Choisir un mode de paiement</h1>
        <StripeCheckout />
        <div className="flex items-center gap-2 text-gray-400">
          <hr className="flex-1" /><span className="text-sm">ou</span><hr className="flex-1" />
        </div>
        <PayPalCheckout />
      </div>
    </main>
  );
}
```

---

### `src/app/success/page.tsx`

```tsx
import { prisma } from "@/lib/prisma";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const order = searchParams.orderId
    ? await prisma.order.findUnique({
        where: { id: searchParams.orderId },
        include: { items: { include: { product: true } } },
      })
    : null;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
        {order && (
          <>
            <p className="text-gray-500 mb-4">Commande #{order.id.slice(0, 8)}</p>
            <p className="text-xl font-semibold">Total : {order.total.toFixed(2)} €</p>
            <p className="text-sm text-gray-400 mt-1">
              Payé via {order.provider === "stripe" ? "Stripe" : "PayPal"}
            </p>
          </>
        )}
        <a href="/" className="mt-6 inline-block bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700">
          Retour à l'accueil
        </a>
      </div>
    </main>
  );
}
```

---

## 🔄 6. Flux complet

```
1. Utilisateur clique "Ajouter au panier" (connecté via Firebase)
        ↓
2. POST /api/cart → Prisma crée/met à jour le CartItem en BDD
        ↓
3. Zustand met à jour l'état local (affichage instantané)
        ↓
4. Utilisateur va sur /checkout et choisit Stripe ou PayPal
        ↓
   ┌─── STRIPE ─────────────────────────────────────────────┐
   │  POST /api/stripe/checkout                              │
   │  → Crée une Order (PENDING) en BDD                     │
   │  → Crée une session Stripe Checkout                     │
   │  → Redirige vers la page Stripe hébergée               │
   │  → Stripe envoie webhook → /api/stripe/webhook         │
   │  → Order passe à PAID + panier vidé en BDD             │
   └─────────────────────────────────────────────────────────┘
   ┌─── PAYPAL ─────────────────────────────────────────────┐
   │  POST /api/paypal/create-order                          │
   │  → Crée une Order (PENDING) en BDD                     │
   │  → Crée une commande PayPal                            │
   │  → Utilisateur valide dans le widget PayPal            │
   │  → POST /api/paypal/capture-order                      │
   │  → Order passe à PAID + panier vidé en BDD             │
   └─────────────────────────────────────────────────────────┘
        ↓
5. Redirection vers /success avec confirmation
```

---

## ⚠️ 7. Points importants

- **Supabase** : utilise toujours `DATABASE_URL` avec PgBouncer (port `6543`) pour le runtime Next.js, et `DIRECT_URL` (port `5432`) uniquement pour les migrations Prisma.
- **Webhook Stripe** : configure-le dans ton dashboard Stripe → Developers → Webhooks. En local, utilise la Stripe CLI : `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- **PayPal Sandbox** : utilise des comptes de test sur [developer.paypal.com](https://developer.paypal.com) avant la production.
- **Stock** : pense à décrémenter le `stock` des produits dans le webhook Stripe et la capture PayPal.
- **Auth requise** : le panier est lié au `userId` Firebase — l'utilisateur doit être connecté pour ajouter au panier. Le middleware protège déjà `/panier` et `/checkout`.
- **NEXT_PUBLIC_BASE_URL** : ajoute `NEXT_PUBLIC_BASE_URL=http://localhost:3000` en local et l'URL de prod en production.

---

# 4. Email de confirmation & Facture PDF

Envoi automatique d'un **email HTML** avec une **facture PDF en pièce jointe** après chaque commande validée, via **Resend** et **@react-pdf/renderer**.

---

## 📦 1. Installation des dépendances

```bash
npm install resend @react-pdf/renderer
```

---

## 🔧 2. Variables d'environnement

Ajoute dans ton `.env.local` :

```env
# Resend — récupère ta clé sur https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Adresse expéditeur vérifiée dans Resend (ton domaine ou onboarding@resend.dev en test)
RESEND_FROM_EMAIL=commandes@ton-domaine.fr
```

> 💡 En développement, utilise `onboarding@resend.dev` comme expéditeur (fourni par Resend gratuitement sans vérification de domaine). En production, [vérifie ton domaine](https://resend.com/domains) dans le dashboard Resend.

---

## 🗂️ 3. Arborescence des fichiers à créer

```
src/
├── lib/
│   ├── resend.ts                        # Instance Resend (singleton)
│   └── mailer.ts                        # Fonction sendOrderConfirmation()
├── emails/
│   └── OrderConfirmationEmail.tsx       # Template email HTML (React)
└── pdf/
    └── InvoicePDF.tsx                   # Template facture PDF (@react-pdf/renderer)
```

---

## 📄 4. Génération de la facture PDF

### `src/pdf/InvoicePDF.tsx`

Ce composant génère le PDF de facture avec `@react-pdf/renderer`. Il reçoit les données de la commande et retourne un `Buffer` prêt à être joint à l'email.

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number; // prix unitaire en €
}

export interface InvoiceData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: InvoiceItem[];
  total: number;
  provider: "stripe" | "paypal";
  createdAt: Date;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#3b82f6" },
  invoiceTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  meta: { fontSize: 10, color: "#6b7280", marginBottom: 2 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: "6 8",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    padding: "6 8",
    borderBottom: "1 solid #f3f4f6",
  },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 8,
    borderTop: "2 solid #3b82f6",
  },
  totalLabel: { fontFamily: "Helvetica-Bold", marginRight: 16 },
  totalAmount: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#3b82f6" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
  },
});

// ─── Composant PDF ───────────────────────────────────────────────────────────

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const dateStr = data.createdAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.brand}>Mon Site Vitrine</Text>
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.meta}>N° {data.orderId.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.meta}>Date : {dateStr}</Text>
            <Text style={styles.meta}>
              Paiement : {data.provider === "stripe" ? "Stripe" : "PayPal"}
            </Text>
          </View>
        </View>

        {/* Informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturé à</Text>
          {data.customerName && <Text>{data.customerName}</Text>}
          <Text>{data.customerEmail}</Text>
        </View>

        {/* Tableau des articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail de la commande</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colName}>Article</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>Prix unit.</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.price.toFixed(2)} €</Text>
              <Text style={styles.colTotal}>
                {(item.price * item.quantity).toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total TTC</Text>
          <Text style={styles.totalAmount}>{data.total.toFixed(2)} €</Text>
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          Merci pour votre achat ! Pour toute question : support@ton-domaine.fr
        </Text>
      </Page>
    </Document>
  );
}

// ─── Export : génère le PDF en Buffer ────────────────────────────────────────

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
```

---

## 📧 5. Template email HTML

### `src/emails/OrderConfirmationEmail.tsx`

Template React utilisé par Resend pour générer l'email HTML. Conçu pour être lisible dans tous les clients mail.

```tsx
interface OrderConfirmationEmailProps {
  orderId: string;
  customerName?: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  provider: "stripe" | "paypal";
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  provider,
}: OrderConfirmationEmailProps) {
  return (
    <html>
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f9fafb",
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#3b82f6",
              padding: "28px 32px",
              textAlign: "center" as const,
            }}
          >
            <h1 style={{ color: "#fff", margin: 0, fontSize: 22 }}>
              ✅ Commande confirmée
            </h1>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px" }}>
            <p style={{ color: "#374151", marginTop: 0 }}>
              Bonjour{customerName ? ` ${customerName}` : ""},
            </p>
            <p style={{ color: "#374151" }}>
              Merci pour votre commande ! Votre paiement via{" "}
              <strong>{provider === "stripe" ? "Stripe" : "PayPal"}</strong> a
              bien été reçu.
            </p>

            {/* Récapitulatif */}
            <div
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                padding: "16px 20px",
                margin: "20px 0",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 12,
                  color: "#6b7280",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1,
                }}
              >
                Commande #{orderId.slice(0, 8).toUpperCase()}
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ fontSize: 12, color: "#6b7280" }}>
                    <th style={{ textAlign: "left" as const, paddingBottom: 8 }}>
                      Article
                    </th>
                    <th style={{ textAlign: "center" as const, paddingBottom: 8 }}>
                      Qté
                    </th>
                    <th style={{ textAlign: "right" as const, paddingBottom: 8 }}>
                      Prix
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 0", color: "#111827" }}>
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "center" as const,
                          color: "#6b7280",
                        }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        style={{
                          padding: "8px 0",
                          textAlign: "right" as const,
                          color: "#111827",
                        }}
                      >
                        {(item.price * item.quantity).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #3b82f6" }}>
                    <td
                      colSpan={2}
                      style={{
                        paddingTop: 10,
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      Total TTC
                    </td>
                    <td
                      style={{
                        paddingTop: 10,
                        textAlign: "right" as const,
                        fontWeight: "bold",
                        fontSize: 16,
                        color: "#3b82f6",
                      }}
                    >
                      {total.toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style={{ color: "#6b7280", fontSize: 13 }}>
              Votre facture est disponible en pièce jointe de cet email.
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: "16px 32px",
              textAlign: "center" as const,
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            Une question ? Contactez-nous à{" "}
            <a href="mailto:support@ton-domaine.fr" style={{ color: "#3b82f6" }}>
              support@ton-domaine.fr
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

## 📬 6. Service d'envoi Resend

### `src/lib/resend.ts` — Instance singleton

```ts
import { Resend } from "resend";

// Instance singleton (évite de recréer le client à chaque appel)
export const resend = new Resend(process.env.RESEND_API_KEY);
```

### `src/lib/mailer.ts` — Fonction principale d'envoi

```ts
import { renderToStaticMarkup } from "react-dom/server";
import { resend } from "./resend";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { generateInvoicePDF, type InvoiceData } from "@/pdf/InvoicePDF";

export interface SendOrderConfirmationParams {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  provider: "stripe" | "paypal";
  createdAt?: Date;
}

export async function sendOrderConfirmation(
  params: SendOrderConfirmationParams
): Promise<void> {
  const { orderId, customerEmail, customerName, items, total, provider } = params;
  const createdAt = params.createdAt ?? new Date();

  // 1. Génère le PDF de facture en mémoire (Buffer)
  const invoiceData: InvoiceData = {
    orderId,
    customerEmail,
    customerName,
    items,
    total,
    provider,
    createdAt,
  };
  const pdfBuffer = await generateInvoicePDF(invoiceData);

  // 2. Génère le HTML de l'email
  const emailHtml = renderToStaticMarkup(
    OrderConfirmationEmail({ orderId, customerName, items, total, provider })
  );

  // 3. Envoie l'email via Resend avec le PDF en pièce jointe
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: customerEmail,
    subject: `Confirmation de commande #${orderId.slice(0, 8).toUpperCase()}`,
    html: emailHtml,
    attachments: [
      {
        filename: `facture-${orderId.slice(0, 8)}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    // On log l'erreur mais on ne bloque pas le flux de paiement
    console.error("[Mailer] Erreur envoi email de confirmation :", error);
  }
}
```

> ⚠️ La fonction `sendOrderConfirmation` ne lève pas d'exception même en cas d'échec d'envoi email. Le paiement est déjà confirmé — il ne faut pas faire échouer le webhook à cause d'un email.

---

## 🔗 7. Intégration dans le webhook Stripe

Modifie `src/app/api/stripe/webhook/route.ts` pour appeler `sendOrderConfirmation` une fois la commande passée à `PAID`.

```ts
// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/mailer"; // 👈 import

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.internalOrderId;
    if (!orderId) return NextResponse.json({ received: true });

    // Met à jour la commande en BDD
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { items: { include: { product: true } } },
    });

    // Vide le panier
    await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

    // 👇 Envoi de l'email de confirmation avec facture PDF
    await sendOrderConfirmation({
      orderId: order.id,
      customerEmail: session.customer_details?.email ?? order.userId,
      customerName: session.customer_details?.name ?? undefined,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: order.total,
      provider: "stripe",
      createdAt: order.createdAt,
    });
  }

  return NextResponse.json({ received: true });
}
```

---

## 🔗 8. Intégration dans la capture PayPal

Modifie `src/app/api/paypal/capture-order/route.ts` de la même façon.

```ts
// src/app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/mailer"; // 👈 import

export async function POST(req: NextRequest) {
  const { paypalOrderId, internalOrderId } = await req.json();

  // Capture PayPal (appel API PayPal)
  const accessToken = await getPaypalAccessToken(); // ta fonction existante
  const capture = await fetch(
    `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  const captureData = await capture.json();

  if (captureData.status !== "COMPLETED") {
    return NextResponse.json({ error: "Paiement PayPal échoué" }, { status: 400 });
  }

  // Met à jour la commande en BDD
  const order = await prisma.order.update({
    where: { id: internalOrderId },
    data: { status: "PAID" },
    include: { items: { include: { product: true } } },
  });

  // Vide le panier
  await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

  // 👇 Envoi de l'email de confirmation avec facture PDF
  const payerEmail =
    captureData.payment_source?.paypal?.email_address ?? order.userId;
  const payerName =
    captureData.payment_source?.paypal?.name?.given_name ?? undefined;

  await sendOrderConfirmation({
    orderId: order.id,
    customerEmail: payerEmail,
    customerName: payerName,
    items: order.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    })),
    total: order.total,
    provider: "paypal",
    createdAt: order.createdAt,
  });

  return NextResponse.json({ success: true });
}
```

---

## 🔄 9. Flux complet

```
Paiement validé (Stripe webhook / PayPal capture)
        ↓
Order.status → PAID en BDD + panier vidé
        ↓
sendOrderConfirmation() appelé
        ↓
   ┌─── PDF ──────────────────────────────────────────────────┐
   │  generateInvoicePDF()                                     │
   │  → @react-pdf/renderer génère la facture en mémoire      │
   │  → Retourne un Buffer                                     │
   └──────────────────────────────────────────────────────────┘
        ↓
   ┌─── EMAIL ────────────────────────────────────────────────┐
   │  resend.emails.send()                                     │
   │  → HTML généré depuis OrderConfirmationEmail (React)      │
   │  → PDF Buffer joint en pièce jointe (facture-XXXX.pdf)   │
   │  → Email envoyé à l'adresse du client                    │
   └──────────────────────────────────────────────────────────┘
        ↓
Client reçoit l'email + la facture PDF en pièce jointe
```

---

## ⚠️ 10. Points importants

- **Resend domaine** : en test utilise `onboarding@resend.dev` comme `RESEND_FROM_EMAIL`. En production, [vérifie ton domaine](https://resend.com/domains) pour éviter que tes emails arrivent en spam.
- **Erreur silencieuse** : `sendOrderConfirmation` ne lève pas d'exception. Si l'envoi échoue, l'erreur est loggée mais le webhook Stripe répond `200` — sinon Stripe retentera le webhook indéfiniment.
- **`renderToStaticMarkup`** vs `renderToString` : utilise `renderToStaticMarkup` pour les emails car il génère un HTML propre sans attributs React (`data-reactroot`, etc.), mieux supporté par les clients mail.
- **PDF en mémoire** : le PDF est généré en `Buffer` sans jamais toucher le disque. Aucun fichier temporaire n'est créé sur le serveur.
- **Taille du PDF** : `@react-pdf/renderer` peut être lent sur des factures complexes. Si les performances sont critiques, considère [PDFKit](https://pdfkit.org/) pour une génération plus bas niveau.
- **Nom de l'expéditeur** : pour personnaliser l'affichage dans les clients mail, utilise le format `"Mon Site <commandes@ton-domaine.fr>"` pour le champ `from`.
- **Logs** : en production, remplace `console.error` dans `mailer.ts` par un vrai système de logging (Sentry, Datadog, etc.) pour suivre les échecs d'envoi.
