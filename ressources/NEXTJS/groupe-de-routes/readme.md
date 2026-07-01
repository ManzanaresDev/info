# Manuel : Route Groups `(groupe)` dans Next.js

> **Disponible depuis** : Next.js 13 (App Router)  
> **Syntaxe** : Un dossier entouré de parenthèses `(nom)`  
> **Impact sur l'URL** : Aucun

---

## 1. Concept de base

Un **Route Group** est un dossier dont le nom est entre parenthèses. Il permet de regrouper des routes logiquement sans créer de segment d'URL supplémentaire.

```
app/
├── (marketing)/
│   └── about/page.tsx   →  /about  ✅ (pas /marketing/about)
├── (blog)/
│   └── posts/page.tsx   →  /posts  ✅ (pas /blog/posts)
```

---

## 2. Layouts différents par groupe

C'est l'usage le plus puissant. Chaque groupe peut avoir son propre `layout.tsx`.

### Structure

```
app/
├── (public)/
│   ├── layout.tsx          ← Header + Footer
│   ├── page.tsx            →  /
│   ├── about/
│   │   └── page.tsx        →  /about
│   └── contact/
│       └── page.tsx        →  /contact
│
├── (auth)/
│   ├── layout.tsx          ← Layout centré, sans nav
│   ├── login/
│   │   └── page.tsx        →  /login
│   └── register/
│       └── page.tsx        →  /register
│
├── (admin)/
│   ├── layout.tsx          ← Sidebar admin
│   ├── dashboard/
│   │   └── page.tsx        →  /dashboard
│   └── users/
│       └── page.tsx        →  /users
```

### Layout public — avec Header et Footer

```typescript
// app/(public)/layout.tsx
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Layout auth — centré, minimaliste

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {children}
      </div>
    </main>
  );
}
```

### Layout admin — avec sidebar

```typescript
// app/(admin)/layout.tsx
import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
```

---

## 3. Partager un layout entre plusieurs groupes

Si plusieurs groupes partagent le même layout, tu peux utiliser le `layout.tsx` racine :

```
app/
├── layout.tsx              ← Layout global (html, body)
├── (public)/
│   ├── layout.tsx          ← Layout public
│   └── page.tsx
└── (admin)/
    ├── layout.tsx          ← Layout admin
    └── dashboard/page.tsx
```

```typescript
// app/layout.tsx — racine obligatoire
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

> ⚠️ Le `layout.tsx` à la racine de `app/` est **obligatoire** et doit contenir les balises `<html>` et `<body>`.

---

## 4. Organiser sans layout différent

Les route groups servent aussi à **organiser le code** sans forcément changer le layout :

```
app/
├── (features)/
│   ├── blogs/
│   │   └── page.tsx        →  /blogs
│   ├── guitars/
│   │   └── page.tsx        →  /guitars
│   └── contact/
│       └── page.tsx        →  /contact
│
├── (legal)/
│   ├── mentions-legales/
│   │   └── page.tsx        →  /mentions-legales
│   └── confidentialite/
│       └── page.tsx        →  /confidentialite
```

---

## 5. Exemple concret — Projet Strapi + Next.js

```
app/
├── layout.tsx                      ← RootLayout (html + body)
│
├── (site)/
│   ├── layout.tsx                  ← Header + Footer du site
│   ├── page.tsx                    →  /
│   └── blogs/
│       ├── page.tsx                →  /blogs
│       └── [documentId]/
│           └── page.tsx            →  /blogs/[documentId]
│
├── (auth)/
│   ├── layout.tsx                  ← Layout centré
│   ├── login/
│   │   └── page.tsx                →  /login
│   └── register/
│       └── page.tsx                →  /register
│
└── (studio)/
    ├── layout.tsx                  ← Layout sans nav
    └── admin/
        └── page.tsx                →  /admin
```

---

## 6. Règles importantes

### ✅ Ce qu'on peut faire

```
app/
├── (groupe-a)/
│   └── page.tsx    →  /        ← page racine dans un groupe
└── (groupe-b)/
    └── about/
        └── page.tsx →  /about
```

### ❌ Ce qu'il faut éviter

```
app/
├── (groupe-a)/
│   └── about/page.tsx   →  /about  ⚠️ CONFLIT
└── (groupe-b)/
    └── about/page.tsx   →  /about  ⚠️ CONFLIT
```

> ⚠️ Deux groupes différents **ne peuvent pas** résoudre vers la même URL — Next.js retournera une erreur de build.

---

## 7. Comparaison avec et sans Route Groups

| Situation | Sans Route Groups | Avec Route Groups |
|-----------|-------------------|-------------------|
| Layouts multiples | Difficile à gérer | ✅ Un layout par groupe |
| Organisation du code | Tous les dossiers = segments URL | ✅ Dossiers `()` invisibles |
| Lisibilité | Mélange de sections | ✅ Séparation claire |
| URL générées | `/marketing/about` | ✅ `/about` |

---

## 8. Résumé

| Fonctionnalité | Description |
|----------------|-------------|
| `(groupe)` | Dossier invisible dans l'URL |
| `layout.tsx` dans un groupe | Layout propre à ce groupe |
| Plusieurs groupes | Plusieurs layouts différents |
| Pas d'impact URL | `/about` reste `/about` |
| Conflit d'URL | Impossible d'avoir deux fois la même route |

> En résumé : les Route Groups permettent d'**organiser ton code** et d'avoir des **layouts différents par section** (public, auth, admin) sans jamais modifier les URLs finales.
