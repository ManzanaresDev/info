# 🔍 Strapi — Comment fonctionne le populate dans une query string

## L'URL décortiquée

```
http://localhost:1337/api/home-page
  ?populate[sections][on][layout.hero-section][populate][image][fields]
  &populate[sections][on][layout.hero-section][populate][link][populate]
```

---

## Pourquoi populate est nécessaire

Par défaut, l'API Strapi **ne retourne pas les relations et les médias** — elle retourne uniquement les champs simples (texte, nombre, date...).

**Sans populate**
```
GET /api/articles
```
```json
{
  "data": [
    {
      "id": 1,
      "titre": "Mon article",
      "contenu": "..."
      // ← image, catégorie, auteur... absents !
    }
  ]
}
```

**Avec populate**
```
GET /api/articles?populate=*
```
```json
{
  "data": [
    {
      "id": 1,
      "titre": "Mon article",
      "contenu": "...",
      "image": { "url": "/uploads/photo.jpg" },
      "categorie": { "nom": "Tech" },
      "auteur": { "nom": "Marcos" }
    }
  ]
}
```

> **Pourquoi ce choix ?** C'est volontaire — Strapi évite de charger automatiquement toutes les relations pour des raisons de performance. Si chaque article a 10 relations et que tu as 1000 articles, charger tout automatiquement serait très lourd.

---

## Décomposition de l'URL complète

```
populate
  [sections]                      → populate le champ "sections" (zone dynamique)
    [on]                          → filtre par composant spécifique
      [layout.hero-section]       → uniquement le composant "hero-section"
        [populate]
          [image]                 → populate le champ "image" de ce composant
            [fields]              → sélectionne certains champs (url, alt...)
          [link]                  → populate le champ "link" de ce composant
            [populate]            → populate les relations de "link"
```

---

## Pourquoi `[on]` ?

Parce que `sections` est une **zone dynamique** — elle peut contenir plusieurs types de composants différents (`hero-section`, `features-section`, `cta-section`...).

Sans `[on]`, Strapi ne sait pas quel composant peupler.  
`[on]` permet de cibler précisément un composant.

| | Comportement |
|---|---|
| **sans `[on]`** | Populate tous les composants de sections (lourd) |
| **avec `[on]`** | Populate uniquement `layout.hero-section` (précis et performant) |

---

## Options populate courantes

```
?populate=*                              → tout populate (niveau 1)
?populate=image                          → seulement l'image
?populate=image,categorie                → image et catégorie
?populate[auteur][populate]=*            → populate imbriqué
?populate[sections][on][layout.hero-section][populate]=*  → zone dynamique
```

---

## Version lisible avec la librairie `qs`

Écrire ces query strings à la main est illisible et source d'erreurs.
La librairie **`qs`** permet de les construire proprement en JavaScript.

```bash
npm install qs
npm install -D @types/qs
```

```ts
import qs from "qs";

const query = qs.stringify({
  populate: {
    sections: {
      on: {
        "layout.hero-section": {
          populate: {
            image: {
              fields: ["url", "alt", "width", "height"]
            },
            link: {
              populate: true
            }
          }
        }
      }
    }
  }
}, { encodeValuesOnly: true }); // important : évite d'encoder les crochets

const res = await fetch(`http://localhost:1337/api/home-page?${query}`);
const data = await res.json();
```

---

## Résumé visuel de la structure

```
home-page
└── sections (zone dynamique)
    └── [on] layout.hero-section  ← filtre ce composant
        ├── image
        │   └── fields (url, alt, width, height)
        └── link
            └── populate (ses relations)
```

---

## Exemple complet — plusieurs composants

```ts
const query = qs.stringify({
  populate: {
    sections: {
      on: {
        "layout.hero-section": {
          populate: {
            image: { fields: ["url", "alt"] },
            link: { populate: true }
          }
        },
        "layout.features-section": {
          populate: {
            features: {
              populate: { icon: { fields: ["url"] } }
            }
          }
        },
        "layout.cta-section": {
          populate: { button: { populate: true } }
        }
      }
    }
  }
}, { encodeValuesOnly: true });
```

---

> 📖 Documentation officielle : **docs.strapi.io/dev-docs/api/rest/populate-select**
