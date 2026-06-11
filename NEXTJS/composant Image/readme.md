# Manuel — Composant `<Image>` Next.js avec serveur distant

> Cas d'usage : `<Image src={`${serverUrl}${blog.imagen.url}`} ... />`

---

## 1. Pourquoi Next.js bloque les images distantes

Next.js optimise automatiquement les images (redimensionnement, conversion WebP, lazy loading). Par sécurité, **tout domaine externe doit être explicitement autorisé** dans `next.config.js` — y compris `localhost` — sinon vous obtenez :

```
Error: Invalid src prop on `next/image`, hostname "localhost" is not configured
under images in your `next.config.js`
```

> ✅ **`localhost` n'est pas une exception** : même en développement local, il faut le déclarer explicitement.

---

## 2. Configuration `next.config.js` (solution principale)

### 2.1 Config locale + production — la config complète recommandée

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ─── DÉVELOPPEMENT LOCAL (Strapi sur localhost:1337) ───────────────
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',           // port de votre Strapi local
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',  // alias IP de localhost (compatibilité)
        port: '1337',
        pathname: '/uploads/**',
      },
      // ─── PRODUCTION (votre vrai domaine Strapi) ────────────────────────
      {
        protocol: 'https',
        hostname: 'mon-strapi.com',
        port: '',               // laisser vide = port standard 443
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

> 💡 Vous pouvez ajouter autant d'entrées que nécessaire dans `remotePatterns`.

### 2.2 Config dynamique via variable d'environnement (meilleure pratique)

Évitez de hardcoder le domaine : lisez-le depuis `.env.local` :

```bash
# .env.local
NEXT_PUBLIC_SERVER_URL=http://localhost:1337

# .env.production
NEXT_PUBLIC_SERVER_URL=https://mon-strapi.com
```

```js
// next.config.js
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:1337';
const parsed   = new URL(serverUrl);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: parsed.protocol.replace(':', ''), // 'http' ou 'https'
        hostname: parsed.hostname,                  // 'localhost' ou 'mon-strapi.com'
        port:     parsed.port || '',                // '1337' ou ''
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

Cette approche **gère localhost en dev et le vrai domaine en prod** sans rien changer au code.

> 💡 Si vous utilisez `http://127.0.0.1:1337` dans votre `.env.local`, `parsed.hostname` vaudra automatiquement `127.0.0.1` — pas besoin de cas particulier.

### 2.3 Avec `domains` (ancienne méthode — dépréciée mais fonctionnelle)

```js
// next.config.js
const nextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1', 'mon-strapi.com'],
  },
};

module.exports = nextConfig;
```

> ⚠️ `domains` est moins sécurisé (autorise tous les chemins du domaine) et sera supprimé dans une future version de Next.js.


---

## 3. Utilisation correcte du composant

### Votre code actuel

```tsx
<Image
  src={`${serverUrl}${blog.imagen.url}`}
  alt={blog.imagen.alternativeText || blog.titulo}
  width={800}
  height={500}
  className="w-full h-[250px] object-cover"
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

### Explication de chaque prop

| Prop | Rôle | Remarque |
|------|------|----------|
| `src` | URL complète de l'image | Doit être sur un domaine autorisé |
| `alt` | Texte alternatif | Toujours fournir un fallback |
| `width` | Largeur intrinsèque en px | Sert au ratio, pas à l'affichage CSS |
| `height` | Hauteur intrinsèque en px | Sert au ratio, pas à l'affichage CSS |
| `className` | Style CSS Tailwind | `object-cover` + hauteur fixe = crop |
| `sizes` | Hints pour le navigateur | Permet de charger la bonne résolution |

---

## 4. Pattern `fill` (alternative si dimensions inconnues)

Si vous ne connaissez pas les dimensions de l'image au moment du rendu, utilisez `fill` à la place de `width`/`height` :

```tsx
<div className="relative w-full h-[250px]">
  <Image
    src={`${serverUrl}${blog.imagen.url}`}
    alt={blog.imagen.alternativeText || blog.titulo}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 33vw"
  />
</div>
```

> Le parent **doit** avoir `position: relative` (ou `absolute`/`fixed`) et une hauteur définie.

---

## 5. Désactiver l'optimisation (solution de contournement rapide)

Si vous ne pouvez pas modifier `next.config.js` ou si le domaine est trop dynamique, vous pouvez désactiver l'optimisation **uniquement pour cette image** :

```tsx
<Image
  src={`${serverUrl}${blog.imagen.url}`}
  alt={blog.imagen.alternativeText || blog.titulo}
  width={800}
  height={500}
  className="w-full h-[250px] object-cover"
  sizes="(max-width: 768px) 100vw, 33vw"
  unoptimized   // ← désactive l'optimisation Next.js
/>
```

> ⚠️ `unoptimized` désactive WebP, resize, et cache côté serveur. À éviter en production si la performance est importante.

### Désactiver globalement (pour tous les domaines)

```js
// next.config.js
const nextConfig = {
  images: {
    unoptimized: true,
  },
};
```

---

## 6. Loader personnalisé (cas avancé)

Si votre CMS génère des URLs avec des paramètres spéciaux, vous pouvez définir un loader custom :

```tsx
// lib/imageLoader.ts
const strapiLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Dans votre composant
<Image
  loader={strapiLoader}
  src={`${serverUrl}${blog.imagen.url}`}
  alt={blog.imagen.alternativeText || blog.titulo}
  width={800}
  height={500}
  className="w-full h-[250px] object-cover"
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

---

## 7. Gestion des erreurs de chargement

```tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function BlogImage({ blog, serverUrl }: Props) {
  const [imgSrc, setImgSrc] = useState(`${serverUrl}${blog.imagen.url}`);

  return (
    <Image
      src={imgSrc}
      alt={blog.imagen.alternativeText || blog.titulo}
      width={800}
      height={500}
      className="w-full h-[250px] object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
      onError={() => setImgSrc('/images/placeholder.jpg')} // image de fallback
    />
  );
}
```

---

## 8. Récapitulatif — Choisir la bonne approche

```
Domaine connu et fixe ?
  ✅ Oui → remotePatterns dans next.config.js     (recommandé)
  
Domaine dynamique via env variable ?
  ✅ Oui → remotePatterns avec URL parsée          (recommandé)
  
Besoin d'un fix rapide sans toucher la config ?
  ⚠️  unoptimized={true} sur le composant         (acceptable en dev)

Dimensions de l'image inconnues ?
  ✅  Utiliser fill + conteneur relatif positionné

Image depuis un CDN avec paramètres custom ?
  ✅  loader personnalisé
```

---

## 9. Exemple complet — Carte de blog avec Strapi

```tsx
// components/BlogCard.tsx
import Image from 'next/image';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:1337';

interface Blog {
  titulo: string;
  imagen: {
    url: string;
    alternativeText: string | null;
  };
}

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article className="rounded-lg overflow-hidden shadow-md">
      <div className="relative w-full h-[250px]">
        <Image
          src={`${serverUrl}${blog.imagen.url}`}
          alt={blog.imagen.alternativeText || blog.titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={false}   // true uniquement pour les images above-the-fold
        />
      </div>
      <div className="p-4">
        <h2>{blog.titulo}</h2>
      </div>
    </article>
  );
}
```

```js
// next.config.js correspondant
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mon-strapi.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
```
