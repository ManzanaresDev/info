# Strapi 5 + Next.js — Intégration des images

## 1. URL d'accès à l'API avec les images

```
http://localhost:1337/api/blogs?populate=*
```

---

## 2. Structure de la réponse (Strapi 5)

L'image expose plusieurs formats :

```tsx
blog.imagen.url; // original (2732 KB)
blog.imagen.formats.large.url; // 667x1000
blog.imagen.formats.medium.url; // 500x750
blog.imagen.formats.small.url; // 333x500
blog.imagen.formats.thumbnail.url; // 104x156

blog.imagen.alternativeText; // alt text auto-généré par Strapi
```

> ⚠️ **Strapi 5 vs Strapi 4** : plus de `.attributes` dans la réponse JSON.
> L'accès est direct : `blog.imagen.url` et non `blog.attributes.imagen.data.attributes.url`.

---

## 3. Type TypeScript

```tsx
type Blog = {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  imagen: {
    url: string;
    alternativeText: string;
    formats: {
      thumbnail: { url: string; width: number; height: number };
      small: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      large: { url: string; width: number; height: number };
    };
  };
};
```

---

## 4. Fetch des données

```tsx
const STRAPI_URL = "http://localhost:1337";

async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(`${STRAPI_URL}/api/blogs?populate=*`);
  const json = await res.json();
  return json.data;
}
```

---

## 5. Composant Next.js

```tsx
export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div>
      {blogs.map((blog) => (
        <article key={blog.id}>
          <Image
            src={`${STRAPI_URL}${blog.imagen.formats.medium.url}`}
            alt={blog.imagen.alternativeText}
            width={500}
            height={750}
          />
          <h2>{blog.titulo}</h2>
          <p>{blog.resumen}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## 6. Configuration de next.config.js

**Cette configuration est dynamique est pas besoin de modifier ce ficher en production**

```js
// next.config.ts
const serverUrl = new URL(
  process.env.NEXT_PUBLIC_BLOG_URL || "http://localhost:1337",
);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: serverUrl.protocol.replace(":", "") as "http" | "https",
        hostname: serverUrl.hostname, // → "localhost"
        port: serverUrl.port, // → "1337"
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
```

et si l'on charge les images depuis Cloudinary

```js
// next.config.ts
const serverUrl = new URL(
  process.env.NEXT_PUBLIC_BLOG_URL || "http://localhost:1337",
);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: serverUrl.protocol.replace(":", "") as "http" | "https",
        hostname: serverUrl.hostname, // → "localhost"
        port: serverUrl.port, // → "1337"
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

```

---

## 7. Quel format utiliser ?

| Contexte         | Format recommandé   |
| ---------------- | ------------------- |
| Card / liste     | `formats.medium`    |
| Page de détail   | `formats.large`     |
| Miniature / hero | `formats.small`     |
| Favicon / avatar | `formats.thumbnail` |
