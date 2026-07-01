# Organisation professionnelle d'un projet Next.js

## Le pattern le plus répandu : Feature-based + Server/Client separation

La clé en Next.js (App Router) est de bien séparer :
- **Server Components** → fetch des données, pas d'interactivité
- **Client Components** → interactivité, state, events (`"use client"`)

---

## Structure de dossiers recommandée

```
src/
├── app/                          # Routing Next.js (App Router)
│   ├── (marketing)/              # Route groups (sans impact sur l'URL)
│   │   └── about/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx            # Layout partagé de la section
│   │   ├── page.tsx              # Server Component — point d'entrée
│   │   ├── loading.tsx           # Suspense UI automatique
│   │   └── error.tsx             # Error boundary automatique
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── layout.tsx                # Root layout
│
├── features/                     # ⭐ Cœur de l'architecture
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── DashboardView.tsx         # Orchestrateur visuel (client)
│   │   │   ├── StatsGrid.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   ├── actions/
│   │   │   └── dashboard.actions.ts      # Server Actions
│   │   ├── queries/
│   │   │   └── dashboard.queries.ts      # Fetch serveur (db, API)
│   │   └── types/
│   │       └── index.ts
│   │
│   └── products/
│       ├── components/
│       │   ├── ProductsView.tsx
│       │   ├── ProductCard.tsx
│       │   └── ProductFilters.tsx
│       ├── hooks/
│       │   └── useProductFilters.ts
│       ├── actions/
│       │   └── products.actions.ts
│       └── queries/
│           └── products.queries.ts
│
├── components/                   # Composants UI génériques/partagés
│   ├── ui/                       # Primitives (Button, Modal, Input...)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── layout/                   # Header, Sidebar, Footer...
│       ├── Header.tsx
│       └── Sidebar.tsx
│
├── lib/                          # Utilitaires techniques
│   ├── db.ts                     # Client DB (Prisma, Drizzle...)
│   ├── auth.ts
│   └── utils.ts
│
├── hooks/                        # Hooks globaux réutilisables
│   └── useDebounce.ts
│
└── types/                        # Types globaux partagés
    └── index.ts
```

---

## Le pattern Page → View → Components

### `app/products/page.tsx` — Server Component pur

```tsx
// Pas de "use client" → s'exécute côté serveur
import { getProducts } from "@/features/products/queries/products.queries";
import { ProductsView } from "@/features/products/components/ProductsView";

// Le fetch se fait ICI, au plus haut niveau serveur
export default async function ProductsPage() {
  const products = await getProducts(); // direct DB ou API

  return <ProductsView initialProducts={products} />;
}
```

### `features/products/queries/products.queries.ts` — Couche data serveur

```ts
// S'exécute uniquement serveur — accès direct DB possible
import { db } from "@/lib/db";

export async function getProducts() {
  return db.product.findMany({ orderBy: { createdAt: "desc" } });
}
```

### `features/products/components/ProductsView.tsx` — Orchestrateur client

```tsx
"use client"; // interactivité : filtres, state, events

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { useProductFilters } from "../hooks/useProductFilters";

// Reçoit les données du Server Component parent
export function ProductsView({ initialProducts }) {
  const { filtered, setFilter } = useProductFilters(initialProducts);

  return (
    <div>
      <ProductFilters onChange={setFilter} />
      <div className="grid">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
```

---

## Les règles d'or

| Règle | Pourquoi |
|---|---|
| `page.tsx` = Server Component | Fetch au plus près de la source, zéro JS envoyé |
| `View.tsx` = Client Component | Reçoit les données, gère l'état et l'UI interactive |
| `queries/` = serveur uniquement | Logique data isolée, testable indépendamment |
| `actions/` = Server Actions | Mutations (POST, PUT, DELETE) sans API route |
| `hooks/` = logique client réutilisable | Sépare la logique du rendu |
| Composants UI dans `components/ui/` | Réutilisables, sans logique métier |

---

## Server Actions

```ts
// features/products/actions/products.actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } });
  revalidatePath("/products"); // revalide le cache automatiquement
}
```

Utilisé directement dans un composant client :

```tsx
<button onClick={() => deleteProduct(product.id)}>Supprimer</button>
```

---

## Résumé du flux

```
page.tsx (Server)
  └── récupère les données (queries/)
       └── passe à View.tsx (Client)
            ├── gère le state local + filtres (hooks/)
            ├── appelle des mutations (actions/)
            └── délègue le rendu aux sous-composants
```

Cette architecture **scale** bien car chaque feature est autonome, les responsabilités sont clairement séparées, et elle tire pleinement parti du modèle Server/Client de Next.js App Router.
