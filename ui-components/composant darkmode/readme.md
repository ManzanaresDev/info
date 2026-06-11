# Manuel — Composant Dark Mode avec Toggle et Icônes (react-icons)

---

## 01 · Installation & prérequis

### Packages requis

```bash
# npm
npm install react-icons

# yarn
yarn add react-icons
```

> `react-icons` regroupe Feather, Heroicons, FontAwesome, Material Icons et bien d'autres dans un seul package. Chaque icône est importée individuellement — **tree-shakeable** par défaut.

### Icônes utilisées dans ce guide (Feather Icons)

| Import | Icône | Usage |
|---|---|---|
| `FiMoon` | 🌙 | Représente le mode sombre |
| `FiSun` | ☀️ | Représente le mode clair |
| `FiLayout` | ▣ | Icône de navigation |
| `FiUser` | 👤 | Profil utilisateur |
| `FiSettings` | ⚙️ | Paramètres |
| `FiMenu` | ☰ | Menu burger |

```jsx
import { FiMoon, FiSun, FiLayout, FiUser, FiSettings, FiMenu } from 'react-icons/fi'
```

---

## 02 · Architecture des fichiers

```
src/
├── hooks/
│   └── useDarkMode.js        ← hook personnalisé
├── components/
│   └── DarkModeToggle.jsx    ← composant toggle
├── styles/
│   └── toggle.css            ← styles du curseur
└── App.jsx                   ← utilisation
```

---

## 03 · Le hook `useDarkMode`

Le hook centralise la logique : lecture des préférences système, persistance dans `localStorage`, et application de la classe `dark` sur `<html>`.

```js
// hooks/useDarkMode.js
import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // 1. Lire la préférence sauvegardée
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'

    // 2. Fallback : préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Appliquer la classe sur <html> (compatibilité Tailwind)
    document.documentElement.classList.toggle('dark', isDark)

    // Persister le choix
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return [isDark, setIsDark]
}
```

---

## 04 · Le composant `DarkModeToggle`

```jsx
// components/DarkModeToggle.jsx
import { FiSun, FiMoon } from 'react-icons/fi'
import { useDarkMode } from '../hooks/useDarkMode'
import '../styles/toggle.css'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useDarkMode()

  return (
    <button
      onClick={() => setIsDark(v => !v)}
      role="switch"
      aria-checked={isDark}
      aria-label="Basculer le mode sombre"
      className="toggle-btn"
    >
      {/* Track */}
      <span className={`track ${isDark ? 'dark' : 'light'}`}>

        {/* Thumb avec icône react-icons */}
        <span className="thumb">
          {isDark
            ? <FiMoon size={12} />
            : <FiSun  size={12} color="#f59e0b" />
          }
        </span>

      </span>
    </button>
  )
}
```

---

## 05 · CSS du toggle

```css
/* styles/toggle.css */

.toggle-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

/* Track — la piste du curseur */
.track {
  display: inline-flex;
  align-items: center;
  width: 52px;
  height: 28px;
  border-radius: 14px;
  position: relative;
  transition: background 0.25s;
}
.track.dark  { background: #334155; }
.track.light { background: #e2e8f0; }

/* Thumb — le bouton circulaire */
.thumb {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Déplacer le thumb vers la droite en mode clair */
.track.light .thumb {
  transform: translateX(24px);
}
```

---

## 06 · Utilisation dans `App.jsx`

```jsx
// App.jsx
import DarkModeToggle from './components/DarkModeToggle'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useDarkMode } from './hooks/useDarkMode'

export default function App() {
  const [isDark] = useDarkMode()

  return (
    <div className={isDark ? 'dark' : ''}>
      <header>
        <nav>
          <span>Mon App</span>

          {/* Variante : icônes de chaque côté */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMoon size={16} />
            <DarkModeToggle />
            <FiSun  size={16} />
          </div>
        </nav>
      </header>

      <main>
        <p>Le thème actif est : {isDark ? 'sombre 🌙' : 'clair ☀️'}</p>
      </main>
    </div>
  )
}
```

---

## 07 · Props du composant

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `isDark` | `boolean` | `false` | État contrôlé du thème |
| `onChange` | `function` | — | Callback appelé au clic |
| `size` | `number` | `52` | Largeur du track en px |
| `iconSize` | `number` | `12` | Taille de l'icône react-icons |
| `showLabel` | `boolean` | `false` | Affiche "Dark / Light" à côté |

### Exemple avec props explicites

```jsx
<DarkModeToggle
  isDark={isDark}
  onChange={(val) => setIsDark(val)}
  size={52}
  iconSize={12}
  showLabel={true}
/>
```

---

## 08 · Intégration avec Tailwind CSS

Activer le mode `class` dans la configuration Tailwind :

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // ← obligatoire
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Utiliser les classes `dark:` dans les composants :

```jsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <h1 className="text-2xl font-semibold">Titre</h1>
  <p className="text-slate-500 dark:text-slate-400">Sous-titre</p>
</div>
```

---

## 09 · Éviter le flash FOUC

Sans précaution, l'app s'affiche brièvement en mode clair avant que React applique la classe `dark`. Pour l'éviter, injecter un script inline dans `<head>` **avant** le chargement React :

```html
<!-- index.html -->
<head>
  <script>
    (function () {
      const saved = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark')
      }
    })()
  </script>
</head>
```

---

## 10 · Bonnes pratiques

1. **Lire `prefers-color-scheme`** au premier rendu pour respecter les préférences système.
2. **Persister dans `localStorage`** pour conserver le choix entre les sessions.
3. **Appliquer la classe sur `<html>`** (pas sur un wrapper), pour que Tailwind et les CSS globaux fonctionnent correctement.
4. **Accessibilité** : toujours ajouter `aria-label` et `role="switch"` sur le bouton toggle.
5. **Anti-FOUC** : injecter le script de détection dans `<head>` avant le bundle React.
6. **Tree-shaking** : importer chaque icône individuellement (`import { FiMoon } from 'react-icons/fi'`), jamais l'ensemble du package.

---

## Récapitulatif des imports react-icons

```jsx
// Feather Icons (recommandé pour ce composant)
import { FiSun, FiMoon, FiSettings, FiUser, FiMenu } from 'react-icons/fi'

// Heroicons (alternative)
import { HiSun, HiMoon } from 'react-icons/hi'

// Material Design Icons (alternative)
import { MdLightMode, MdDarkMode } from 'react-icons/md'
```
