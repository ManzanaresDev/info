# 🧾 Manuel — Site vitrine avec édition côté client (Sanity + React)

Ce guide explique comment créer un site vitrine simple avec édition dynamique du contenu grâce à un CMS headless.

Technologies utilisées :

* Sanity (CMS headless)
* React + Vite (frontend)

---

## ⚙️ 1. Initialiser le CMS (Sanity)

### Installer le CLI

```bash
npm install -g @sanity/cli
```

### Créer un projet

```bash
sanity init
```

Choix recommandés :

* Template : Clean project
* Dataset : production

---

## 🧱 2. Créer les types de contenu

Créer un fichier dans `schemas/article.js` :

```js
export default {
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Titre",
      type: "string"
    },
    {
      name: "content",
      title: "Contenu",
      type: "text"
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true }
    }
  ]
};
```

Importer ensuite ce schéma dans `schema.js`.

---

## 🚀 3. Lancer le studio (interface admin)

```bash
sanity start
```

Interface accessible via navigateur pour :

* créer des articles
* modifier le contenu
* gérer les images

---

## ⚛️ 4. Créer le frontend avec Vite

```bash
npm create vite@latest frontend
cd frontend
npm install
npm install @sanity/client
```

---

## 🔌 5. Connecter Sanity au frontend

Créer `sanity.js` :

```js
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "TON_PROJECT_ID",
  dataset: "production",
  useCdn: true
});
```

---

## 📡 6. Récupérer les données

```js
import { useEffect, useState } from "react";
import { client } from "./sanity";

function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    client
      .fetch(`*[_type == "article"]`)
      .then(setArticles);
  }, []);

  return (
    <div>
      {articles.map((a) => (
        <div key={a._id}>
          <h2>{a.title}</h2>
          <p>{a.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
```

---

## ✏️ 7. Activer le live editing (preview)

Installer :

```bash
npm install @sanity/preview-kit
```

Configurer le client :

```js
const client = createClient({
  projectId: "TON_PROJECT_ID",
  dataset: "production",
  useCdn: false,
  token: "TON_TOKEN_PREVIEW"
});
```

Résultat :

* Les modifications dans Sanity sont visibles immédiatement sur le site

---

## 🖼️ 8. Gérer les images

Installer :

```bash
npm install @sanity/image-url
```

Configurer :

```js
import imageUrlBuilder from "@sanity/image-url";
import { client } from "./sanity";

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}
```

Utilisation :

```jsx
<img src={urlFor(article.image).width(300).url()} />
```

---

## 🔐 9. Sécurité minimale

* Ne jamais exposer de token admin côté frontend
* Utiliser un token read-only
* Garder les droits d’écriture dans Sanity Studio

---

## 🎯 Résultat final

✔️ Site vitrine React
✔️ Contenu dynamique
✔️ Interface admin complète
✔️ Édition en temps réel
✔️ Gestion des images

---

## 🧠 Architecture

```text
Frontend (React + Vite)
        ↓
     API Sanity
        ↓
   Studio Sanity (édition)
```

---

## 🔥 Bonus (améliorations)

* Ajouter des champs SEO (meta title, description)
* Créer plusieurs types (pages, services, contact)
* Utiliser un éditeur riche (Portable Text)
* Ajouter un mode preview sécurisé

---

## ⚡ Conclusion

Cette approche permet :

* un développement rapide
* une édition simple du contenu
* une architecture propre et scalable

C’est une solution moderne adaptée aux sites vitrines professionnels.
