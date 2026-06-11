# 🚀 Optimisation des images Sanity avec Next.js

Ce guide explique comment réduire la consommation de bandwidth avec **Sanity + Next.js** en optimisant les images et le chargement.

---

## 🧠 1. Principe de base

Avec Sanity, les images sont servies via un CDN.  
Le but est de **ne jamais charger l’image originale**, mais une version optimisée.

---

## 🖼️ 2. Générer des images optimisées avec Sanity

Installe l’outil si ce n’est pas déjà fait :

```bash
npm install @sanity/image-url
```

Crée un helper :

```javascript
// lib/imageUrl.js
import imageUrlBuilder from "@sanity/image-url";
import { client } from "./sanity";

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
```

## ⚡ 3. Optimiser les images

Installe l’outil si ce n’est pas déjà fait :

```javascript
urlFor(image).width(800).format("webp").quality(70).url();
```

Bonnes pratiques :

- width → adapter à l’affichage réel
- format("webp") → compression moderne
- quality(60-80) → bon compromis poids/qualité

## ⚛️ 4. Utiliser Next.js Image

Next.js optimise automatiquement les images.

```javascript
import Image from "next/image";
import { urlFor } from "@/lib/imageUrl";

export default function Card({ image }) {
  return (
    <Image
      src={urlFor(image).width(800).url()}
      width={800}
      height={500}
      alt="image"
      loading="lazy"
    />
  );
}
```

## 📱 5. Responsive images

Créer plusieurs tailles :

```javascript
const small = urlFor(image).width(400).url();
const medium = urlFor(image).width(800).url();
const large = urlFor(image).width(1200).url();
```

Next.js choisit automatiquement la bonne version.

## 🧊 6. Lazy loading

Par défaut :

```javascript
<Image loading="lazy" />
```

⚠️ Exception :

Pour une image principale (hero) :

```javascript
<Image loading="lazy" />
```

## ⚙️ 7. Optimisation des requêtes Sanity

Par défaut :

```javascript
export async function getStaticProps() {
  const data = await client.fetch(`*[_type == "post"]`);

  return {
    props: { data },
    revalidate: 60,
  };
}
```

## 🧹 8. Bonnes pratiques CMS

Dans Sanity Studio :

- éviter images > 2000px
- compresser avant upload
- privilégier JPG/WebP
- nommer correctement les assets

## 📊 9. Résumé

- ✔ images redimensionnées côté Sanity
- ✔ format WebP
- ✔ qualité réduite
- ✔ lazy loading
- ✔ Next.js Image
- ✔ SSG / ISR pour réduire les requêtes

## 🚀 Résultat

- 👉 moins de bandwidth
- 👉 site plus rapide
- 👉 meilleure UX
- 👉 coûts Sanity réduits
