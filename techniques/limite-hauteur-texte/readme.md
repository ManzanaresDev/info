# Limiter l'hauteur d'un texte dans un element html (p, div, etc)

**Aujourd’hui la manière moderne pour limiter le nombre de lignes reste line-clamp, et Tailwind possède un utilitaire intégré pour ça**

La version CSS moderne et standardisée utilise désormais line-clamp.

```css
.resumen {
  line-clamp: 4;
}
```

Mais attention : le support natif complet reste encore inégal selon les navigateurs.
Donc en pratique, la version la plus fiable aujourd’hui reste :

```css
.resumen {
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
```

## Exemple :

```javascript
<p className="line-clamp-4">
  Lorem ipsum dolor sit amet consectetur adipisicing elit...
</p>
```

Si line-clamp-4 ne fonctionne pas, installe le plugin officiel Tailwind :

## Installation du plugin officiel (en cas de non fonctionnement!)

Si line-clamp-4 ne fonctionne pas, installe le plugin officiel Tailwind :

```bash
npm install @tailwindcss/line-clamp
```

Puis dans tailwind.config.js :

```javascript
module.exports = {
  plugins: [require("@tailwindcss/line-clamp")],
};
```

Avec Tailwind v4, line-clamp est normalement intégré nativement.
