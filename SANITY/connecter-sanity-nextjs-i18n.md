# Connecter un projet Next.js existant à Sanity — Blog multilingue

> **Contexte** : Tu as déjà un frontend Next.js (App Router) dans un dossier `frontend/` et tu veux y brancher Sanity pour gérer des articles de blog en plusieurs langues.
> **Durée estimée** : 2-3h

---

## Structure du projet

Contrairement à Strapi ou Express où tu avais un vrai serveur backend à héberger, **Sanity est un CMS cloud** — il tourne sur les serveurs de Sanity, pas sur ta machine. Tu t'y connectes via un `Project ID`.

Du coup la structure ressemble à ce que tu connais, mais `sanity/` n'est pas un serveur : c'est juste un dossier de configuration (schémas, config du studio).

```
mon-projet/                  ← racine du projet
├── frontend/                ← ton app Next.js (intact)
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── sanity.js        ← connexion à l'API Sanity (cloud)
│   │   └── queries.js
│   ├── node_modules/        ← dépendances du frontend uniquement
│   └── package.json
└── sanity/                  ← config du studio (pas un serveur !)
    ├── schemas/             ← structure de tes contenus
    ├── sanity.config.js
    ├── node_modules/        ← dépendances du studio uniquement
    └── package.json
```

> 💡 **Analogie** : `sanity/` c'est comme un fichier `strapi.config.js` — il décrit tes contenus, mais le "serveur" c'est sanity.io lui-même.

⚠️ **Erreur fréquente** : ne pas lancer `npm install` depuis la racine du projet. Chaque dossier (`frontend/` et `sanity/`) a son propre `package.json` et son propre `node_modules`. Toujours se placer dans le bon dossier avant d'installer.

---

## Sommaire

