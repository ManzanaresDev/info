# 🪝 Créer un Hook Personnalisé en React + Comprendre `useCallback`

Ce guide regroupe :
1. Un exemple de **création d’un hook personnalisé**
2. Pourquoi on utilise **`useCallback`** à l’intérieur

---

## 🧩 Exemple : Hook personnalisé `useToggle`

Un hook qui gère un état booléen (ouvrir/fermer une modal, afficher/masquer un élément, etc.)

### 📁 Fichier : `src/hooks/useToggle.js`

```jsx
import { useState, useCallback } from "react";

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

---

## 🚀 Utilisation du hook dans un composant

```jsx
import useToggle from "../hooks/useToggle";

function ExampleComponent() {
  const { value: isOpen, toggle, setFalse } = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>
        {isOpen ? "Fermer" : "Ouvrir"} la modal
      </button>

      {isOpen && (
        <div style={{ border: "1px solid black", padding: "10px", marginTop: "10px" }}>
          <p>Je suis une modal 🎉</p>
          <button onClick={setFalse}>Fermer</button>
        </div>
      )}
    </div>
  );
}

export default ExampleComponent;
```

---

# ⚙️ Pourquoi utiliser `useCallback` dans un hook ?

### 🎯 Rôle de `useCallback`
`useCallback` sert à **mémoriser une fonction** pour éviter qu’elle soit recréée à chaque rendu du composant.

Sans `useCallback` :

```js
const toggle = () => {
  setValue(v => !v);
};
```

➡️ Une **nouvelle fonction** est créée à chaque render.

Avec `useCallback` :

```js
const toggle = useCallback(() => {
  setValue(v => !v);
}, []);
```

➡️ React garde **la même référence mémoire** entre les renders.

---

## 🧠 Pourquoi c’est important ?

### 1️⃣ Éviter les re-renders inutiles des composants enfants

```jsx
<Child onToggle={toggle} />
```

Si `toggle` change à chaque render, `Child` re-render aussi, même si rien d’autre ne change.  
Avec `useCallback`, la référence reste stable → meilleures performances (surtout avec `React.memo`).

---

### 2️⃣ Éviter les boucles dans `useEffect`

```js
useEffect(() => {
  doSomething(toggle);
}, [toggle]);
```

Sans `useCallback`, `toggle` change à chaque render → l’effet se relance en boucle.

---

## 📌 Pourquoi le tableau de dépendances est vide `[]` ?

```js
useCallback(() => {
  setValue(v => !v);
}, []);
```

La fonction ne dépend d’aucune variable externe.  
Elle utilise la valeur précédente `v` fournie par React, donc aucune dépendance nécessaire.

---

## ⚖️ Faut-il toujours utiliser `useCallback` ?

❌ Non, pas systématiquement.

Utilise-le surtout quand :

✔ Tu passes la fonction à des composants enfants optimisés  
✔ La fonction est dans les dépendances d’un `useEffect`  
✔ Tu as un vrai besoin d’optimisation des performances

Sinon, ça ajoute de la complexité inutile.

---

## 🧠 Résumé

| Sans `useCallback` | Avec `useCallback` |
|--------------------|--------------------|
| Nouvelle fonction à chaque render | Même référence entre les renders |
| Peut provoquer des re-renders inutiles | Optimise les performances |
| Plus simple | Utile pour composants mémorisés et effets |

---

Les hooks personnalisés permettent de réutiliser de la logique proprement, et `useCallback` aide à garder des performances optimales quand les fonctions sont partagées entre composants.
