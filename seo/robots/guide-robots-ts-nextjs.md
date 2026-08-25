# Guide : Le fichier `app/robots.ts` avec Next.js (App Router)

---

## 1. Qu'est-ce que `app/robots.ts` ?

Depuis Next.js 13+ (App Router), il est possible de générer le fichier `robots.txt` **dynamiquement** via un fichier spécial `robots.ts` (ou `.js`), plutôt qu'en écrivant un fichier statique dans `public/`.

Next.js reconnaît ce fichier automatiquement et l'expose à l'URL :
```
https://codercat.fr/robots.txt
```

Aucune configuration supplémentaire n'est nécessaire — Next.js le compile et le sert lui-même au build.

---

## 2. Où enregistrer le fichier

Le fichier doit obligatoirement être placé **à la racine du dossier `app/`** :

```
mon-projet/
├── app/
│   ├── robots.ts     ← ici
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── public/
├── package.json
└── ...
```

⚠️ **Important** : si tu as aussi un fichier `public/robots.txt`, il entrera en conflit avec `app/robots.ts`. Il ne faut garder **qu'une seule des deux méthodes**. Supprime `public/robots.txt` si tu utilises `app/robots.ts`.

Si ton projet utilise l'i18n avec un dossier `[lang]` (comme vu précédemment), `robots.ts` reste **à la racine de `app/`**, pas dans `app/[lang]/`, car le fichier `robots.txt` est unique pour tout le domaine (il ne dépend pas de la langue).

---

## 3. Le code, ligne par ligne

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/login'],
    },
    sitemap: 'https://codercat.fr/sitemap.xml',
  };
}
```

### `import type { MetadataRoute } from 'next';`
Importe le typage TypeScript fourni par Next.js. Il garantit que l'objet retourné respecte exactement le format attendu par le framework (autocomplétion + vérification d'erreurs).

### `export default function robots(): MetadataRoute.Robots`
La fonction doit être exportée par défaut et nommée comme le fichier. Next.js l'exécute au build (ou à la requête si le contenu est dynamique) pour générer le `robots.txt` final.

---

## 4. Signification des options

### `rules`
Définit les règles d'exploration pour les robots. Peut être un objet unique (une seule règle pour tous les robots) ou un **tableau d'objets** si tu veux des règles différentes selon le robot (voir section 6).

| Option | Type | Rôle | Exemple |
|---|---|---|---|
| `userAgent` | `string` \| `string[]` | Cible quel(s) robot(s) la règle concerne | `'*'` (tous), `'Googlebot'`, `'Bingbot'` |
| `allow` | `string` \| `string[]` | Chemins **explicitement autorisés** à l'exploration | `'/'` |
| `disallow` | `string` \| `string[]` | Chemins **interdits** à l'exploration | `['/api/', '/login']` |
| `crawlDelay` | `number` | Délai (en secondes) entre deux requêtes du robot | `10` |

#### `userAgent: '*'`
Le `*` signifie "tous les robots" (Googlebot, Bingbot, etc.). C'est la valeur la plus courante quand tu veux une règle universelle.

#### `allow: '/'`
Autorise l'exploration de **toutes les pages** du site à partir de la racine `/`. C'est le comportement par défaut si rien n'est précisé, mais l'écrire explicitement rend l'intention claire.

#### `disallow: ['/api/', '/_next/', '/login']`
Liste des chemins que les robots ne doivent **pas** explorer :
- `/api/` → routes API internes (pas de contenu pertinent pour le SEO, et souvent sensibles)
- `/_next/` → fichiers internes générés par Next.js (JS, CSS, chunks) — inutile de les indexer
- `/login` → page de connexion, généralement sans intérêt SEO et parfois sensible

⚠️ **Note** : `disallow` empêche l'exploration mais ne garantit pas la désindexation si la page est déjà indexée ailleurs. Pour empêcher totalement l'indexation d'une page, utilise plutôt une balise `<meta name="robots" content="noindex">` ou l'export `metadata.robots` dans la page elle-même.

### `sitemap`
```ts
sitemap: 'https://codercat.fr/sitemap.xml',
```
Indique aux robots l'URL absolue du plan du site (sitemap). Cela les aide à découvrir toutes les pages du site plus efficacement, surtout si le site est nouveau ou peu de liens internes existent. Peut aussi être un tableau si tu as plusieurs sitemaps (ex: un par langue).

```ts
sitemap: [
  'https://codercat.fr/sitemap-fr.xml',
  'https://codercat.fr/sitemap-es.xml',
]
```

### `host` (optionnel, rarement utilisé)
```ts
host: 'https://codercat.fr'
```
Précise le domaine canonique préféré. Peu de robots (hors Yandex) en tiennent compte aujourd'hui — généralement omis.

---

## 5. Résultat généré

Le code ci-dessus produit, une fois le site déployé, ce fichier texte à `https://codercat.fr/robots.txt` :

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /login

Sitemap: https://codercat.fr/sitemap.xml
```

---

## 6. Aller plus loin : plusieurs règles selon le robot

Si tu veux des règles différentes pour des robots spécifiques (ex: bloquer un bot d'IA mais pas Google), `rules` peut être un tableau :

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://codercat.fr/sitemap.xml',
  };
}
```

Ici, tous les robots peuvent explorer le site sauf `/api/` et `/login`, mais `GPTBot` (le robot d'OpenAI) est totalement bloqué.

---

## 7. Vérifier le résultat

Après un `npm run build` puis `npm run start` (ou en déploiement), tu peux vérifier le fichier généré directement dans le navigateur :

```
https://codercat.fr/robots.txt
```

ou en local :

```
http://localhost:3000/robots.txt
```

---

## 8. Résumé

| Élément | Valeur dans ton fichier | Rôle |
|---|---|---|
| Emplacement | `app/robots.ts` | Racine du dossier `app/` |
| `userAgent` | `'*'` | S'applique à tous les robots |
| `allow` | `'/'` | Autorise l'exploration générale |
| `disallow` | `/api/`, `/_next/`, `/login` | Bloque les routes techniques et sensibles |
| `sitemap` | `https://codercat.fr/sitemap.xml` | Aide les robots à découvrir les pages |

---

## 9. Ressources utiles

- Documentation officielle Next.js : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- Documentation robots.txt (standard) : https://developers.google.com/search/docs/crawling-indexing/robots/intro

---

*Guide généré pour l'intégration du fichier `robots.ts` dans un projet Next.js App Router (codercat.fr).*
