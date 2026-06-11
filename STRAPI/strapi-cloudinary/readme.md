# Manuel — `@strapi/provider-upload-cloudinary`

> Provider officiel Strapi pour uploader les médias vers **Cloudinary**.  
> Compatible Strapi v4 et v5.

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Installation](#2-installation)
3. [Configuration Cloudinary](#3-configuration-cloudinary)
4. [Configuration Strapi](#4-configuration-strapi)
   - [4.1 Variables d'environnement](#41-variables-denvironnement)
   - [4.2 Fichier `plugins.ts` / `plugins.js`](#42-fichier-pluginsts--pluginsjs)
   - [4.3 Fichier `middlewares.ts` / `middlewares.js`](#43-fichier-middlewarets--middlewarejs)
5. [Options avancées](#5-options-avancées)
   - [5.1 Dossier de destination](#51-dossier-de-destination)
   - [5.2 Qualité et transformations automatiques](#52-qualité-et-transformations-automatiques)
   - [5.3 Signed URLs (URLs signées)](#53-signed-urls-urls-signées)
   - [5.4 Upload par morceaux (Chunked Upload)](#54-upload-par-morceaux-chunked-upload)
6. [Utilisation en développement local](#6-utilisation-en-développement-local)
7. [Utilisation en production](#7-utilisation-en-production)
8. [Vérification du bon fonctionnement](#8-vérification-du-bon-fonctionnement)
9. [Dépannage](#9-dépannage)
10. [Références](#10-références)

---

## 1. Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 18.x |
| npm / yarn / pnpm | — |
| Strapi | v4.x ou v5.x |
| Compte Cloudinary | Gratuit ou payant |

Avant de commencer, récupérez les trois clés suivantes depuis le **Dashboard Cloudinary** (`https://console.cloudinary.com`) :

- **Cloud Name**
- **API Key**
- **API Secret**

---

## 2. Installation

Lancez l'une des commandes suivantes à la racine de votre projet Strapi :

```bash
# npm
npm install @strapi/provider-upload-cloudinary

# yarn
yarn add @strapi/provider-upload-cloudinary

# pnpm
pnpm add @strapi/provider-upload-cloudinary
```

---

## 3. Configuration Cloudinary

Aucune configuration côté Cloudinary n'est obligatoire pour commencer. Cependant, il est recommandé de :

- Créer un **dossier dédié** (ex. `mon-projet/`) pour organiser vos médias.
- Activer le **mode sécurisé** (HTTPS) dans les paramètres de votre compte.
- Si vous utilisez des URLs signées, générer une **clé de signature** dans *Settings > Security*.

---

## 4. Configuration Strapi

### 4.1 Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Cloudinary
CLOUDINARY_NAME=votre_cloud_name
CLOUDINARY_KEY=votre_api_key
CLOUDINARY_SECRET=votre_api_secret
```

> ⚠️ **Ne commitez jamais** votre `.env` dans Git. Ajoutez-le à votre `.gitignore`.

---

### 4.2 Fichier `plugins.ts` / `plugins.js`

Créez ou modifiez le fichier `config/plugins.ts` (ou `.js`) :

```typescript
// config/plugins.ts
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

Version JavaScript :

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

---

### 4.3 Fichier `middlewares.ts` / `middlewares.js`

Pour que Strapi autorise le chargement des ressources Cloudinary (images dans l'admin, etc.), mettez à jour la **Content Security Policy** dans `config/middlewares.ts` :

```typescript
// config/middlewares.ts
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',   // ← obligatoire
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',   // ← obligatoire
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

> Sans cette configuration, les images n'apparaîtront pas dans la **Media Library** de l'administration Strapi.

---

## 5. Options avancées

### 5.1 Dossier de destination

Pour organiser vos fichiers dans un sous-dossier Cloudinary, passez l'option `folder` dans `actionOptions` :

```typescript
actionOptions: {
  upload: {
    folder: 'mon-projet/uploads',
  },
  uploadStream: {
    folder: 'mon-projet/uploads',
  },
  delete: {},
},
```

---

### 5.2 Qualité et transformations automatiques

Vous pouvez appliquer des transformations à chaque upload via `upload_preset` (configuré dans Cloudinary) ou directement dans `actionOptions` :

```typescript
actionOptions: {
  upload: {
    folder: 'mon-projet',
    quality: 'auto',           // compression automatique
    fetch_format: 'auto',      // WebP/AVIF selon le navigateur
  },
  uploadStream: {
    folder: 'mon-projet',
    quality: 'auto',
    fetch_format: 'auto',
  },
  delete: {},
},
```

---

### 5.3 Signed URLs (URLs signées)

Pour restreindre l'accès public aux ressources :

1. Dans Cloudinary : *Settings > Security* → activez **Restricted media types** et notez votre **Signing Secret**.
2. Dans Strapi, ajoutez `sign_url: true` et `type: 'authenticated'` :

```typescript
actionOptions: {
  upload: {
    type: 'authenticated',
    sign_url: true,
  },
  uploadStream: {
    type: 'authenticated',
    sign_url: true,
  },
  delete: {},
},
```

---

### 5.4 Upload par morceaux (Chunked Upload)

Pour les fichiers volumineux (vidéos, etc.), activez l'upload par morceaux :

```typescript
actionOptions: {
  upload: {
    chunk_size: 6_000_000,    // 6 Mo par morceau
    timeout: 120_000,          // timeout en ms
  },
  uploadStream: {
    chunk_size: 6_000_000,
    timeout: 120_000,
  },
  delete: {},
},
```

---

## 6. Utilisation en développement local

En développement, vous pouvez utiliser le même provider Cloudinary ou basculer sur le provider **local** par défaut pour éviter de consommer votre quota :

```typescript
// config/plugins.ts
export default ({ env }) => {
  const isDev = env('NODE_ENV') === 'development';

  return {
    upload: {
      config: isDev
        ? {}   // provider local par défaut
        : {
            provider: 'cloudinary',
            providerOptions: {
              cloud_name: env('CLOUDINARY_NAME'),
              api_key: env('CLOUDINARY_KEY'),
              api_secret: env('CLOUDINARY_SECRET'),
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
          },
    },
  };
};
```

---

## 7. Utilisation en production

### Variables d'environnement sur votre hébergeur

Selon votre plateforme, ajoutez les variables d'environnement dans :

| Plateforme | Où configurer |
|------------|---------------|
| Railway | *Variables* dans votre service |
| Render | *Environment* dans votre Web Service |
| Heroku | `heroku config:set CLOUDINARY_NAME=...` |
| Vercel | *Settings > Environment Variables* |
| VPS | Fichier `.env` ou variables système |

### Redémarrer Strapi

Après avoir modifié la configuration :

```bash
# Développement
npm run develop

# Production (build + start)
npm run build
npm run start
```

---

## 8. Vérification du bon fonctionnement

1. Démarrez Strapi et connectez-vous à l'administration (`http://localhost:1337/admin`).
2. Allez dans **Media Library** → **Add new assets**.
3. Uploadez une image ou un fichier.
4. Vérifiez que l'URL du fichier commence par `https://res.cloudinary.com/votre_cloud_name/...`.
5. Connectez-vous à votre Dashboard Cloudinary et vérifiez que le fichier apparaît dans la **Media Library** Cloudinary.

---

## 9. Dépannage

### Les images ne s'affichent pas dans l'admin

→ Vérifiez la configuration CSP dans `config/middlewares.ts` (section [4.3](#43-fichier-middlewarets--middlewarejs)).  
→ Assurez-vous que `res.cloudinary.com` est bien dans `img-src` et `media-src`.

### Erreur `Invalid API credentials`

→ Vérifiez que `CLOUDINARY_NAME`, `CLOUDINARY_KEY` et `CLOUDINARY_SECRET` sont corrects dans votre `.env`.  
→ Redémarrez Strapi après modification du `.env`.

### Erreur `Request Entity Too Large`

→ Augmentez la limite de taille dans `config/middlewares.ts` :

```typescript
{
  name: 'strapi::body',
  config: {
    formLimit: '256mb',
    jsonLimit: '256mb',
    textLimit: '256mb',
    formidable: {
      maxFileSize: 256 * 1024 * 1024, // 256 Mo
    },
  },
},
```

### Les fichiers ne sont pas supprimés sur Cloudinary

→ Assurez-vous que `actionOptions.delete` est bien défini dans la configuration.  
→ Vérifiez que votre clé API Cloudinary dispose des droits de suppression (*Settings > Access Keys*).

### Erreur de CORS

→ Dans Cloudinary, allez dans *Settings > Security > Allowed fetch domains* et ajoutez l'URL de votre Strapi.

---

## 10. Références

- [Documentation officielle Strapi — Upload providers](https://docs.strapi.io/dev-docs/providers)
- [npm — @strapi/provider-upload-cloudinary](https://www.npmjs.com/package/@strapi/provider-upload-cloudinary)
- [Documentation Cloudinary — Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Dashboard Cloudinary](https://console.cloudinary.com)

---

*Manuel rédigé pour Strapi v4/v5 — Dernière mise à jour : avril 2026*
