# Tutoriel : Créer des templates de pages Next.js avec Sanity CMS

> **Niveau** : Débutant | **Durée estimée** : 3-4h | **Stack** : Next.js 14 (App Router) + Sanity v3

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Initialiser le projet Next.js](#2-initialiser-le-projet-nextjs)
3. [Installer et configurer Sanity](#3-installer-et-configurer-sanity)
4. [Créer vos premiers schémas Sanity](#4-créer-vos-premiers-schémas-sanity)
5. [Créer les templates de pages Next.js](#5-créer-les-templates-de-pages-nextjs)
6. [Connecter Next.js à Sanity](#6-connecter-nextjs-à-sanity)
7. [Afficher les données dans les templates](#7-afficher-les-données-dans-les-templates)
8. [Mise en service (déploiement)](#8-mise-en-service-déploiement)
9. [Récapitulatif de la structure du projet](#9-récapitulatif-de-la-structure-du-projet)

---

## 1. Prérequis

Avant de commencer, assure-toi d'avoir installé :

- **Node.js** v18 ou supérieur → [nodejs.org](https://nodejs.org)
- **npm** ou **pnpm** (inclus avec Node.js)
- Un compte gratuit sur **[sanity.io](https://www.sanity.io)**
- Un éditeur de code (VS Code recommandé)

Vérifie tes versions dans le terminal :

```bash
node -v   # doit afficher v18.x.x ou supérieur
npm -v    # doit afficher 9.x.x ou supérieur
```

---

## 2. Initialiser le projet Next.js

### 2.1 Créer le projet

```bash
npx create-next-app@latest mon-site
```

Réponds aux questions comme suit :

```
✔ Would you like to use TypeScript? → No (pour simplifier)
✔ Would you like to use ESLint? → Yes
✔ Would you like to use Tailwind CSS? → Yes
✔ Would you like to use the `src/` directory? → No
✔ Would you like to use App Router? → Yes  ← important !
✔ Would you like to customize the import alias? → No
```

### 2.2 Lancer le projet

```bash
cd mon-site
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — tu devrais voir la page d'accueil Next.js.

---

## 3. Installer et configurer Sanity

### 3.1 Ajouter Sanity au projet

Dans le dossier de ton projet, exécute :

```bash
npm install next-sanity @sanity/image-url
```

### 3.2 Créer ton studio Sanity

```bash
npm create sanity@latest -- --project mon-site-sanity --dataset production --template clean
```

> **Note** : Sanity va t'ouvrir une page pour te connecter/créer un compte. Suis les étapes, puis reviens dans le terminal.

À la fin de l'installation, note les deux valeurs importantes affichées :
- **Project ID** (ex: `abc123de`)
- **Dataset** : `production`

### 3.3 Créer le fichier de configuration

Crée un fichier `sanity.config.js` à la racine du projet :

```js
// sanity.config.js
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default defineConfig({
  name: 'default',
  title: 'Mon Site',

  projectId: 'REMPLACE_PAR_TON_PROJECT_ID',
  dataset: 'production',

  plugins: [deskTool()],

  schema: {
    types: [],  // on ajoutera les schémas ici
  },
})
```

### 3.4 Créer le fichier de connexion client

Crée un fichier `lib/sanity.js` :

```bash
mkdir lib
```

```js
// lib/sanity.js
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'REMPLACE_PAR_TON_PROJECT_ID',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// Utilitaire pour les images
const builder = imageUrlBuilder(client)
export function urlFor(source) {
  return builder.image(source)
}
```

---

## 4. Créer vos premiers schémas Sanity

Les **schémas** définissent la structure de tes contenus dans Sanity (comme des formulaires pour les rédacteurs).

### 4.1 Structure des dossiers

```
mon-site/
├── schemas/
│   ├── index.js        ← liste tous les schémas
│   ├── page.js         ← schéma "Page générique"
│   ├── article.js      ← schéma "Article de blog"
│   └── hero.js         ← schéma "Bloc Hero"
```

```bash
mkdir schemas
```

### 4.2 Schéma : Page générique

```js
// schemas/page.js
export default {
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre de la page',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'title' },  // généré automatiquement depuis le titre
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description (SEO)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'content',
      title: 'Contenu',
      type: 'array',
      of: [{ type: 'block' }],  // éditeur de texte riche
    },
  ],
}
```

### 4.3 Schéma : Article de blog

```js
// schemas/article.js
export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'title' },
    },
    {
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
    },
    {
      name: 'mainImage',
      title: 'Image principale',
      type: 'image',
      options: { hotspot: true },  // permet de recadrer l'image
    },
    {
      name: 'excerpt',
      title: 'Résumé',
      type: 'text',
      rows: 3,
    },
    {
      name: 'body',
      title: 'Corps de l\'article',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image' },  // permet d'insérer des images dans le texte
      ],
    },
  ],
}
```

### 4.4 Enregistrer les schémas

```js
// schemas/index.js
import page from './page'
import article from './article'

export const schemaTypes = [page, article]
```

Met à jour `sanity.config.js` :

```js
// sanity.config.js
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schemaTypes } from './schemas'  // ← ajouter cette ligne

export default defineConfig({
  // ... (même qu'avant)
  schema: {
    types: schemaTypes,  // ← remplacer le tableau vide
  },
})
```

---

## 5. Créer les templates de pages Next.js

Les **templates** sont des composants React réutilisables qui définissent la mise en page de chaque type de contenu.

### 5.1 Template : Page générique

```bash
mkdir -p app/[slug]
mkdir -p components/templates
```

```jsx
// components/templates/PageTemplate.jsx
import { PortableText } from '@portabletext/react'

export default function PageTemplate({ page }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

      {page.description && (
        <p className="text-xl text-gray-600 mb-8">{page.description}</p>
      )}

      {page.content && (
        <div className="prose prose-lg max-w-none">
          <PortableText value={page.content} />
        </div>
      )}
    </main>
  )
}
```

### 5.2 Template : Article de blog

```jsx
// components/templates/ArticleTemplate.jsx
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'

export default function ArticleTemplate({ article }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">

      {/* En-tête */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        {article.publishedAt && (
          <time className="text-gray-500">
            {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </time>
        )}
      </header>

      {/* Image principale */}
      {article.mainImage && (
        <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
          <Image
            src={urlFor(article.mainImage).width(900).url()}
            alt={article.title}
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

      {/* Corps de l'article */}
      {article.body && (
        <div className="prose prose-lg max-w-none">
          <PortableText value={article.body} />
        </div>
      )}

    </article>
  )
}
```

### 5.3 Installer PortableText

```bash
npm install @portabletext/react
```

---

## 6. Connecter Next.js à Sanity

### 6.1 Créer les routes dynamiques

#### Route pour les pages génériques

```jsx
// app/[slug]/page.jsx
import { client } from '@/lib/sanity'
import PageTemplate from '@/components/templates/PageTemplate'
import { notFound } from 'next/navigation'

// Récupère une page par son slug
async function getPage(slug) {
  const query = `*[_type == "page" && slug.current == $slug][0]{
    title,
    description,
    content
  }`
  return client.fetch(query, { slug })
}

// Génère les URLs statiques au build
export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "page"].slug.current`)
  return slugs.map((slug) => ({ slug }))
}

export default async function PageRoute({ params }) {
  const page = await getPage(params.slug)

  if (!page) notFound()  // affiche une 404 si la page n'existe pas

  return <PageTemplate page={page} />
}
```

#### Route pour les articles

```bash
mkdir -p app/blog/[slug]
```

```jsx
// app/blog/[slug]/page.jsx
import { client } from '@/lib/sanity'
import ArticleTemplate from '@/components/templates/ArticleTemplate'
import { notFound } from 'next/navigation'

async function getArticle(slug) {
  const query = `*[_type == "article" && slug.current == $slug][0]{
    title,
    publishedAt,
    mainImage,
    excerpt,
    body
  }`
  return client.fetch(query, { slug })
}

export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "article"].slug.current`)
  return slugs.map((slug) => ({ slug }))
}

export default async function ArticleRoute({ params }) {
  const article = await getArticle(params.slug)

  if (!article) notFound()

  return <ArticleTemplate article={article} />
}
```

#### Page listant tous les articles

```jsx
// app/blog/page.jsx
import Link from 'next/link'
import { client } from '@/lib/sanity'

async function getArticles() {
  return client.fetch(`*[_type == "article"] | order(publishedAt desc){
    title,
    slug,
    publishedAt,
    excerpt
  }`)
}

export default async function BlogPage() {
  const articles = await getArticles()

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10">Blog</h1>
      <div className="grid gap-8">
        {articles.map((article) => (
          <article key={article.slug.current} className="border rounded-xl p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${article.slug.current}`} className="hover:text-blue-600">
                {article.title}
              </Link>
            </h2>
            {article.excerpt && (
              <p className="text-gray-600">{article.excerpt}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
```

---

## 7. Afficher les données dans les templates

### 7.1 Lancer le Studio Sanity en local

Dans un **deuxième terminal**, lance le studio :

```bash
npx sanity dev
```

Ouvre [http://localhost:3333](http://localhost:3333) — c'est ton interface d'administration.

### 7.2 Ajouter du contenu test

1. Dans le studio, clique sur **"Article"** dans le menu gauche
2. Clique sur **"+ Create"**
3. Remplis les champs : titre, génère le slug en cliquant sur "Generate", ajoute une image et du texte
4. Clique sur **"Publish"** (en bas à droite)

### 7.3 Vérifier l'affichage

Retourne sur [http://localhost:3000/blog](http://localhost:3000/blog) — ton article doit apparaître !

---

## 8. Mise en service (déploiement)

### 8.1 Déployer le Studio Sanity

```bash
npx sanity deploy
```

Choisis un nom de sous-domaine (ex: `mon-site-studio`). Ton studio sera accessible sur `https://mon-site-studio.sanity.studio`.

### 8.2 Configurer les variables d'environnement

Crée un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=REMPLACE_PAR_TON_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET=production
```

Met à jour `lib/sanity.js` pour utiliser ces variables :

```js
// lib/sanity.js
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

> ⚠️ **Important** : N'oublie jamais d'ajouter `.env.local` dans ton `.gitignore` !

### 8.3 Déployer sur Vercel (recommandé)

1. Pousse ton code sur **GitHub** :

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ton-username/mon-site.git
git push -u origin main
```

2. Va sur [vercel.com](https://vercel.com) → "New Project" → importe ton repo GitHub

3. Dans la section **"Environment Variables"**, ajoute :
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` → ton Project ID
   - `NEXT_PUBLIC_SANITY_DATASET` → `production`

4. Clique sur **"Deploy"** 🚀

### 8.4 Autoriser Vercel dans Sanity (CORS)

Pour que ton site en production puisse lire le contenu Sanity :

1. Va sur [sanity.io/manage](https://www.sanity.io/manage)
2. Sélectionne ton projet
3. Onglet **"API"** → section **"CORS Origins"**
4. Clique **"Add CORS origin"**
5. Entre l'URL de ton site Vercel (ex: `https://mon-site.vercel.app`)
6. Laisse **"Allow credentials"** décoché → Sauvegarde

---

## 9. Récapitulatif de la structure du projet

```
mon-site/
├── app/
│   ├── [slug]/
│   │   └── page.jsx          ← Route dynamique pour les pages
│   ├── blog/
│   │   ├── page.jsx          ← Liste des articles
│   │   └── [slug]/
│   │       └── page.jsx      ← Route dynamique pour les articles
│   ├── layout.jsx
│   └── page.jsx              ← Page d'accueil
│
├── components/
│   └── templates/
│       ├── PageTemplate.jsx  ← Template page générique
│       └── ArticleTemplate.jsx ← Template article
│
├── lib/
│   └── sanity.js             ← Client Sanity + helper images
│
├── schemas/
│   ├── index.js              ← Export de tous les schémas
│   ├── page.js               ← Schéma page
│   └── article.js            ← Schéma article
│
├── sanity.config.js          ← Configuration du Studio
├── .env.local                ← Variables d'environnement (ne pas committer !)
└── package.json
```

---

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Lance Next.js en développement |
| `npx sanity dev` | Lance le Studio Sanity en local |
| `npx sanity deploy` | Déploie le Studio en ligne |
| `npm run build` | Build de production Next.js |

---

## Ressources pour aller plus loin

- 📚 [Documentation Sanity](https://www.sanity.io/docs)
- 📚 [Documentation Next.js App Router](https://nextjs.org/docs/app)
- 🔍 [Sanity GROQ (langage de requête)](https://www.sanity.io/docs/groq)
- 🎨 [Sanity + Next.js Starter](https://www.sanity.io/templates/nextjs-sanity-starter)

---

*Tutoriel rédigé pour Next.js 14 (App Router) et Sanity v3 — Juin 2024*
