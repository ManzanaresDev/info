# Guide Complet : Next.js + Auth.js + MongoDB + Rôles + Middleware + Server Actions

## Sommaire

1. Architecture générale
2. Installation
3. Structure du projet
4. Connexion MongoDB
5. Modèle User
6. Configuration Auth.js
7. Authentification par email/mot de passe
8. Gestion des rôles (admin/user)
9. Middleware de protection
10. Server Actions
11. Pages protégées
12. Vérification des permissions
13. Déconnexion
14. Bonnes pratiques
15. Exemple d'architecture professionnelle

---

# 1. Architecture générale

```text
Client
  |
  v
Server Action Login
  |
  v
Auth.js
  |
  v
MongoDB
  |
  v
Session
  |
  +--> Middleware
  |
  +--> Pages protégées
```

---

# 2. Installation

```bash
npm install next-auth
npm install mongoose
npm install bcryptjs
```

---

# 3. Structure du projet

```text
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── admin/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
├── actions/
├── lib/
├── models/
├── auth.ts
├── middleware.ts
```

---

# 4. Connexion MongoDB

## lib/mongodb.ts

```ts
import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(process.env.MONGODB_URI!);
}
```

---

# 5. Modèle User

## models/User.ts

```ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
```

---

# 6. Configuration Auth.js

## auth.ts

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        return null;
      },
    }),
  ],
});
```

---

# 7. Authentification avec MongoDB

```ts
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

async authorize(credentials) {
  await connectDB();

  const user = await User.findOne({
    email: credentials.email,
  });

  if (!user) return null;

  const valid = await bcrypt.compare(
    credentials.password as string,
    user.password
  );

  if (!valid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
```

---

# 8. Ajouter le rôle dans la session

```ts
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
    }

    return token;
  },

  async session({ session, token }) {
    session.user.role = token.role as string;
    return session;
  },
}
```

Typescript :

```ts
declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      role: string;
    };
  }
}
```

---

# 9. Middleware

## middleware.ts

```ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
```

Le middleware bloque les visiteurs non authentifiés.

---

# 10. Server Action Login

```ts
"use server";

import { signIn } from "@/auth";

export async function loginAction(
  formData: FormData
) {
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/dashboard",
  });
}
```

---

# 11. Formulaire Login

```tsx
import { loginAction } from "@/actions/login";

export default function LoginPage() {
  return (
    <form action={loginAction}>
      <input
        name="email"
        type="email"
      />

      <input
        name="password"
        type="password"
      />

      <button>
        Connexion
      </button>
    </form>
  );
}
```

---

# 12. Page Dashboard protégée

```ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      Bonjour {session.user.name}
    </div>
  );
}
```

---

# 13. Page Admin

```ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <h1>Admin</h1>;
}
```

---

# 14. Déconnexion

```tsx
import { signOut } from "@/auth";

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({
          redirectTo: "/login",
        });
      }}
    >
      <button>
        Déconnexion
      </button>
    </form>
  );
}
```

---

# 15. Création d'un utilisateur

```ts
import bcrypt from "bcryptjs";

const hash = await bcrypt.hash(
  password,
  10
);

await User.create({
  name,
  email,
  password: hash,
});
```

Ne jamais stocker les mots de passe en clair.

---

# 16. Bonnes pratiques

## Toujours

- Utiliser bcrypt.
- Utiliser Auth.js.
- Utiliser des Server Actions.
- Utiliser un middleware.
- Utiliser HTTPS en production.

## Éviter

- Stocker les mots de passe en clair.
- Utiliser localStorage pour les sessions.
- Exposer les rôles côté client comme unique protection.

---

# 17. Architecture recommandée

```text
Next.js App Router
│
├── Auth.js
│
├── MongoDB
│
├── Middleware
│
├── Server Actions
│
├── Dashboard
│
└── Admin
```

Flux complet :

1. L'utilisateur saisit email + mot de passe.
2. Server Action appelle signIn().
3. Auth.js vérifie MongoDB.
4. Une session sécurisée est créée.
5. Middleware protège les routes.
6. auth() récupère la session.
7. Le rôle admin/user est vérifié.
8. La page est affichée.
