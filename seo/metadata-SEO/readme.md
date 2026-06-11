# 🏷️ Gérer le `<head>` dans Next.js (App Router)

Dans Next.js App Router, le `<head>` se gère via **`export const metadata`** dans `layout.tsx` ou `page.tsx`, sans jamais écrire de balise `<head>` manuellement.

---

## Dans `layout.tsx` (global, toutes les pages)

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon Site",
  description: "Description du site",
  keywords: ["next.js", "react"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Mon Site",
    description: "Description",
    url: "https://monsite.com",
    images: [{ url: "/og-image.png" }],
  },
};
```

---

## Dans `page.tsx` (spécifique à une page)

```typescript
// app/home/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil — Mon Site", // écrase le titre du layout
  description: "Page d'accueil",
};
```

---

## Titre dynamique (avec template)

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Mon Site",
    template: "%s — Mon Site", // %s = titre de la page
  },
};

// app/home/page.tsx
export const metadata: Metadata = {
  title: "Accueil", // → donne "Accueil — Mon Site"
};
```

---

## Récapitulatif

| Besoin | Où le mettre |
|---|---|
| Titre / description globaux | `app/layout.tsx` |
| Titre spécifique à une page | `app/[page]/page.tsx` |
| Favicon | `app/layout.tsx` → `icons` |
| Open Graph / réseaux sociaux | `app/layout.tsx` ou `page.tsx` |
