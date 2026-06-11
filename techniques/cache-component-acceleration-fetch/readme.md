# Manuel : `use cache` dans Next.js 15+

> **Disponible depuis** : Next.js 15 (expérimental)  
> **Remplace** : `fetch()` avec `cache`, `revalidate`, `unstable_cache`

---

## 1. Activation

Dans `next.config.ts` :

```typescript
const nextConfig = {
  experimental: {
    dynamicIO: true, // ✅ active "use cache"
  },
};

export default nextConfig;
```

---

## 2. `"use cache"` — La directive de base

`"use cache"` s'utilise comme `"use client"` ou `"use server"` — en haut d'un fichier ou d'une fonction.

### Sur un composant entier

```typescript
"use cache"; // ✅ tout le fichier est mis en cache

import { recuperarBlogs } from "@/lib/blog";

export async function Blogs() {
  const blogs = await recuperarBlogs();
  return <div>{/* ... */}</div>;
}
```

### Sur une fonction spécifique

```typescript
import { recuperarHero } from "@/lib/hero";

export async function getHero() {
  "use cache"; // ✅ seulement cette fonction est mise en cache

  const hero = await recuperarHero();
  return hero;
}
```

### Sur une route entière (page)

```typescript
"use cache";

export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  return <main>{/* ... */}</main>;
}
```

---

## 3. `cacheLife` — Durée de vie du cache

`cacheLife` définit **combien de temps** les données restent en cache.

### Import

```typescript
import { cacheLife } from "next/cache";
```

### Profils prédéfinis

| Profil | `stale` | `revalidate` | `expire` | Usage |
|--------|---------|--------------|----------|-------|
| `"seconds"` | 0s | 1s | 1min | Données très dynamiques |
| `"minutes"` | 1min | 1min | 1h | Par défaut |
| `"hours"` | 1h | 1h | 1 jour | Articles de blog |
| `"days"` | 1 jour | 1 jour | 1 semaine | Contenu stable |
| `"weeks"` | 1 semaine | 1 semaine | 30 jours | Pages statiques |
| `"max"` | 30 jours | 30 jours | 1 an | Contenu permanent |

### Utilisation avec un profil

```typescript
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function getHero() {
  "use cache";
  cacheLife("hours"); // ✅ cache pendant 1 heure

  const response = await fetch(`${Config.serverUrl}/api/hero`);
  return response.json();
}
```

### Utilisation avec des valeurs personnalisées

```typescript
export async function getBlogs() {
  "use cache";
  cacheLife({
    stale: 60,        // données considérées fraîches pendant 60s
    revalidate: 300,  // revalide en arrière-plan toutes les 5min
    expire: 3600,     // expire définitivement après 1h
  });

  const response = await fetch(`${Config.serverUrl}/api/blogs`);
  return response.json();
}
```

### Définir des profils personnalisés dans `next.config.ts`

```typescript
const nextConfig = {
  experimental: {
    dynamicIO: true,
    cacheLife: {
      blog: {
        stale: 3600,       // 1 heure
        revalidate: 900,   // 15 minutes
        expire: 86400,     // 1 jour
      },
      hero: {
        stale: 86400,      // 1 jour
        revalidate: 3600,  // 1 heure
        expire: 604800,    // 1 semaine
      },
    },
  },
};
```

Puis utiliser :

```typescript
cacheLife("blog");  // ✅ utilise le profil personnalisé
cacheLife("hero");
```

---

## 4. `cacheTag` — Invalidation ciblée

`cacheTag` permet de **taguer** le cache pour l'invalider manuellement (ex: après une mise à jour CMS).

### Import

```typescript
import { cacheTag } from "next/cache";
```

### Taguer le cache

```typescript
export async function getHero() {
  "use cache";
  cacheLife("days");
  cacheTag("hero"); // ✅ tag pour invalidation future

  const response = await fetch(`${Config.serverUrl}/api/hero`);
  return response.json();
}

export async function getBlogs() {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs"); // ✅ tag différent

  const response = await fetch(`${Config.serverUrl}/api/blogs?populate=*`);
  return response.json();
}
```

### Invalider le cache via une Server Action

```typescript
"use server";

import { revalidateTag } from "next/cache";

// Appelé depuis un webhook Strapi par exemple
export async function revaliderHero() {
  revalidateTag("hero"); // ✅ invalide uniquement le cache "hero"
}

export async function revaliderBlogs() {
  revalidateTag("blogs"); // ✅ invalide uniquement le cache "blogs"
}
```

### Invalider depuis une API Route

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { tag } = await request.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

---

## 5. Exemple complet — Strapi + Next.js

```typescript
// lib/hero.ts
import { unstable_cacheLife as cacheLife } from "next/cache";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { Config } from "@/config/config";

export interface HeroData {
  documentId: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

export async function recuperarHero(): Promise<HeroData | null> {
  "use cache";
  cacheLife("days");   // cache 1 jour
  cacheTag("hero");    // tag pour invalidation

  try {
    const response = await fetch(`${Config.serverUrl}/api/hero`);
    if (!response.ok) return null;

    const json = await response.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
```

```typescript
// lib/blog.ts
import { unstable_cacheLife as cacheLife } from "next/cache";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { Config } from "@/config/config";

export type Blog = {
  id: number;
  documentId: string;
  titulo: string;
  resumen: string;
  descripcion: string;
  imagen: { url: string; alternativeText: string } | null;
  createdAt: string;
};

export async function recuperarBlogs(): Promise<Blog[]> {
  "use cache";
  cacheLife("hours");  // cache 1 heure
  cacheTag("blogs");   // tag pour invalidation

  const response = await fetch(
    `${Config.serverUrl}${Config.blogsApi}?populate=*`
  );

  if (!response.ok) throw new Error("Erreur lors du chargement des blogs");

  const resultado = await response.json();
  return resultado.data;
}
```

---

## 6. `"use cache"` vs anciennes méthodes

| Méthode | Next.js | Avantage |
|---------|---------|----------|
| `fetch({ next: { revalidate } })` | 13+ | Simple mais limité au fetch |
| `unstable_cache()` | 14 | Fonctionne hors fetch, mais verbose |
| `"use cache"` | 15+ | ✅ Fonctionne partout, syntaxe claire |

---

## 7. Points importants

> ⚠️ **Arguments sérialisables** : Les fonctions avec `"use cache"` ne peuvent recevoir que des arguments sérialisables (string, number, object simple — pas de fonctions, pas de classes).

> ⚠️ **Pas de données sensibles** : Ne mets jamais de tokens ou données utilisateur dans une fonction `"use cache"` partagée.

> ℹ️ **`unstable_` prefix** : En Next.js 15, les imports s'écrivent encore `unstable_cacheLife` et `unstable_cacheTag` car l'API est expérimentale.

```typescript
// Import correct en Next.js 15
import { unstable_cacheLife as cacheLife } from "next/cache";
import { unstable_cacheTag as cacheTag } from "next/cache";
```
