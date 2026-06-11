# Manuel complet — Strapi + Next.js

## Stack utilisée

```
Next.js (frontend) → Strapi (backend/admin) → PostgreSQL (base de données)
Cloudinary (images) · Supabase (DB gratuit) · Railway (hébergement Strapi)
```

---

## PARTIE 1 — Installation de Strapi en local

### Prérequis

- Node.js v18 ou v20 (pas v21+)
- npm ou yarn

```bash
node -v   # doit afficher v18.x ou v20.x
```

### Créer le projet Strapi

```bash
npx create-strapi-app@latest backend --quickstart
```

- `--quickstart` utilise SQLite en local (parfait pour débuter)
- Strapi s'ouvre automatiquement sur `http://localhost:1337/admin`
- Crée ton compte admin au premier lancement

---

## PARTIE 2 — Créer les Content Types dans Strapi

Les Content Types sont les types de données que ton client va gérer (sessions, images, etc.)

### Exemple : créer un Content Type "Session"

1. Dans l'admin Strapi → **Content-Type Builder**
2. Cliquer **Create new collection type**
3. Nom : `Session`
4. Ajouter les champs :

| Champ | Type | Notes |
|---|---|---|
| titre | Text | Obligatoire |
| description | Rich Text | |
| duree | Number | En minutes |
| prix | Decimal | |
| image | Media | Image unique |
| actif | Boolean | Afficher/masquer |

5. Cliquer **Save** → Strapi redémarre automatiquement

### Rendre l'API publique

1. **Settings** → **Roles** → **Public**
2. Pour chaque Content Type → cocher `find` et `findOne`
3. **Save**

L'API est maintenant accessible sur :
```
http://localhost:1337/api/sessions
```

---

## PARTIE 3 — Configurer Cloudinary pour les images

### Installer le plugin

```bash
cd backend
npm install @strapi/provider-upload-cloudinary
```

### Créer un compte Cloudinary

1. Aller sur [cloudinary.com](https://cloudinary.com) → créer un compte gratuit
2. Dashboard → copier **Cloud Name**, **API Key**, **API Secret**

### Configurer Strapi

Dans `backend/config/plugins.ts` :

```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
    },
  },
});
```

Dans `backend/.env` :

```env
CLOUDINARY_NAME=ton_cloud_name
CLOUDINARY_KEY=ta_api_key
CLOUDINARY_SECRET=ton_api_secret
```

---

## PARTIE 4 — Connecter Next.js à Strapi

### Créer le fichier de configuration

Dans ton projet Next.js, créer `lib/strapi.ts` :

```typescript
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function fetchStrapi(path: string) {
  const response = await fetch(`${STRAPI_URL}/api/${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 }, // Cache 60 secondes
  });

  if (!response.ok) {
    throw new Error(`Erreur Strapi: ${response.statusText}`);
  }

  return response.json();
}
```

Dans `.env.local` de Next.js :

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Récupérer les sessions dans une page

```typescript
// app/sessions/page.tsx
import { fetchStrapi } from "@/lib/strapi";

export default async function SessionsPage() {
  const data = await fetchStrapi("sessions?populate=image");

  return (
    <div>
      {data.data.map((session: any) => (
        <div key={session.id}>
          <h2>{session.attributes.titre}</h2>
          <p>{session.attributes.description}</p>
          <p>{session.attributes.prix} €</p>
          {session.attributes.image?.data && (
            <img
              src={session.attributes.image.data.attributes.url}
              alt={session.attributes.titre}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### Structure de la réponse Strapi

```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "titre": "Massage relaxant",
        "description": "...",
        "prix": 60,
        "image": {
          "data": {
            "attributes": {
              "url": "https://res.cloudinary.com/..."
            }
          }
        }
      }
    }
  ]
}
```

---

## PARTIE 5 — Hébergement en production

### Base de données — Supabase (PostgreSQL gratuit)

1. Aller sur [supabase.com](https://supabase.com) → créer un projet
2. **Settings** → **Database** → copier la **Connection string**

### Hébergement Strapi — Railway

1. Aller sur [railway.app](https://railway.app) → se connecter avec GitHub
2. **New Project** → **Deploy from GitHub repo** → sélectionner ton repo backend
3. Ajouter les variables d'environnement :

```env
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://... (depuis Supabase)
CLOUDINARY_NAME=...
CLOUDINARY_KEY=...
CLOUDINARY_SECRET=...
APP_KEYS=clé_aléatoire_1,clé_aléatoire_2
API_TOKEN_SALT=clé_aléatoire
ADMIN_JWT_SECRET=clé_aléatoire
JWT_SECRET=clé_aléatoire
```

Pour générer les clés aléatoires :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Configurer Strapi pour PostgreSQL

Dans `backend/config/database.ts` :

```typescript
export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      connectionString: env("DATABASE_URL"),
      ssl: { rejectUnauthorized: false },
    },
  },
});
```

Installer le client PostgreSQL :

```bash
cd backend
npm install pg
```

### Hébergement Next.js — Vercel

1. Aller sur [vercel.com](https://vercel.com) → importer le repo Next.js
2. Ajouter la variable :

```env
NEXT_PUBLIC_STRAPI_URL=https://ton-backend.railway.app
```

3. Deploy → c'est en ligne ! 🚀

---

## PARTIE 6 — Sécuriser l'API avec un Token

Pour les routes qui ne doivent pas être publiques (création, modification) :

### Créer un token dans Strapi

1. **Settings** → **API Tokens** → **Create new API Token**
2. Nom : `nextjs-frontend`
3. Type : `Read-only` (ou `Full access` si besoin)
4. Copier le token généré

### Utiliser le token dans Next.js

```typescript
// lib/strapi.ts
export async function fetchStrapiPrivate(path: string) {
  const response = await fetch(`${STRAPI_URL}/api/${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  });
  return response.json();
}
```

Dans `.env.local` :

```env
STRAPI_API_TOKEN=ton_token_strapi
```

---

## PARTIE 7 — Checklist finale

### En local ✅
- [ ] `npm run develop` dans `/backend` → Strapi sur `localhost:1337`
- [ ] `npm run dev` dans `/frontend` → Next.js sur `localhost:3000`
- [ ] Content Types créés et API publique configurée
- [ ] Cloudinary connecté et test d'upload d'image réussi

### En production ✅
- [ ] Supabase : base de données créée
- [ ] Railway : Strapi déployé avec toutes les variables d'env
- [ ] Vercel : Next.js déployé avec `NEXT_PUBLIC_STRAPI_URL` correct
- [ ] Admin Strapi recréé en production (Settings → Users)
- [ ] Test de l'API en production : `https://ton-backend.railway.app/api/sessions`

---

## Commandes utiles

```bash
# Démarrer Strapi en développement
cd backend && npm run develop

# Démarrer Next.js
cd frontend && npm run dev

# Builder Strapi pour production
cd backend && npm run build && npm run start
```

---

## Ressources

- Documentation Strapi : https://docs.strapi.io
- Cloudinary + Strapi : https://docs.strapi.io/dev-docs/providers
- Next.js + Strapi : https://strapi.io/integrations/nextjs-cms
