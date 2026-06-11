# 📘 Manuel complet — Récupérer des données depuis Strapi v5

---

## Table des matières

1. [Concepts de base](#1-concepts-de-base)
2. [Récupérer tous les éléments](#2-récupérer-tous-les-éléments)
3. [Récupérer un seul élément](#3-récupérer-un-seul-élément)
4. [Pagination](#4-pagination)
5. [Filtres](#5-filtres)
6. [Sélectionner des champs spécifiques](#6-sélectionner-des-champs-spécifiques)
7. [Peupler les relations](#7-peupler-les-relations)
8. [Trier les résultats](#8-trier-les-résultats)
9. [Combiner les paramètres](#9-combiner-les-paramètres)
10. [Exemple avec fetch (JavaScript)](#10-exemple-avec-fetch-javascript)
11. [Exemple avec axios](#11-exemple-avec-axios)
12. [Authentification](#12-authentification)
13. [Référence rapide](#13-référence-rapide)

---

## 1. Concepts de base

### Structure d'une réponse Strapi v5

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "vokszg072pe84s1qz1ohevz2",
      "titulo": "Mon article",
      "createdAt": "2026-05-07T19:03:05.875Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### ⚠️ Différence importante Strapi v4 → v5

| | Strapi v4 | Strapi v5 |
|---|---|---|
| Identifiant unique | `id` (numérique) | `documentId` (string) |
| Accès individuel | `/api/blogs/2` | `/api/blogs/vokszg072pe84...` |
| Structure data | `{ data: { id, attributes: {} } }` | `{ data: { id, documentId, ...champs } }` |

---

## 2. Récupérer tous les éléments

```
GET /api/{collection}
```

**Exemple :**
```
GET /api/blogs
```

**Réponse :**
```json
{
  "data": [ {...}, {...}, {...} ],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "total": 3 } }
}
```

---

## 3. Récupérer un seul élément

### Par `documentId` (Strapi v5)

```
GET /api/{collection}/{documentId}
```

**Exemple :**
```
GET /api/blogs/vokszg072pe84s1qz1ohevz2
```

**Réponse :**
```json
{
  "data": {
    "id": 2,
    "documentId": "vokszg072pe84s1qz1ohevz2",
    "titulo": "Mon article",
    "resumen": "..."
  },
  "meta": {}
}
```

> ❌ Ne jamais utiliser `/api/blogs/2` en Strapi v5 → retourne `404 Not Found`

---

## 4. Pagination

### Par page

```
GET /api/blogs?pagination[page]=1&pagination[pageSize]=10
```

| Paramètre | Description | Défaut |
|---|---|---|
| `pagination[page]` | Numéro de la page | `1` |
| `pagination[pageSize]` | Nombre d'éléments par page | `25` |

**Exemples :**
```
# Page 1, 5 articles
GET /api/blogs?pagination[page]=1&pagination[pageSize]=5

# Page 2, 5 articles
GET /api/blogs?pagination[page]=2&pagination[pageSize]=5

# Un seul article à la fois
GET /api/blogs?pagination[page]=1&pagination[pageSize]=1
```

### Par offset (décalage)

```
GET /api/blogs?pagination[start]=0&pagination[limit]=10
```

| Paramètre | Description |
|---|---|
| `pagination[start]` | Index de départ (commence à 0) |
| `pagination[limit]` | Nombre d'éléments à retourner |

**Exemples :**
```
# Les 10 premiers
GET /api/blogs?pagination[start]=0&pagination[limit]=10

# Les 10 suivants
GET /api/blogs?pagination[start]=10&pagination[limit]=10
```

---

## 5. Filtres

### Syntaxe générale

```
GET /api/blogs?filters[champ][$operateur]=valeur
```

### Opérateurs disponibles

| Opérateur | Signification | Exemple |
|---|---|---|
| `$eq` | Égal à | `filters[titre][$eq]=Bonjour` |
| `$ne` | Différent de | `filters[statut][$ne]=draft` |
| `$lt` | Inférieur à | `filters[prix][$lt]=100` |
| `$lte` | Inférieur ou égal | `filters[prix][$lte]=100` |
| `$gt` | Supérieur à | `filters[prix][$gt]=10` |
| `$gte` | Supérieur ou égal | `filters[prix][$gte]=10` |
| `$contains` | Contient (insensible à la casse) | `filters[titre][$contains]=strapi` |
| `$notContains` | Ne contient pas | `filters[titre][$notContains]=draft` |
| `$startsWith` | Commence par | `filters[titre][$startsWith]=Comment` |
| `$endsWith` | Se termine par | `filters[titre][$endsWith]=guide` |
| `$in` | Dans une liste | `filters[id][$in][0]=1&filters[id][$in][1]=2` |
| `$notIn` | Pas dans la liste | `filters[id][$notIn][0]=3` |
| `$null` | Est null | `filters[image][$null]=true` |
| `$notNull` | N'est pas null | `filters[image][$notNull]=true` |

### Exemples

```
# Filtrer par titre exact
GET /api/blogs?filters[titulo][$eq]=Pasos para aprender a tocar la guitarra

# Filtrer les articles publiés après une date
GET /api/blogs?filters[publishedAt][$gte]=2026-01-01

# Filtrer par plusieurs IDs
GET /api/blogs?filters[documentId][$in][0]=abc123&filters[documentId][$in][1]=def456

# Combiner plusieurs filtres (ET logique)
GET /api/blogs?filters[titulo][$contains]=guitar&filters[publishedAt][$notNull]=true
```

### Filtres logiques : `$and` / `$or`

```
# OU logique
GET /api/blogs?filters[$or][0][titulo][$contains]=guitar&filters[$or][1][titulo][$contains]=piano

# ET logique (explicite)
GET /api/blogs?filters[$and][0][titulo][$contains]=cours&filters[$and][1][publishedAt][$notNull]=true
```

---

## 6. Sélectionner des champs spécifiques

Par défaut, Strapi retourne tous les champs. Pour alléger les réponses :

```
GET /api/blogs?fields[0]=titulo&fields[1]=resumen
```

**Exemple :**
```
GET /api/blogs?fields[0]=titulo&fields[1]=resumen&fields[2]=publishedAt
```

**Réponse allégée :**
```json
{
  "data": [
    {
      "id": 2,
      "documentId": "vokszg072pe84s1qz1ohevz2",
      "titulo": "Mon article",
      "resumen": "Résumé court...",
      "publishedAt": "2026-05-07T19:03:05.917Z"
    }
  ]
}
```

> 💡 `id` et `documentId` sont toujours retournés, même si non spécifiés.

---

## 7. Peupler les relations

Par défaut, les relations (images, catégories, auteurs...) ne sont **pas incluses**.

### Peupler tout (simple)

```
GET /api/blogs?populate=*
```

> ⚠️ Déconseillé en production — retourne trop de données.

### Peupler une relation spécifique

```
GET /api/blogs?populate[0]=categorie
GET /api/blogs?populate[0]=auteur&populate[1]=image
```

### Peupler avec sélection de champs dans la relation

```
GET /api/blogs?populate[auteur][fields][0]=nom&populate[auteur][fields][1]=email
```

### Peupler des relations imbriquées

```
GET /api/blogs?populate[auteur][populate][avatar][fields][0]=url
```

### Exemple complet

```
GET /api/blogs?fields[0]=titulo&fields[1]=resumen&populate[auteur][fields][0]=nom&populate[image][fields][0]=url
```

---

## 8. Trier les résultats

```
GET /api/blogs?sort[0]=champ:asc
GET /api/blogs?sort[0]=champ:desc
```

| Valeur | Description |
|---|---|
| `asc` | Ordre croissant (A→Z, ancien→récent) |
| `desc` | Ordre décroissant (Z→A, récent→ancien) |

**Exemples :**
```
# Du plus récent au plus ancien
GET /api/blogs?sort[0]=publishedAt:desc

# Alphabétique par titre
GET /api/blogs?sort[0]=titulo:asc

# Trier par plusieurs champs
GET /api/blogs?sort[0]=publishedAt:desc&sort[1]=titulo:asc
```

---

## 9. Combiner les paramètres

Tous les paramètres peuvent être combinés avec `&`.

```
GET /api/blogs
  ?fields[0]=titulo
  &fields[1]=resumen
  &filters[publishedAt][$notNull]=true
  &sort[0]=publishedAt:desc
  &pagination[page]=1
  &pagination[pageSize]=5
  &populate[0]=image
```

En une seule ligne :
```
GET /api/blogs?fields[0]=titulo&fields[1]=resumen&filters[publishedAt][$notNull]=true&sort[0]=publishedAt:desc&pagination[page]=1&pagination[pageSize]=5&populate[0]=image
```

---

## 10. Exemple avec fetch (JavaScript)

### Récupérer tous les blogs

```javascript
const fetchBlogs = async () => {
  const response = await fetch('http://localhost:1337/api/blogs');
  const { data, meta } = await response.json();

  console.log(data);         // tableau des blogs
  console.log(meta.pagination); // infos de pagination
};
```

### Récupérer un blog par documentId

```javascript
const fetchBlog = async (documentId) => {
  const response = await fetch(`http://localhost:1337/api/blogs/${documentId}`);
  const { data } = await response.json();

  console.log(data); // un seul blog
};

fetchBlog('vokszg072pe84s1qz1ohevz2');
```

### Récupérer avec paramètres (qs recommandé)

```javascript
import qs from 'qs';

const fetchBlogs = async (page = 1) => {
  const query = qs.stringify({
    fields: ['titulo', 'resumen', 'publishedAt'],
    sort: ['publishedAt:desc'],
    pagination: { page, pageSize: 5 },
    populate: ['image'],
  }, { encodeValuesOnly: true });

  const response = await fetch(`http://localhost:1337/api/blogs?${query}`);
  const { data, meta } = await response.json();

  return { data, pagination: meta.pagination };
};
```

> 💡 Installe `qs` : `npm install qs`

### Récupérer sans bibliothèque (URL manuelle)

```javascript
const fetchBlogsManual = async (page = 1, pageSize = 5) => {
  const url = `http://localhost:1337/api/blogs`
    + `?fields[0]=titulo&fields[1]=resumen`
    + `&sort[0]=publishedAt:desc`
    + `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

  const response = await fetch(url);
  const { data, meta } = await response.json();

  return { data, pagination: meta.pagination };
};
```

---

## 11. Exemple avec axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1337/api',
});

// Récupérer tous les blogs
const getBlogs = async (page = 1) => {
  const { data } = await api.get('/blogs', {
    params: {
      'fields[0]': 'titulo',
      'fields[1]': 'resumen',
      'sort[0]': 'publishedAt:desc',
      'pagination[page]': page,
      'pagination[pageSize]': 5,
    },
  });
  return data;
};

// Récupérer un blog
const getBlog = async (documentId) => {
  const { data } = await api.get(`/blogs/${documentId}`);
  return data;
};
```

---

## 12. Authentification

Pour accéder aux routes protégées, il faut un **JWT token**.

### Se connecter et obtenir le token

```javascript
const login = async () => {
  const response = await fetch('http://localhost:1337/api/auth/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'user@email.com',
      password: 'monMotDePasse',
    }),
  });

  const { jwt, user } = await response.json();
  return jwt; // stocker ce token
};
```

### Utiliser le token dans les requêtes

```javascript
const fetchProtectedBlogs = async (token) => {
  const response = await fetch('http://localhost:1337/api/blogs', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { data } = await response.json();
  return data;
};
```

### Avec axios (intercepteur global)

```javascript
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:1337/api' });

// Ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 13. Référence rapide

```
# Tous les éléments
GET /api/{collection}

# Un élément
GET /api/{collection}/{documentId}

# Pagination
?pagination[page]=1&pagination[pageSize]=10

# Champs spécifiques
?fields[0]=titre&fields[1]=description

# Trier
?sort[0]=publishedAt:desc

# Filtrer
?filters[champ][$eq]=valeur

# Peupler relations
?populate[0]=image&populate[1]=auteur

# Tout peupler (dev seulement)
?populate=*
```

---

> 📚 Documentation officielle : [docs.strapi.io](https://docs.strapi.io)
