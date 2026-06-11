# Système de gestion de session en Next.js / TypeScript

> Manuel complet de mise en place d'une architecture de session typée, scalable et maintenable.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Mise en place pas à pas](#3-mise-en-place-pas-à-pas)
   - [3.1 Constantes de rôles](#31-constantes-de-rôles)
   - [3.2 Types & interfaces](#32-types--interfaces)
   - [3.3 Type guards](#33-type-guards)
   - [3.4 Context de session](#34-context-de-session)
   - [3.5 Hook `useAuth`](#35-hook-useauth)
   - [3.6 Composant `ProtectedRoute`](#36-composant-protectedroute)
   - [3.7 Branchement dans `_app.tsx`](#37-branchement-dans-_apptsx)
4. [Fonctionnement en profondeur](#4-fonctionnement-en-profondeur)
   - [4.1 Le pattern `as const`](#41-le-pattern-as-const)
   - [4.2 L'union discriminante](#42-lunion-discriminante)
   - [4.3 Les type guards](#43-les-type-guards)
   - [4.4 Le cycle de vie de la session](#44-le-cycle-de-vie-de-la-session)
5. [Utilisation au quotidien](#5-utilisation-au-quotidien)
6. [FAQ & pièges courants](#6-faq--pièges-courants)

---

## 1. Vue d'ensemble

L'objectif est de disposer d'un système qui répond à ces critères :

- **Typé strictement** : TypeScript sait à tout moment quel type d'utilisateur on manipule.
- **Sans magic strings** : aucune chaîne brute `"guest"` ou `"admin"` dispersée dans le code.
- **Centralisé** : un seul endroit de vérité pour l'état de la session.
- **Composable** : des hooks et composants simples à brancher n'importe où dans l'app.

### Les rôles supportés

| Constante              | Valeur        | Description                          |
|------------------------|---------------|--------------------------------------|
| `USER_ROLES.GUEST`     | `"guest"`     | Visiteur non connecté                |
| `USER_ROLES.REGISTERED`| `"registered"`| Utilisateur connecté standard        |
| `USER_ROLES.MODERATOR` | `"moderator"` | Utilisateur avec droits modération   |
| `USER_ROLES.ADMIN`     | `"admin"`     | Accès complet                        |

---

## 2. Structure des fichiers

```
src/
├── constants/
│   └── roles.ts                  # Constantes de rôles (source de vérité)
│
├── types/
│   ├── session.ts                # Interfaces & types de session
│   └── session.guards.ts         # Fonctions de narrowing TypeScript
│
├── context/
│   └── session.context.tsx       # Provider React + hook useSession
│
├── hooks/
│   └── useAuth.ts                # Hook de haut niveau exposé aux composants
│
├── ui/
│   └── components/
│       └── auth/
│           └── protected-route.tsx  # Composant de protection de routes
│
└── pages/
    └── _app.tsx                  # Point d'entrée — branchement du Provider
```

---

## 3. Mise en place pas à pas

### 3.1 Constantes de rôles

**`src/constants/roles.ts`**

```typescript
export const USER_ROLES = {
  GUEST:      "guest",
  REGISTERED: "registered",
  MODERATOR:  "moderator",
  ADMIN:      "admin",
} as const;

// Type union dérivé automatiquement :
// "guest" | "registered" | "moderator" | "admin"
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

> C'est **l'unique source de vérité** pour les rôles. Toute modification ici se propage
> automatiquement dans tous les types dérivés grâce à `typeof`.

---

### 3.2 Types & interfaces

**`src/types/session.ts`**

```typescript
import { USER_ROLES, UserRole } from "@/constants/roles";

// Statut du chargement de la session
export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

// Utilisateur non connecté — type minimal
export interface GuestUser {
  role: typeof USER_ROLES.GUEST;
}

// Utilisateur connecté — type enrichi
export interface RegisteredUser {
  role: Exclude<UserRole, typeof USER_ROLES.GUEST>;
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  createdAt: Date;
}

// Union discriminante sur `role`
export type SessionUser = GuestUser | RegisteredUser;

// Objet session complet
export interface Session {
  user: SessionUser;
  status: SessionStatus;
  expiresAt?: Date;
}
```

---

### 3.3 Type guards

**`src/types/session.guards.ts`**

```typescript
import { USER_ROLES } from "@/constants/roles";
import { SessionUser, GuestUser, RegisteredUser } from "./session";

// Vérifie si l'utilisateur est connecté
export const isRegistered = (user: SessionUser): user is RegisteredUser =>
  user.role !== USER_ROLES.GUEST;

// Vérifie si l'utilisateur est un visiteur
export const isGuest = (user: SessionUser): user is GuestUser =>
  user.role === USER_ROLES.GUEST;

// Vérifie si l'utilisateur est admin
export const isAdmin = (user: SessionUser): user is RegisteredUser =>
  isRegistered(user) && user.role === USER_ROLES.ADMIN;

// Vérifie si l'utilisateur est modérateur ou admin
export const isModerator = (user: SessionUser): user is RegisteredUser =>
  isRegistered(user) &&
  (user.role === USER_ROLES.MODERATOR || user.role === USER_ROLES.ADMIN);
```

---

### 3.4 Context de session

**`src/context/session.context.tsx`**

```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session, SessionUser } from "@/types/session";
import { USER_ROLES } from "@/constants/roles";

interface SessionContextValue {
  session: Session;
  setUser: (user: SessionUser) => void;
  logout: () => void;
}

// Session par défaut : visiteur non authentifié
const defaultSession: Session = {
  user: { role: USER_ROLES.GUEST },
  status: "unauthenticated",
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    ...defaultSession,
    status: "loading", // On part en "loading" le temps de vérifier le token
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      fetchUserFromToken(token)
        .then((user) => setSession({ user, status: "authenticated" }))
        .catch(() => setSession(defaultSession));
    } else {
      setSession(defaultSession);
    }
  }, []);

  const setUser = (user: SessionUser) =>
    setSession({ user, status: "authenticated" });

  const logout = () => {
    localStorage.removeItem("auth_token");
    setSession(defaultSession);
  };

  return (
    <SessionContext.Provider value={{ session, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook bas niveau — préférer useAuth dans les composants
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
```

---

### 3.5 Hook `useAuth`

**`src/hooks/useAuth.ts`**

```typescript
import { useSession } from "@/context/session.context";
import { isRegistered, isAdmin, isModerator } from "@/types/session.guards";

export function useAuth() {
  const { session, logout } = useSession();
  const { user, status } = session;

  return {
    user,
    status,
    isLoading:         status === "loading",
    isAuthenticated:   status === "authenticated" && isRegistered(user),
    isGuest:           !isRegistered(user),
    isAdmin:           isRegistered(user) && isAdmin(user),
    isModerator:       isRegistered(user) && isModerator(user),
    logout,
  };
}
```

> `useAuth` est la surface publique. Les composants n'ont jamais besoin de toucher
> au context directement ni d'importer les guards manuellement.

---

### 3.6 Composant `ProtectedRoute`

**`src/ui/components/auth/protected-route.tsx`**

```typescript
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/session";
import { USER_ROLES } from "@/constants/roles";
import { useRouter } from "next/router";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Exclude<UserRole, typeof USER_ROLES.GUEST>;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole = USER_ROLES.REGISTERED,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isAdmin, isModerator } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const accessMap: Record<string, boolean> = {
      [USER_ROLES.REGISTERED]: isAuthenticated,
      [USER_ROLES.MODERATOR]:  isModerator,
      [USER_ROLES.ADMIN]:      isAdmin,
    };

    if (!accessMap[requiredRole]) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, requiredRole]);

  if (isLoading) return <div>Chargement...</div>;

  return <>{children}</>;
}
```

---

### 3.7 Branchement dans `_app.tsx`

**`src/pages/_app.tsx`**

```typescript
import type { AppProps } from "next/app";
import { SessionProvider } from "@/context/session.context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

---

## 4. Fonctionnement en profondeur

### 4.1 Le pattern `as const`

Sans `as const`, TypeScript infère un type trop large :

```typescript
// ❌ Sans as const
const USER_ROLES = { GUEST: "guest" };
// TypeScript voit : { GUEST: string }  ← trop large, perd l'information

// ✅ Avec as const
const USER_ROLES = { GUEST: "guest" } as const;
// TypeScript voit : { readonly GUEST: "guest" }  ← type littéral exact
```

Cela permet de dériver `UserRole` automatiquement. Si tu ajoutes `SUPERADMIN: "superadmin"`
dans l'objet, le type union se met à jour sans aucune autre modification.

---

### 4.2 L'union discriminante

`SessionUser` est une **union discriminante** sur la propriété `role` :

```typescript
type SessionUser = GuestUser | RegisteredUser;
//                  role: "guest"   role: "registered" | "moderator" | "admin"
```

TypeScript utilise `role` comme **discriminant** : dès qu'on vérifie sa valeur,
il sait exactement avec quel type on travaille.

```typescript
function greet(user: SessionUser) {
  if (user.role === USER_ROLES.GUEST) {
    // Ici TypeScript sait que user est GuestUser
    // → user.id n'existe pas, l'accès est une erreur de compilation ✅
  } else {
    // Ici TypeScript sait que user est RegisteredUser
    console.log(user.username); // ✅ accès sûr
  }
}
```

---

### 4.3 Les type guards

Les type guards sont des fonctions dont le type de retour est un **prédicat de type** (`user is RegisteredUser`).
Ils permettent de déléguer la logique de narrowing à un endroit centralisé :

```typescript
// Sans type guard — logique éparpillée
if (user.role !== "guest" && user.role !== USER_ROLES.GUEST) { ... }

// Avec type guard — intention claire, réutilisable
if (isRegistered(user)) {
  // TypeScript a narrowé user vers RegisteredUser automatiquement
  console.log(user.email); // ✅
}
```

---

### 4.4 Le cycle de vie de la session

```
App démarre
    │
    ▼
status = "loading"         ← évite tout flash de contenu non autorisé
    │
    ▼
useEffect → lecture du token (localStorage / cookie)
    │
    ├─── Token trouvé → fetchUserFromToken()
    │         ├─── Succès → status = "authenticated", user = RegisteredUser
    │         └─── Échec  → status = "unauthenticated", user = GuestUser
    │
    └─── Pas de token → status = "unauthenticated", user = GuestUser
```

Le statut `"loading"` est crucial : il empêche `ProtectedRoute` de rediriger vers `/login`
avant même d'avoir vérifié si un token valide existe déjà.

---

## 5. Utilisation au quotidien

### Lire l'état de la session dans un composant

```typescript
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const { user, isGuest, isAdmin, logout } = useAuth();

  if (isGuest) return <a href="/login">Se connecter</a>;

  return (
    <div>
      <span>Bonjour, {isRegistered(user) ? user.username : ""}  </span>
      {isAdmin && <a href="/admin">Administration</a>}
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Protéger une page entière

```typescript
// pages/dashboard.tsx
import { ProtectedRoute } from "@/ui/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole={USER_ROLES.REGISTERED}>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### Protéger une page admin

```typescript
// pages/admin/index.tsx
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole={USER_ROLES.ADMIN} redirectTo="/unauthorized">
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

### Connecter un utilisateur après login

```typescript
import { useSession } from "@/context/session.context";
import { USER_ROLES } from "@/constants/roles";

export function LoginForm() {
  const { setUser } = useSession();

  const handleSubmit = async (credentials) => {
    const { token, user } = await loginApi(credentials);
    localStorage.setItem("auth_token", token);
    setUser({
      role: USER_ROLES.REGISTERED,
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: new Date(user.createdAt),
    });
  };
}
```

---

## 6. FAQ & pièges courants

**Pourquoi `as const` plutôt qu'un `enum` ?**

Les `enum` TypeScript génèrent du code JavaScript à l'exécution (un objet IIFE),
ce qui nuit au tree-shaking. Avec `as const`, l'objet est inliné à la compilation
et les valeurs restent de simples strings — parfaitement sérialisables en JSON
et transparentes pour une API ou une base de données.

**Pourquoi `status: "loading"` au démarrage ?**

Sans ce statut intermédiaire, l'app démarre avec `status: "unauthenticated"`.
`ProtectedRoute` verrait un utilisateur non connecté et redirigerait immédiatement
vers `/login`, même si un token valide allait être récupéré 50ms plus tard.

**Peut-on utiliser `next-auth` par-dessus cette architecture ?**

Oui. `next-auth` gère la partie authentification (OAuth, credentials, JWT).
Cette architecture reste valide pour la partie **autorisation** (ce que l'utilisateur
a le droit de faire). Il suffit de remplacer `fetchUserFromToken` par `useSession`
de `next-auth` et d'alimenter le `SessionProvider` custom avec les données retournées.

**Comment ajouter un nouveau rôle ?**

1. Ajouter l'entrée dans `USER_ROLES` dans `constants/roles.ts`.
2. Le type `UserRole` se met à jour automatiquement.
3. Ajouter un guard dans `session.guards.ts` si nécessaire.
4. Mettre à jour `accessMap` dans `ProtectedRoute` si la route doit être accessible.
