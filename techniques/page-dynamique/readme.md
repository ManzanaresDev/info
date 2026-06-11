# 📘 Manuel — Récupération des params avec App Router (Next.js)

## 🧭 1. Comprendre le App Router

Dans Next.js (13+), il existe deux systèmes de routing :

- `pages/` → ancien système (Pages Router)
- `app/` → nouveau système (App Router)

👉 Dans le App Router :

- ❌ plus de `next/router`
- ❌ plus de `getServerSideProps`
- ✅ les params sont injectés directement

---

## 📁 2. Structure d’une route dynamique

Exemple :

```
app/
└── blogs/
└── [documentId]/
└── page.tsx
```

👉 `[documentId]` est un paramètre dynamique.

---

## ⚙️ 3. Récupération côté SERVER (recommandé)

### ✔️ Méthode principale

```tsx
type Props = {
  params: Promise<{ documentId: string }>;
};

export default async function ArticlePage({ params }: Props) {
  const { documentId } = await params;

  // Exemple propre : fetch côté serveur
  const article = await fetch(`${process.env.API_URL}/articles/${documentId}`, {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
}
```

## ⚛️ 4. Récupération côté CLIENT (hook)

Si tu es dans un composant client :

```typescript
"use client";

import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const documentId = params.documentId;

  return <div>Article : {documentId}</div>;
}
```

## 🔥 5. Différences importantes

| Méthode         | Usage            | Avantages           |
| --------------- | ---------------- | ------------------- |
| params (server) | page.tsx         | rapide, SEO, propre |
| useParams()     | client component | interactif          |
| next/router     | ❌ interdit      | ancien système      |

## 🚨 6. Erreurs fréquentes

❌ Utiliser next/router

```typescript
import { useRouter } from "next/router";
```

👉 ne fonctionne pas dans App Router

❌ Oublier "use client"

```typescript
useParams(); // ❌ si pas en client component
```

## 🧠 7. Bonnes pratiques

- ✔ privilégier params côté serveur
- ✔ utiliser useParams() uniquement si nécessaire
- ✔ éviter de transformer toute la page en client component
- ✔ garder les pages dynamiques simples

## 🚀 8. Exemple complet propre

Server Component (recommandé)

```typescript
export default function Page({ params }) {
  return <h1>Article {params.documentId}</h1>;
}
```

Client Component (si nécessaire)

```typescript
"use client";

import { useParams } from "next/navigation";

export default function Page() {
  const { documentId } = useParams();

  return <h1>Article {documentId}</h1>;
}
```

## 🧩 Conclusion

Dans le App Router :

- 📦 params = méthode officielle (server)
- ⚛️ useParams() = alternative client
- ❌ next/router = obsolète ici