1. [Créer le projet Sanity](#1-créer-le-projet-sanity)
2. [Installer les dépendances dans ton projet](#2-installer-les-dépendances-dans-ton-projet)
3. [Configurer le client Sanity](#3-configurer-le-client-sanity)
4. [Créer le schéma Article multilingue](#4-créer-le-schéma-article-multilingue)
5. [Intégrer le Studio dans Next.js](#5-intégrer-le-studio-dans-nextjs)
6. [Configurer le routing i18n dans Next.js](#6-configurer-le-routing-i18n-dans-nextjs)
7. [Créer les routes et pages du blog](#7-créer-les-routes-et-pages-du-blog)
8. [Ajouter du contenu de test](#8-ajouter-du-contenu-de-test)
9. [Checklist avant mise en production](#9-checklist-avant-mise-en-production)

---

## 1. Créer le projet Sanity

### 1.1 Initialiser Sanity

Place-toi à la **racine du projet** (pas dans `frontend/`) :

```bash
cd mon-projet   # là où tu vois le dossier frontend/
npm create sanity@latest
```

Réponds aux questions :

```
✔ Create new project
✔ Project name: mon-blog
✔ Use the default dataset configuration? → Yes
✔ Project output path: ./sanity   ← crée sanity/ à la racine, à côté de frontend/
✔ Select project template: Clean project (no predefined schemas)
✔ Add TypeScript? → No
```

Après l'installation ta racine doit ressembler à :

```
mon-projet/
├── frontend/       ← inchangé
└── sanity/         ← nouvellement créé, avec son propre package.json et node_modules
```

### 1.2 Récupérer tes identifiants

À la fin de l'installation, note ces deux valeurs (aussi visibles sur [sanity.io/manage](https://www.sanity.io/manage)) :

- **Project ID** → ex: `a1b2c3d4`
- **Dataset** → `production`

---

## 2. Installer les dépendances dans ton projet

Place-toi dans **`frontend/`** (pas à la racine, pas dans `sanity/`) :

```bash
cd frontend
npm install next-sanity @sanity/image-url @portabletext/react
```

> ⚠️ **Piège fréquent** : si tu lances `npm install` depuis la racine du projet, les packages atterrissent dans un `node_modules` à la racine et ton app Next.js ne les trouvera pas. Vérifie toujours que tu es bien dans `frontend/` avant d'installer.

| Package | Rôle |
|---|---|
| `next-sanity` | Client Sanity optimisé pour Next.js |
| `@sanity/image-url` | Transforme les images Sanity en URLs |
| `@portabletext/react` | Affiche le texte riche Sanity en React |

---

## 3. Configurer le client Sanity

### 3.1 Fichier de variables d'environnement

Crée (ou complète) ton fichier `.env.local` dans **`frontend/`** :

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=a1b2c3d4
NEXT_PUBLIC_SANITY_DATASET=production
```

> ⚠️ Vérifie que `.env.local` est bien dans ton `.gitignore` !

### 3.2 Créer le client

Crée le fichier `frontend/lib/sanity.js` :

```js
// frontend/lib/sanity.js
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01', // date fixe, ne pas mettre "latest"
  useCdn: true,             // cache CDN pour les perfs en production
})

// Helper pour générer les URLs d'images
const builder = imageUrlBuilder(client)
export function urlFor(source) {
  return builder.image(source)
}
```

---

## 4. Créer le schéma Article multilingue

### 4.1 Stratégie choisie : un document par langue

C'est l'approche **la plus simple pour débutant** : chaque article a un champ `language` (`fr`, `en`, etc.) et un `slug` unique par langue.

```
Article FR  →  { title: "Mon article", language: "fr", slug: "mon-article" }
Article EN  →  { title: "My article",  language: "en", slug: "my-article"  }
```

> Il existe aussi le plugin officiel `@sanity/document-internationalization` pour lier les traductions entre elles — on l'ajoute en option à la fin.

### 4.2 Créer le schéma

Dans le dossier `sanity/schemas/`, crée le fichier `article.js` :

```js
// sanity/schemas/article.js
export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [

    // --- Langue ---
    {
      name: 'language',
      title: 'Langue',
      type: 'string',
      options: {
        list: [
          { title: '🇫🇷 Français', value: 'fr' },
          { title: '🇬🇧 English',  value: 'en' },
          { title: '🇪🇸 Español',  value: 'es' },
        ],
        layout: 'radio', // affichage en boutons radio dans le studio
      },
      validation: (Rule) => Rule.required(),
    },

    // --- Titre ---
    {
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },

    // --- Slug (URL) ---
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    },

    // --- Date de publication ---
    {
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
    },

    // --- Image principale ---
    {
      name: 'mainImage',
      title: 'Image principale',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Texte alternatif (accessibilité)',
          type: 'string',
        },
      ],
    },

    // --- Résumé ---
    {
      name: 'excerpt',
      title: 'Résumé',
      type: 'text',
      rows: 3,
    },

    // --- Corps de l'article ---
    {
      name: 'body',
      title: "Corps de l'article",
      type: 'array',
      of: [
        { type: 'block' },  // texte riche (gras, italique, liens…)
        {
          type: 'image',    // images insérées dans le texte
          options: { hotspot: true },
        },
      ],
    },

  ],

  // Aperçu dans le studio : affiche titre + langue
  preview: {
    select: {
      title: 'title',
      language: 'language',
      media: 'mainImage',
    },
    prepare({ title, language, media }) {
      const flags = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸' }
      return {
        title: `${flags[language] || '🌐'} ${title}`,
        media,
      }
    },
  },
}
```

### 4.3 Enregistrer le schéma dans Sanity

```js
// sanity/schemas/index.js
import article from './article'

export const schemaTypes = [article]
```

Puis dans `sanity/sanity.config.js` :

```js
// sanity/sanity.config.js
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Mon Blog',
  projectId: 'a1b2c3d4',   // ← ton Project ID
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
})
```

---

## 5. Intégrer le Studio dans Next.js

Plutôt que de gérer deux serveurs, on intègre le Studio **directement dans ton app Next.js** à l'URL `/studio`.

### 5.1 Créer la route du studio

```bash
mkdir -p app/studio/\[\[\...tool\]\]
```

```jsx
// frontend/app/studio/[[...tool]]/page.jsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'
// ↑ depuis frontend/app/studio/[[...tool]]/ on remonte 4 niveaux pour atteindre sanity/

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

> Ton studio sera maintenant accessible sur `http://localhost:3000/studio` — plus besoin de `npx sanity dev` !

### 5.2 Exclure /studio du layout principal

Si ton `app/layout.jsx` contient une navbar/footer, tu veux probablement les masquer sur `/studio`. Crée un layout dédié :

```jsx
// app/studio/layout.jsx
export const metadata = { title: 'Studio' }

export default function StudioLayout({ children }) {
  return <>{children}</>
}
```

---

## 6. Configurer le routing i18n dans Next.js

### 6.1 Créer le middleware

Crée `middleware.js` à la racine du projet :

```js
// middleware.js
import { NextResponse } from 'next/server'

const locales = ['fr', 'en', 'es']
const defaultLocale = 'fr'

export function middleware(request) {
  const pathname = request.nextUrl.pathname

  // Ne pas intercepter le studio ni les fichiers statiques
  if (
    pathname.startsWith('/studio') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Vérifier si une locale est déjà dans l'URL
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Rediriger vers la langue par défaut si absente
  if (!hasLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
```

### 6.2 Structure des routes avec locale

```
app/
├── [locale]/
│   ├── layout.jsx          ← layout principal avec locale
│   ├── page.jsx            ← page d'accueil (/)
│   └── blog/
│       ├── page.jsx        ← liste des articles
│       └── [slug]/
│           └── page.jsx    ← article individuel
├── studio/
│   └── [[...tool]]/
│       └── page.jsx
└── middleware.js
```

Crée les dossiers :

```bash
mkdir -p "app/[locale]/blog/[slug]"
```

---

## 7. Créer les routes et pages du blog

### 7.1 Layout avec la locale

```jsx
// app/[locale]/layout.jsx
export default function LocaleLayout({ children, params }) {
  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  )
}

export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'es' }]
}
```

### 7.2 Requêtes GROQ (langage de requête Sanity)

Crée le fichier `lib/queries.js` pour centraliser toutes tes requêtes :

```js
// lib/queries.js

// Liste des articles d'une langue donnée
export const articlesQuery = `
  *[_type == "article" && language == $locale] | order(publishedAt desc) {
    title,
    slug,
    publishedAt,
    excerpt,
    mainImage,
    language
  }
`

// Un article par slug et langue
export const articleBySlugQuery = `
  *[_type == "article" && slug.current == $slug && language == $locale][0] {
    title,
    slug,
    publishedAt,
    mainImage,
    excerpt,
    body,
    language
  }
`

// Tous les slugs (pour generateStaticParams)
export const allArticleSlugsQuery = `
  *[_type == "article"] {
    "slug": slug.current,
    language
  }
`
```

### 7.3 Page liste des articles

```jsx
// app/[locale]/blog/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { client, urlFor } from '@/lib/sanity'
import { articlesQuery } from '@/lib/queries'

// Traductions minimales de l'interface
const ui = {
  fr: { title: 'Blog', readMore: 'Lire la suite →' },
  en: { title: 'Blog', readMore: 'Read more →' },
  es: { title: 'Blog', readMore: 'Leer más →' },
}

export default async function BlogPage({ params }) {
  const { locale } = params
  const articles = await client.fetch(articlesQuery, { locale })
  const t = ui[locale] || ui.fr

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10">{t.title}</h1>

      {articles.length === 0 && (
        <p className="text-gray-500">Aucun article pour le moment.</p>
      )}

      <div className="grid gap-8">
        {articles.map((article) => (
          <article
            key={article.slug.current}
            className="flex gap-6 border rounded-xl p-6 hover:shadow-lg transition"
          >
            {/* Image */}
            {article.mainImage && (
              <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={urlFor(article.mainImage).width(300).url()}
                  alt={article.mainImage.alt || article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Contenu */}
            <div>
              <h2 className="text-xl font-semibold mb-2">
                <Link
                  href={`/${locale}/blog/${article.slug.current}`}
                  className="hover:text-blue-600"
                >
                  {article.title}
                </Link>
              </h2>
              {article.excerpt && (
                <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
              )}
              <Link
                href={`/${locale}/blog/${article.slug.current}`}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                {t.readMore}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
```

### 7.4 Page article individuel

```jsx
// app/[locale]/blog/[slug]/page.jsx
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { client, urlFor } from '@/lib/sanity'
import { articleBySlugQuery, allArticleSlugsQuery } from '@/lib/queries'
import { notFound } from 'next/navigation'

// Génère toutes les URLs statiques au build
export async function generateStaticParams() {
  const articles = await client.fetch(allArticleSlugsQuery)
  return articles.map((a) => ({
    locale: a.language,
    slug: a.slug,
  }))
}

// Composants personnalisés pour le texte riche
const portableTextComponents = {
  types: {
    image: ({ value }) => (
      <div className="relative w-full h-96 my-8 rounded-xl overflow-hidden">
        <Image
          src={urlFor(value).width(900).url()}
          alt={value.alt || ''}
          fill
          className="object-cover"
        />
      </div>
    ),
  },
}

export default async function ArticlePage({ params }) {
  const { locale, slug } = params
  const article = await client.fetch(articleBySlugQuery, { slug, locale })

  if (!article) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">

      {/* En-tête */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        {article.publishedAt && (
          <time className="text-gray-500 text-sm">
            {new Date(article.publishedAt).toLocaleDateString(locale, {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
        )}
      </header>

      {/* Image principale */}
      {article.mainImage && (
        <div className="relative w-full h-80 mb-8 rounded-xl overflow-hidden">
          <Image
            src={urlFor(article.mainImage).width(900).url()}
            alt={article.mainImage.alt || article.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Résumé */}
      {article.excerpt && (
        <p className="text-xl text-gray-600 italic border-l-4 border-blue-500 pl-4 mb-8">
          {article.excerpt}
        </p>
      )}

      {/* Corps */}
      {article.body && (
        <div className="prose prose-lg max-w-none">
          <PortableText
            value={article.body}
            components={portableTextComponents}
          />
        </div>
      )}

    </article>
  )
}
```

### 7.5 Sélecteur de langue (composant optionnel)

Crée `components/LanguageSwitcher.jsx` :

```jsx
// components/LanguageSwitcher.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const languages = [
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'es', label: '🇪🇸 ES' },
]

export default function LanguageSwitcher() {
  const pathname = usePathname()

  // Remplace la locale dans l'URL actuelle
  function getLocalePath(newLocale) {
    const segments = pathname.split('/')
    segments[1] = newLocale // le premier segment est la locale
    return segments.join('/')
  }

  return (
    <div className="flex gap-2">
      {languages.map(({ code, label }) => (
        <Link
          key={code}
          href={getLocalePath(code)}
          className="text-sm px-2 py-1 rounded hover:bg-gray-100 transition"
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
```

Utilise-le dans ta navbar existante :

```jsx
import LanguageSwitcher from '@/components/LanguageSwitcher'

// Dans ta navbar :
<LanguageSwitcher />
```

---

## 8. Ajouter du contenu de test

1. Lance ton projet depuis `frontend/` : 
   ```bash
   cd frontend
   npm run dev
   ```
2. Ouvre [http://localhost:3000/studio](http://localhost:3000/studio)
3. Connecte-toi avec ton compte Sanity
4. Clique sur **"Article"** → **"+ New Article"**
5. Remplis :
   - **Langue** : Français
   - **Titre** : `Mon premier article`
   - **Slug** : clique sur "Generate" → `mon-premier-article`
   - **Corps** : quelques paragraphes de test
6. Clique sur **"Publish"**
7. Visite [http://localhost:3000/fr/blog](http://localhost:3000/fr/blog)

Répète l'opération pour créer la version anglaise du même article.

---

## 9. Checklist avant mise en production

### Variables d'environnement sur Vercel

Sur [vercel.com](https://vercel.com), dans les settings de ton projet → **Environment Variables** :

```
NEXT_PUBLIC_SANITY_PROJECT_ID   →  a1b2c3d4
NEXT_PUBLIC_SANITY_DATASET      →  production
```

### Autoriser ton domaine dans Sanity (CORS)

1. Va sur [sanity.io/manage](https://www.sanity.io/manage)
2. Sélectionne ton projet → onglet **"API"**
3. Section **"CORS Origins"** → **"Add CORS origin"**
4. Ajoute `https://ton-site.vercel.app`
5. Sauvegarde

### Activer le token en lecture (si useCdn: false)

Si tu utilises `useCdn: false` (pour avoir du contenu temps-réel), ajoute un token :

1. Sanity Manage → **"API"** → **"Tokens"** → **"Add API token"**
2. Nom : `nextjs-read`, Permission : **Viewer**
3. Copie le token et ajoute-le dans `.env.local` :

```env
SANITY_API_TOKEN=skxxxxxxxxxxxxxx
```

Puis dans `lib/sanity.js` :

```js
export const client = createClient({
  // ...
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
```

---

## Structure finale du projet

```
mon-projet/                          ← racine (rien à installer ici)
│
├── frontend/                        ← ton app Next.js
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   └── blog/
│   │   │       ├── page.jsx
│   │   │       └── [slug]/
│   │   │           └── page.jsx
│   │   └── studio/
│   │       └── [[...tool]]/
│   │           └── page.jsx
│   ├── components/
│   │   └── LanguageSwitcher.jsx
│   ├── lib/
│   │   ├── sanity.js                ← client + urlFor
│   │   └── queries.js               ← toutes les requêtes GROQ
│   ├── middleware.js                ← routing i18n
│   ├── .env.local                   ← variables d'env (ne pas committer !)
│   ├── node_modules/                ← dépendances frontend
│   └── package.json
│
└── sanity/                          ← config du studio (pas un serveur !)
    ├── schemas/
    │   ├── index.js
    │   └── article.js
    ├── sanity.config.js
    ├── node_modules/                ← dépendances studio
    └── package.json
```

---

## Pour aller plus loin

- 🔗 [Plugin i18n officiel Sanity](https://www.sanity.io/plugins/document-internationalization) — pour lier les traductions entre elles
- 🔗 [next-intl](https://next-intl-docs.vercel.app/) — gestion avancée des traductions côté UI
- 🔗 [Sanity Vision](https://www.sanity.io/docs/sanity-vision) — tester tes requêtes GROQ dans le studio
- 🔗 [Documentation GROQ](https://www.sanity.io/docs/groq) — le langage de requête de Sanity

---

*Guide rédigé pour Next.js 14 (App Router) · Sanity v3 · Juin 2024*
