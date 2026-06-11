# LoadingSpinner Component

## Description

Le composant `LoadingSpinner` est un indicateur de chargement visuel conçu pour les applications React. Il affiche un cercle animé avec un effet de rotation et un halo lumineux pour améliorer la perception du chargement. Le composant est entièrement paramétrable via **Tailwind CSS** en utilisant uniquement la prop `className`.

---

## Fonctionnalités

- **Animation fluide** : le cercle tourne grâce à la classe `animate-spin` de Tailwind.
- **Halo lumineux** : optionnel grâce à l'effet `blur` et `opacity` sur le cercle secondaire.
- **Responsive** : taille ajustable via `className` pour s’adapter à tous les écrans.
- **Facile à personnaliser** : toutes les couleurs, tailles et bordures peuvent être définies via Tailwind dans `className`.
- **Centrage automatique** : le spinner est centré verticalement et horizontalement.

---

## Props

| Nom         | Type   | Default   | Description |
| ----------- | ------ | --------- | ----------- |
| `className` | string | `""`      | Permet de personnaliser entièrement la taille, la bordure et les couleurs du spinner via Tailwind CSS. |

> Toutes les personnalisations se font dans la prop `className`, il n'y a pas d'autres props.

---

## Code du composant

```jsx
import React from "react";

const LoadingSpinner = ({ className = "" }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className={`relative ${className}`}>
        {/* Halo lumineux */}
        <div className="absolute inset-0 rounded-full border-8 border-yellow-400 opacity-30 blur-xl animate-spin"></div>

        {/* Cercle principal animé */}
        <div className="h-full w-full border-8 border-gray-700 border-t-yellow-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

## Utilisation:

import React from "react";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

function App() {
  return (
    <div className="bg-black">
      {/* Exemple d'utilisation avec personnalisation via className */}
      <LoadingSpinner className="h-24 w-24 border-8 border-gray-700 border-t-yellow-400" />
    </div>
  );
}

export default App;


export default LoadingSpinner;
