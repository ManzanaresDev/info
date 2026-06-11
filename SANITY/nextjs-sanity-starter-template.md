# 🚀 Template Starter — Next.js + Sanity CMS
### Stack clé en main pour sites vitrines & blogs TPE/PME

> **Stack :** Next.js 14 (App Router) · Sanity v3 · TypeScript · Tailwind CSS · Vercel  
> Ce document contient **tout le code** pour démarrer un projet livrable en clé en main.

---

## Table des matières

1. [Architecture & aperçu](#1-architecture--aperçu)
2. [Installation](#2-installation)
3. [Structure du projet](#3-structure-du-projet)
4. [Configuration Sanity](#4-configuration-sanity)
5. [Schémas de contenu](#5-schémas-de-contenu)
6. [Client Sanity & requêtes GROQ](#6-client-sanity--requêtes-groq)
7. [Pages Next.js](#7-pages-nextjs)
8. [Composants réutilisables](#8-composants-réutilisables)
9. [Webhook & régénération automatique](#9-webhook--régénération-automatique)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Déploiement Vercel](#11-déploiement-vercel)
12. [Checklist de livraison client](#12-checklist-de-livraison-client)

---

## 1. Architecture & aperçu

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT édite son contenu                               │
│  https://monsite.sanity.studio                          │
│  (Sanity Studio — hébergé gratuitement par Sanity)      │
└────────────────────┬────────────────────────────────────┘
                     │ Webhook POST à chaque modification
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Vercel reçoit le webhook                               │
│  → Rebuild ISR de la page modifiée                      │
│  → Mise en ligne en ~30 secondes                        │
└────────────────────┬────────────────────────────────────┘
                     │ API GROQ (CDN Sanity)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Next.js 14 — App Router                                │
│  Hébergé sur Vercel (gratuit pour vitrines)             │
│  - Pages statiques (ISR)                                │
│  - Blog dynamique                                       │
│  - SEO automatique                                      │
└─────────────────────────────────────────────────────────┘
```

### Ce que le client peut modifier

- ✅ Textes et images de toutes les pages
- ✅ Articles de blog
- ✅ Informations de contact (adresse, téléphone, email)
- ✅ Navigation (menus)
- ✅ SEO (titre, description, image Open Graph)
- ✅ Galerie photos
- ✅ Témoignages clients
- ✅ Paramètres globaux (logo, couleurs, réseaux sociaux)

---

## 2. Installation

### Prérequis

```bash
node --version  # v18 ou supérieur requis
npm --version   # v9 ou supérieur
```

### Étape 1 — Créer le projet Next.js

```bash
npx create-next-app@latest mon-site \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mon-site
```

### Étape 2 — Installer les dépendances Sanity

```bash
npm install \
  next-sanity \
  @sanity/image-url \
  @sanity/vision \
  @portabletext/react \
  sanity

npm install -D \
  @sanity/types
```

### Étape 3 — Initialiser Sanity

```bash
# Créer un compte sur sanity.io si pas encore fait
# puis lancer :
npm create sanity@latest

# Choisir :
# ✔ Create new project
# ✔ Project name: mon-site
# ✔ Use the default dataset configuration? Yes
# ✔ Project output path: ./sanity (ou studio)
# ✔ Select project template: Clean project with no predefined schemas
```

### Étape 4 — Récupérer les identifiants Sanity

```bash
# Dans le dashboard Sanity : https://sanity.io/manage
# Project ID : xxxxxxxxx  (visible dans les settings du projet)
# Dataset    : production (par défaut)

# Générer un token API (lecture) :
# Manage > API > Tokens > Add API token
# Name: "Next.js site"
# Permissions: Viewer
# → Copier le token généré
```

---

## 3. Structure du projet

```
mon-site/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout global
│   │   ├── page.tsx                # Page d'accueil
│   │   ├── blog/
│   │   │   ├── page.tsx            # Liste des articles
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Article individuel
│   │   ├── [slug]/
│   │   │   └── page.tsx            # Pages dynamiques (À propos, Contact...)
│   │   ├── studio/
│   │   │   └── [[...tool]]/
│   │   │       └── page.tsx        # Sanity Studio intégré
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts        # Webhook de régénération
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── ContactSection.tsx
│   │   └── ui/
│   │       ├── SanityImage.tsx
│   │       ├── PortableText.tsx
│   │       └── SEO.tsx
│   ├── sanity/
│   │   ├── lib/
│   │   │   ├── client.ts           # Client Sanity
│   │   │   ├── image.ts            # Helper images
│   │   │   └── queries.ts          # Toutes les requêtes GROQ
│   │   ├── schemaTypes/
│   │   │   ├── index.ts            # Export de tous les schémas
│   │   │   ├── singletons/
│   │   │   │   ├── settings.ts     # Paramètres globaux
│   │   │   │   └── homepage.ts     # Page d'accueil
│   │   │   └── documents/
│   │   │       ├── page.ts         # Pages génériques
│   │   │       ├── post.ts         # Articles de blog
│   │   │       ├── category.ts     # Catégories blog
│   │   │       └── testimonial.ts  # Témoignages
│   │   └── structure.ts            # Structure de la sidebar Studio
│   └── types/
│       └── sanity.d.ts             # Types TypeScript
├── sanity.config.ts                # Config Sanity Studio
├── .env.local                      # Variables d'environnement
└── next.config.ts                  # Config Next.js
```

---

## 4. Configuration Sanity

### `sanity.config.ts` (racine du projet)

```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  basePath: '/studio', // Studio accessible sur /studio
  projectId,
  dataset,
  title: 'Mon Site — Administration',

  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],

  schema: {
    types: schemaTypes,
  },
})
```

### `src/app/studio/[[...tool]]/page.tsx`

```typescript
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

### `src/sanity/structure.ts` — Sidebar personnalisée

```typescript
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu')
    .items([
      // Singletons (une seule instance)
      S.listItem()
        .title('⚙️ Paramètres du site')
        .id('settings')
        .child(
          S.document()
            .schemaType('settings')
            .documentId('settings')
        ),
      S.listItem()
        .title('🏠 Page d\'accueil')
        .id('homepage')
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
        ),

      S.divider(),

      // Collections
      S.listItem()
        .title('📄 Pages')
        .schemaType('page')
        .child(S.documentTypeList('page').title('Pages')),

      S.listItem()
        .title('✍️ Articles de blog')
        .schemaType('post')
        .child(S.documentTypeList('post').title('Articles')),

      S.listItem()
        .title('🏷️ Catégories')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Catégories')),

      S.listItem()
        .title('💬 Témoignages')
        .schemaType('testimonial')
        .child(S.documentTypeList('testimonial').title('Témoignages')),
    ])
```

---

## 5. Schémas de contenu

### `src/sanity/schemaTypes/index.ts`

```typescript
import settings from './singletons/settings'
import homepage from './singletons/homepage'
import page from './documents/page'
import post from './documents/post'
import category from './documents/category'
import testimonial from './documents/testimonial'

export const schemaTypes = [
  // Singletons
  settings,
  homepage,
  // Documents
  page,
  post,
  category,
  testimonial,
]
```

---

### `src/sanity/schemaTypes/singletons/settings.ts`

```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Paramètres du site',
  type: 'document',
  // Icône dans le studio
  icon: () => '⚙️',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nom du site',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description du site (SEO)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'navigation',
      title: 'Menu de navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Libellé', type: 'string' },
            { name: 'href', title: 'Lien (ex: /blog)', type: 'string' },
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Pied de page',
      type: 'object',
      fields: [
        { name: 'address', title: 'Adresse', type: 'text', rows: 2 },
        { name: 'phone', title: 'Téléphone', type: 'string' },
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'copyright', title: 'Texte copyright', type: 'string' },
      ],
    }),
    defineField({
      name: 'socials',
      title: 'Réseaux sociaux',
      type: 'object',
      fields: [
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'twitter', title: 'X / Twitter URL', type: 'url' },
      ],
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
```

---

### `src/sanity/schemaTypes/singletons/homepage.ts`

```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Page d\'accueil',
  type: 'document',
  icon: () => '🏠',
  fields: [
    // Section Hero
    defineField({
      name: 'hero',
      title: '🎯 Section Hero',
      type: 'object',
      fields: [
        { name: 'headline', title: 'Titre principal', type: 'string', validation: (R) => R.required() },
        { name: 'subheadline', title: 'Sous-titre', type: 'text', rows: 2 },
        { name: 'ctaLabel', title: 'Bouton — texte', type: 'string' },
        { name: 'ctaLink', title: 'Bouton — lien', type: 'string' },
        { name: 'image', title: 'Image de fond / principale', type: 'image', options: { hotspot: true } },
      ],
    }),

    // Section À propos
    defineField({
      name: 'about',
      title: '👤 Section À propos',
      type: 'object',
      fields: [
        { name: 'title', title: 'Titre', type: 'string' },
        { name: 'body', title: 'Contenu', type: 'array', of: [{ type: 'block' }] },
        { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
      ],
    }),

    // Section Services
    defineField({
      name: 'services',
      title: '🛠️ Section Services',
      type: 'object',
      fields: [
        { name: 'title', title: 'Titre de la section', type: 'string' },
        {
          name: 'items',
          title: 'Services',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              { name: 'title', title: 'Nom du service', type: 'string' },
              { name: 'description', title: 'Description', type: 'text', rows: 3 },
              { name: 'icon', title: 'Emoji / icône', type: 'string' },
            ],
            preview: { select: { title: 'title', subtitle: 'description' } },
          }],
        },
      ],
    }),

    // SEO
    defineField({
      name: 'seo',
      title: '🔍 SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Titre (balise title)', type: 'string' },
        { name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3 },
        { name: 'ogImage', title: 'Image Open Graph', type: 'image' },
      ],
    }),
  ],
})
```

---

### `src/sanity/schemaTypes/documents/page.ts`

```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Pages',
  type: 'document',
  icon: () => '📄',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la page',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL de la page',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Description de l\'image (accessibilité)', type: 'string' },
            { name: 'caption', title: 'Légende', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Titre SEO', type: 'string' },
        { name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3 },
        { name: 'ogImage', title: 'Image Open Graph', type: 'image' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
```

---

### `src/sanity/schemaTypes/documents/post.ts`

```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Articles de blog',
  type: 'document',
  icon: () => '✍️',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de l\'article',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Image principale',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Description (accessibilité)', type: 'string' },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Résumé',
      description: 'Affiché dans la liste des articles',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Contenu de l\'article',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Description', type: 'string' },
            { name: 'caption', title: 'Légende', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Titre SEO', type: 'string' },
        { name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3 },
        { name: 'ogImage', title: 'Image Open Graph', type: 'image' },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Date de publication (récent en premier)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
      media: 'mainImage',
    },
    prepare({ title, date, media }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString('fr-FR') : 'Sans date',
        media,
      }
    },
  },
})
```

---

### `src/sanity/schemaTypes/documents/category.ts`

```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Catégories',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({ name: 'title', title: 'Nom', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
  ],
})
```

---

### `src/sanity/schemaTypes/documents/testimonial.ts`

```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Témoignages',
  type: 'document',
  icon: () => '💬',
  fields: [
    defineField({ name: 'author', title: 'Nom du client', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'company', title: 'Entreprise', type: 'string' }),
    defineField({ name: 'avatar', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'rating',
      title: 'Note (1-5)',
      type: 'number',
      options: { list: [1, 2, 3, 4, 5] },
      initialValue: 5,
    }),
    defineField({ name: 'quote', title: 'Témoignage', type: 'text', rows: 4, validation: (R) => R.required() }),
    defineField({ name: 'featured', title: 'Mettre en avant', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'author', subtitle: 'company', media: 'avatar' },
  },
})
```

---

## 6. Client Sanity & requêtes GROQ

### `src/sanity/lib/client.ts`

```typescript
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production', // CDN en prod, API direct en dev
  token: process.env.SANITY_API_READ_TOKEN,      // Token pour les brouillons
})
```

### `src/sanity/lib/image.ts`

```typescript
import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

### `src/sanity/lib/queries.ts`

```typescript
import { groq } from 'next-sanity'

// ─── Paramètres globaux ───────────────────────────────────────
export const SETTINGS_QUERY = groq`
  *[_type == "settings"][0] {
    siteName,
    logo,
    description,
    navigation[] { label, href },
    footer { address, phone, email, copyright },
    socials { facebook, instagram, linkedin, twitter }
  }
`

// ─── Page d'accueil ───────────────────────────────────────────
export const HOMEPAGE_QUERY = groq`
  *[_type == "homepage"][0] {
    hero {
      headline,
      subheadline,
      ctaLabel,
      ctaLink,
      image { asset->, alt }
    },
    about {
      title,
      body,
      image { asset->, alt }
    },
    services {
      title,
      items[] { title, description, icon }
    },
    seo { metaTitle, metaDescription, ogImage }
  }
`

// ─── Pages génériques ─────────────────────────────────────────
export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    slug,
    content,
    seo { metaTitle, metaDescription, ogImage }
  }
`

export const PAGE_SLUGS_QUERY = groq`
  *[_type == "page" && defined(slug.current)] {
    "slug": slug.current
  }
`

// ─── Blog ──────────────────────────────────────────────────────
export const POSTS_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage { asset->, alt },
    category->{ title, slug }
  }
`

export const POST_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    title,
    slug,
    publishedAt,
    mainImage { asset->, alt },
    category->{ title, slug },
    body,
    seo { metaTitle, metaDescription, ogImage }
  }
`

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`

// ─── Témoignages ──────────────────────────────────────────────
export const TESTIMONIALS_QUERY = groq`
  *[_type == "testimonial" && featured == true] | order(_createdAt desc) {
    _id,
    author,
    company,
    avatar { asset-> },
    rating,
    quote
  }
`
```

---

## 7. Pages Next.js

### `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { client } from '@/sanity/lib/client'
import { SETTINGS_QUERY } from '@/sanity/lib/queries'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await client.fetch(SETTINGS_QUERY)
  return {
    title: {
      default: settings?.siteName ?? 'Mon Site',
      template: `%s | ${settings?.siteName ?? 'Mon Site'}`,
    },
    description: settings?.description ?? '',
    openGraph: {
      siteName: settings?.siteName ?? 'Mon Site',
      locale: 'fr_FR',
      type: 'website',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await client.fetch(SETTINGS_QUERY)

  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
```

---

### `src/app/page.tsx` — Page d'accueil

```typescript
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { HOMEPAGE_QUERY, TESTIMONIALS_QUERY } from '@/sanity/lib/queries'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import Testimonials from '@/components/sections/Testimonials'

// ISR — regeneration toutes les 60 secondes (ou via webhook)
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const data = await client.fetch(HOMEPAGE_QUERY)
  return {
    title: data?.seo?.metaTitle ?? 'Accueil',
    description: data?.seo?.metaDescription ?? '',
  }
}

export default async function HomePage() {
  const [homepage, testimonials] = await Promise.all([
    client.fetch(HOMEPAGE_QUERY),
    client.fetch(TESTIMONIALS_QUERY),
  ])

  return (
    <>
      {homepage?.hero && <Hero data={homepage.hero} />}
      {homepage?.about && <About data={homepage.about} />}
      {homepage?.services && <Services data={homepage.services} />}
      {testimonials?.length > 0 && <Testimonials items={testimonials} />}
    </>
  )
}
```

---

### `src/app/[slug]/page.tsx` — Pages dynamiques

```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from '@/sanity/lib/queries'
import { PortableTextContent } from '@/components/ui/PortableText'

export const revalidate = 60

// Générer toutes les pages statiquement au build
export async function generateStaticParams() {
  const pages = await client.fetch(PAGE_SLUGS_QUERY)
  return pages.map((page: { slug: string }) => ({ slug: page.slug }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const page = await client.fetch(PAGE_QUERY, { slug: params.slug })
  if (!page) return {}
  return {
    title: page.seo?.metaTitle ?? page.title,
    description: page.seo?.metaDescription ?? '',
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await client.fetch(PAGE_QUERY, { slug: params.slug })

  if (!page) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      {page.content && <PortableTextContent value={page.content} />}
    </article>
  )
}
```

---

### `src/app/blog/page.tsx` — Liste des articles

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { POSTS_QUERY } from '@/sanity/lib/queries'
import { SanityImage } from '@/components/ui/SanityImage'

export const revalidate = 60
export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const posts = await client.fetch(POSTS_QUERY)

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <article key={post._id} className="group">
            <Link href={`/blog/${post.slug.current}`}>
              {post.mainImage && (
                <div className="overflow-hidden rounded-xl mb-4 aspect-video">
                  <SanityImage
                    image={post.mainImage}
                    alt={post.mainImage.alt ?? post.title}
                    width={600}
                    height={340}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <time className="text-sm text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </time>
              <h2 className="text-xl font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>
              )}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
```

---

### `src/app/blog/[slug]/page.tsx` — Article individuel

```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { POST_QUERY, POST_SLUGS_QUERY } from '@/sanity/lib/queries'
import { SanityImage } from '@/components/ui/SanityImage'
import { PortableTextContent } from '@/components/ui/PortableText'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await client.fetch(POST_SLUGS_QUERY)
  return posts.map((post: { slug: string }) => ({ slug: post.slug }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await client.fetch(POST_QUERY, { slug: params.slug })
  if (!post) return {}
  return {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt ?? '',
    openGraph: post.mainImage ? {
      images: [{ url: post.mainImage.asset.url }],
    } : undefined,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch(POST_QUERY, { slug: params.slug })
  if (!post) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      {post.mainImage && (
        <SanityImage
          image={post.mainImage}
          alt={post.mainImage.alt ?? post.title}
          width={900}
          height={500}
          className="w-full rounded-2xl mb-8 object-cover aspect-video"
        />
      )}
      <header className="mb-8">
        {post.category && (
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">
            {post.category.title}
          </span>
        )}
        <h1 className="text-4xl font-bold mt-2">{post.title}</h1>
        <time className="text-gray-500 mt-2 block">
          {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </time>
      </header>
      <div className="prose prose-lg max-w-none">
        <PortableTextContent value={post.body} />
      </div>
    </article>
  )
}
```

---

## 8. Composants réutilisables

### `src/components/ui/SanityImage.tsx`

```typescript
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

interface SanityImageProps {
  image: any
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function SanityImage({ image, alt, width, height, className, priority }: SanityImageProps) {
  if (!image?.asset) return null

  const url = urlFor(image).width(width).height(height).auto('format').url()

  return (
    <Image
      src={url}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
```

### `src/components/ui/PortableText.tsx`

```typescript
import { PortableText } from '@portabletext/react'
import { SanityImage } from './SanityImage'

const components = {
  types: {
    image: ({ value }: any) => (
      <figure className="my-8">
        <SanityImage
          image={value}
          alt={value.alt ?? ''}
          width={900}
          height={500}
          className="w-full rounded-xl"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
  block: {
    h2: ({ children }: any) => <h2 className="text-3xl font-bold mt-10 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl font-semibold mt-8 mb-3">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 italic my-6 text-gray-700">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-blue-600 underline hover:text-blue-800"
      >
        {children}
      </a>
    ),
  },
}

export function PortableTextContent({ value }: { value: any }) {
  return <PortableText value={value} components={components} />
}
```

### `src/components/layout/Header.tsx`

```typescript
import Link from 'next/link'
import { SanityImage } from '../ui/SanityImage'

export default function Header({ settings }: { settings: any }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {settings?.logo ? (
            <SanityImage image={settings.logo} alt={settings.siteName} width={120} height={40} />
          ) : (
            <span className="text-xl font-bold">{settings?.siteName}</span>
          )}
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {settings?.navigation?.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
```

### `src/components/layout/Footer.tsx`

```typescript
export default function Footer({ settings }: { settings: any }) {
  const { footer, socials, siteName } = settings ?? {}
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">{siteName}</h3>
          {footer?.address && <p className="text-sm whitespace-pre-line">{footer.address}</p>}
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          {footer?.phone && <p className="text-sm">{footer.phone}</p>}
          {footer?.email && <p className="text-sm">{footer.email}</p>}
        </div>
        {socials && (
          <div>
            <h3 className="text-white font-semibold mb-4">Réseaux sociaux</h3>
            <div className="flex gap-4">
              {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>}
              {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>}
              {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-gray-800 px-4 py-4 text-center text-sm text-gray-500">
        {footer?.copyright ?? `© ${year} ${siteName}. Tous droits réservés.`}
      </div>
    </footer>
  )
}
```

---

## 9. Webhook & régénération automatique

> Quand le client clique **Publier** dans Sanity, le site se met à jour automatiquement en ~30 secondes.

### `src/app/api/revalidate/route.ts`

```typescript
import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

// Clé secrète à définir dans .env.local et dans Sanity
const SECRET = process.env.SANITY_REVALIDATE_SECRET

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = await request.json()
  const { _type } = body

  // Régénérer les pages selon le type de document modifié
  switch (_type) {
    case 'homepage':
      revalidatePath('/')
      break
    case 'post':
      revalidatePath('/blog')
      revalidatePath('/blog/[slug]', 'page')
      break
    case 'page':
      revalidatePath('/[slug]', 'page')
      break
    case 'settings':
      revalidatePath('/', 'layout') // Régénérer tout le layout
      break
    case 'testimonial':
      revalidatePath('/')
      break
    default:
      revalidatePath('/', 'layout')
  }

  return NextResponse.json({ revalidated: true, type: _type })
}
```

### Configuration du webhook dans Sanity

```
1. Aller sur : https://sanity.io/manage
2. Sélectionner votre projet
3. API → Webhooks → Create webhook

Paramètres :
  Name    : Vercel Revalidation
  URL     : https://votre-site.vercel.app/api/revalidate?secret=VOTRE_SECRET
  Trigger : On create, On update, On delete
  Filter  : (laisser vide pour tout les types)
  HTTP    : POST
```

---

## 10. Variables d'environnement

### `.env.local`

```bash
# ─── Sanity ───────────────────────────────────────────────────
# Trouvez ces valeurs sur : https://sanity.io/manage
NEXT_PUBLIC_SANITY_PROJECT_ID="xxxxxxxxx"
NEXT_PUBLIC_SANITY_DATASET="production"

# Token API Sanity (lecture seule)
# Manage > API > Tokens > Add API token (Viewer)
SANITY_API_READ_TOKEN="skxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ─── Webhook ──────────────────────────────────────────────────
# Générer avec : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SANITY_REVALIDATE_SECRET="votre_secret_genere_aleatoirement"
```

### `.env.example` (à committer dans git)

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=""
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_READ_TOKEN=""
SANITY_REVALIDATE_SECRET=""
```

### `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',  // Autoriser les images Sanity
      },
    ],
  },
}

export default nextConfig
```

---

## 11. Déploiement Vercel

### Étape 1 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "init: next.js + sanity starter"
git remote add origin https://github.com/votre-user/mon-site.git
git push -u origin main
```

### Étape 2 — Déployer sur Vercel

```
1. Aller sur vercel.com → New Project
2. Importer le repo GitHub
3. Framework Preset : Next.js (détecté automatiquement)
4. Environment Variables — ajouter :
   NEXT_PUBLIC_SANITY_PROJECT_ID  → votre project ID
   NEXT_PUBLIC_SANITY_DATASET     → production
   SANITY_API_READ_TOKEN          → votre token
   SANITY_REVALIDATE_SECRET       → votre secret
5. Cliquer Deploy
```

### Étape 3 — Configurer le domaine client

```
Vercel → Project → Settings → Domains
→ Add Domain : monsite-client.fr
→ Suivre les instructions DNS (ajouter un A record ou CNAME)
```

### Étape 4 — Donner accès Sanity au client

```
https://sanity.io/manage
→ Votre projet
→ Members → Invite
→ Email du client
→ Role : Editor (peut modifier, pas supprimer le projet)

Le client accède à son studio sur :
https://votre-site.vercel.app/studio
(ou configurer un sous-domaine dédié : admin.monsite-client.fr)
```

---

## 12. Checklist de livraison client

### ✅ Avant la livraison

- [ ] WordPress désinstallé / non utilisé 😄
- [ ] Toutes les pages créées dans Sanity
- [ ] Contenu initial rempli (textes, images)
- [ ] SEO configuré (titre, description, OG image) pour chaque page
- [ ] Favicon et logo uploadés
- [ ] Navigation configurée dans les paramètres
- [ ] Footer configuré (adresse, téléphone, email)
- [ ] Blog fonctionnel (au moins 1 article test)
- [ ] Webhook configuré et testé (modifier un texte → voir la mise à jour)
- [ ] Domaine configuré et SSL actif
- [ ] Test mobile/tablette effectué
- [ ] Google Analytics / Plausible configuré si demandé

### 📧 Email de livraison au client

```
Objet : Votre site est en ligne — Guide d'utilisation

Bonjour [Prénom],

Votre site est maintenant en ligne : https://votre-site.fr 🎉

─── Pour modifier votre contenu ─────────────────────────
Accédez à votre espace d'administration :
👉 https://votre-site.fr/studio

Identifiant : votre-email@exemple.fr
(Vous recevrez une invitation par email de Sanity)

─── Comment ça marche ───────────────────────────────────
1. Connectez-vous au studio
2. Cliquez sur la section à modifier (Pages, Blog, Paramètres...)
3. Faites vos modifications
4. Cliquez sur "Publish" (Publier)
5. Votre site est mis à jour en ~30 secondes ✅

─── Ce que vous pouvez modifier ────────────────────────
✏️  Tous les textes et images
✏️  Les articles de blog
✏️  Vos informations de contact
✏️  Le menu de navigation
✏️  Les témoignages clients
✏️  Le SEO (titre, description Google)

En cas de question, répondez à cet email.

Bonne continuation !
```

### 💰 Modèle de tarification suggéré

| Prestation | Prix indicatif |
|-----------|---------------|
| Site vitrine (5 pages + blog) | 1 500 – 3 000 € |
| Mise en place + configuration | Inclus |
| Formation client (1h visio) | Inclus ou +150 € |
| Maintenance mensuelle (updates + support) | 50 – 150 €/mois |
| Hébergement Vercel (Pro si trafic élevé) | 20 $/mois (refacturable) |
| Hébergement Sanity (si > 2 éditeurs) | 15 $/mois (refacturable) |

---

## Ressources

| Ressource | Lien |
|-----------|------|
| Documentation Next.js | https://nextjs.org/docs |
| Documentation Sanity | https://www.sanity.io/docs |
| Référence GROQ | https://www.sanity.io/docs/groq |
| Sanity Studio | https://www.sanity.io/studio |
| Déploiement Vercel | https://vercel.com/docs |
| Composants Portable Text | https://portabletext.github.io/react |
| Templates Sanity officiels | https://www.sanity.io/templates |

---

*Template généré en Mai 2026 — Stack : Next.js 14 · Sanity v3 · TypeScript · Tailwind CSS*
