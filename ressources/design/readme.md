
# 📱 Créer un Frontend Responsive Mobile-First

Ce guide explique les étapes essentielles pour concevoir une interface responsive en adoptant une approche **mobile-first**.

---

## 🧱 1. Structure de base du projet

- Initialise ton projet :
  - **Sans framework** : HTML + CSS (optionnellement SCSS/SASS)
  - **Avec framework** : React, Vue, etc. (ex. Vite + React)

---

## 🎨 2. Design mobile en premier

- Commence avec une **largeur max de 480px** (mode mobile dans les outils dev).
- Structure en **colonne unique**.
- Utilise des tailles lisibles pour mobile (`font-size: 16px` minimum).
- Espacements généreux (`padding`, `margin`).

---

## ⚙️ 3. CSS de base (mobile-first)

```css
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
  padding: 1rem;
}

.card {
  background-color: #222;
  color: white;
  margin-bottom: 1rem;
  border-radius: 8px;
  padding: 1rem;
}
```

---

## 🖼️ 4. Médias et images adaptables

```css
img {
  width: 100%;
  height: auto;
}
```

- Évite les `width: 300px` fixes.
- Préfère `%`, `vw`, `em`, `rem`.

---

## 📱 5. Media Queries (breakpoints)

Ajoute des règles **progressivement** pour adapter à des écrans plus larges :

```css
@media (min-width: 768px) {
  .container {
    display: flex;
    gap: 1rem;
  }

  .card {
    flex: 1;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
    margin: 0 auto;
  }
}
```

---

## 🧪 6. Tests sur différents appareils

- Outils de développement (`F12` → mode mobile)
- Appareils réels (mobile/tablette)
- Vérifie :
  - Réactivité des boutons
  - Alignement des éléments
  - Taille de texte lisible
  - Accessibilité : contraste, navigation clavier, etc.

---

## 🧰 7. Utilitaires CSS (optionnel)

Pour aller plus vite :

- [Bootstrap (via CDN)](https://getbootstrap.com/)
- [Tailwind CSS](https://tailwindcss.com/) (mobile-first par défaut)

---

## ✔️ 8. Bonnes pratiques

- Ajoute la balise viewport dans le `<head>` :

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

- Structure HTML sémantique :
  - `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Utilise `flexbox` ou `CSS grid` plutôt que `float`
- Empêche les débordements horizontaux si nécessaire :
  ```css
  body {
    overflow-x: hidden;
  }
  ```

---

> 💡 **Astuce** : commence toujours par la version mobile, puis élargis avec des media queries.
