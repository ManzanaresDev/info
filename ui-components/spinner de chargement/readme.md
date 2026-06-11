# Intégration du Spinner au Chargement Initial du Site (React)

Ce document explique comment afficher votre `LogoSpinner` lors du chargement initial de votre application React.

---

## 🚀 Méthode 1 — Gestion du spinner dans `App.jsx`
La méthode la plus simple : on affiche le spinner tant que le site n'est pas prêt.

### 1. Aucun changement dans `main.jsx`
Le spinner est géré dans `App.jsx`.

### 2. Ajoutez un état dans `App.jsx`
```jsx
import { useEffect, useState } from "react";
import { LogoSpinner } from "./components/LogoSpinner";

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
        }}
      >
        <LogoSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Votre site */}
    </>
  );
}

export default App;
```

---

## ⭐ Méthode 2 — Affichage avant même que React ne charge
Cette méthode montre un écran de chargement **instantanément**, avant le rendu React.

### 1. Ajoutez un loader dans `index.html`
```html
<div id="initial-loader" style="
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
">
  <!-- Votre SVG LogoSpinner ici -->
</div>

<div id="root"></div>
```

### 2. Masquez le loader une fois React chargé (`main.jsx`)
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

const loader = document.getElementById("initial-loader");
if (loader) {
  loader.style.opacity = "0";
  setTimeout(() => loader.remove(), 300);
}
```

---

## ⭐ Méthode 3 — Utilisation de `React.Suspense` et `lazy()`
Pour les projets avec lazy loading.

```jsx
import { Suspense, lazy } from "react";
import { LogoSpinner } from "./components/LogoSpinner";

const AppContent = lazy(() => import("./AppContent"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
        }}>
          <LogoSpinner />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
```

---

## 🎯 Quelle méthode choisir ?
| Objectif | Méthode recommandée |
|---------|----------------------|
| Spinner visible dès l'ouverture du site | Méthode 2 |
| Intégration simple | Méthode 1 |
| App modulée avec lazy loading | Méthode 3 |

---

Si vous souhaitez également une version avec effet fade-in/fade-out ou un loader fullscreen optimisé, je peux l'ajouter ici.

