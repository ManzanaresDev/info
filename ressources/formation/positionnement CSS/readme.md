# 📐 Manuel Complet du Positionnement CSS en React

> Guide de référence exhaustif — syntaxe JSX / inline styles / Tailwind / CSS Modules

---

## Table des matières

1. [Les bases du positionnement](#1-les-bases-du-positionnement)
2. [Position statique](#2-position-statique)
3. [Position relative](#3-position-relative)
4. [Position absolute](#4-position-absolute)
5. [Position fixed](#5-position-fixed)
6. [Position sticky](#6-position-sticky)
7. [Flexbox](#7-flexbox)
8. [CSS Grid](#8-css-grid)
9. [z-index & empilement](#9-z-index--empilement)
10. [Transform & Translate](#10-transform--translate)
11. [Centrage — tous les cas](#11-centrage--tous-les-cas)
12. [Responsive & Media Queries en React](#12-responsive--media-queries-en-react)
13. [Positionnement avec Tailwind CSS](#13-positionnement-avec-tailwind-css)
14. [Positionnement avec CSS Modules](#14-positionnement-avec-css-modules)
15. [Patterns avancés](#15-patterns-avancés)
16. [Cheatsheet récapitulatif](#16-cheatsheet-récapitulatif)

---

## 1. Les bases du positionnement

### Rappel des 3 façons de styler en React

```jsx
// 1. Inline styles (objet JS — camelCase obligatoire)
<div style={{ position: 'relative', top: 10, left: '50%' }} />

// 2. CSS Modules
import styles from './Component.module.css';
<div className={styles.box} />

// 3. Tailwind CSS (classes utilitaires)
<div className="relative top-2 left-1/2" />
```

### La propriété `position` — valeurs possibles

| Valeur | Description |
|--------|-------------|
| `static` | Valeur par défaut. Suit le flux normal du document |
| `relative` | Décalé par rapport à sa position initiale, reste dans le flux |
| `absolute` | Sorti du flux, positionné par rapport au parent positionné le plus proche |
| `fixed` | Sorti du flux, positionné par rapport à la fenêtre (`viewport`) |
| `sticky` | Hybride : relatif jusqu'à un seuil de scroll, puis fixed |

---

## 2. Position statique

Comportement par défaut. Les propriétés `top`, `right`, `bottom`, `left` n'ont **aucun effet**.

```jsx
// Inline
<div style={{ position: 'static' }}>Contenu normal</div>

// Tailwind
<div className="static">Contenu normal</div>
```

---

## 3. Position relative

L'élément reste dans le flux mais peut être **décalé visuellement**. Il sert aussi de **contexte de positionnement** pour ses enfants `absolute`.

```jsx
// Inline styles
<div
  style={{
    position: 'relative',
    top: '20px',    // descend de 20px par rapport à sa position initiale
    left: '30px',   // décale de 30px vers la droite
  }}
>
  Décalé mais dans le flux
</div>
```

```css
/* CSS Module */
.box {
  position: relative;
  top: 20px;
  left: 30px;
}
```

```jsx
// Tailwind
<div className="relative top-5 left-8">Décalé</div>
```

> ⚠️ L'espace original de l'élément est **conservé** dans le flux.

---

## 4. Position absolute

L'élément est **sorti du flux**. Il se positionne par rapport au **premier ancêtre dont `position` ≠ `static`**.

```jsx
// Pattern parent/enfant classique
function Card() {
  return (
    <div style={{ position: 'relative', width: 300, height: 200 }}>
      {/* Parent = contexte de référence */}

      <span
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'red',
          color: 'white',
          borderRadius: '50%',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        3
      </span>

      <p>Contenu de la carte</p>
    </div>
  );
}
```

### Les 4 coins

```css
.top-left     { position: absolute; top: 0;    left: 0;   }
.top-right    { position: absolute; top: 0;    right: 0;  }
.bottom-left  { position: absolute; bottom: 0; left: 0;   }
.bottom-right { position: absolute; bottom: 0; right: 0;  }
```

### Couvrir entièrement le parent (overlay)

```jsx
<div
  style={{
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // ou : inset: 0 (raccourci moderne)
    backgroundColor: 'rgba(0,0,0,0.5)',
  }}
/>
```

```css
/* Raccourci CSS moderne */
.overlay {
  position: absolute;
  inset: 0; /* équivalent top/right/bottom/left: 0 */
}
```

```jsx
// Tailwind
<div className="absolute inset-0 bg-black/50" />
```

---

## 5. Position fixed

Se positionne par rapport au **viewport** (fenêtre du navigateur). Reste visible même lors du scroll.

```jsx
// Barre de navigation fixe en haut
function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      Navigation
    </nav>
  );
}

// Compenser la navbar dans le layout
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>{children}</main>
    </>
  );
}
```

```jsx
// Bouton flottant (FAB) en bas à droite
<button
  style={{
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 999,
  }}
>
  +
</button>
```

```jsx
// Tailwind — modal backdrop
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div className="bg-white rounded-xl p-6">Contenu modal</div>
</div>
```

> ⚠️ `position: fixed` est cassé à l'intérieur d'un parent avec `transform`, `filter` ou `perspective` appliqué.

---

## 6. Position sticky

L'élément se comporte comme `relative` **jusqu'à** atteindre un seuil de scroll, puis comme `fixed` **dans son conteneur parent**.

```jsx
// Header de section qui colle au scroll
<section style={{ height: 500, overflowY: 'auto' }}>
  <h2
    style={{
      position: 'sticky',
      top: 0,          // colle quand il atteint le haut
      backgroundColor: '#f9f9f9',
      padding: '8px 0',
      zIndex: 10,
    }}
  >
    Titre de section
  </h2>
  <p>Contenu long...</p>
</section>
```

```jsx
// Tailwind — sidebar sticky
<aside className="sticky top-20 h-fit">
  Sommaire
</aside>
```

### Conditions requises pour que sticky fonctionne

1. `top` (ou `bottom`) doit être défini
2. Le parent **ne doit pas** avoir `overflow: hidden` ou `overflow: auto`
3. Le parent doit avoir une hauteur suffisante pour permettre le scroll

---

## 7. Flexbox

Flexbox est le système de mise en page **unidimensionnel** (ligne ou colonne).

### Propriétés du conteneur

```css
.container {
  display: flex;

  /* Direction */
  flex-direction: row;            /* row | row-reverse | column | column-reverse */

  /* Retour à la ligne */
  flex-wrap: nowrap;              /* nowrap | wrap | wrap-reverse */

  /* Alignement axe principal (horizontal si row) */
  justify-content: flex-start;   /* flex-start | center | flex-end | space-between | space-around | space-evenly */

  /* Alignement axe secondaire (vertical si row) */
  align-items: stretch;          /* stretch | flex-start | center | flex-end | baseline */

  /* Alignement des lignes (multi-lignes) */
  align-content: flex-start;     /* même valeurs que justify-content */

  /* Espacement */
  gap: 16px;                     /* gap | row-gap | column-gap */
}
```

### Propriétés des enfants

```css
.item {
  /* Ordre d'affichage */
  order: 0;

  /* Capacité à grandir */
  flex-grow: 0;    /* 0 = ne grandit pas | 1 = prend l'espace disponible */

  /* Capacité à rétrécir */
  flex-shrink: 1;  /* 1 = peut rétrécir | 0 = ne rétrécit pas */

  /* Taille de base */
  flex-basis: auto;  /* auto | 0 | 200px | 50% */

  /* Raccourci : grow shrink basis */
  flex: 0 1 auto;
  flex: 1;          /* équivalent à flex: 1 1 0 */

  /* Surcharge l'alignement du parent */
  align-self: auto; /* auto | flex-start | center | flex-end | stretch | baseline */
}
```

### Exemples React courants

```jsx
// Ligne centrée horizontalement et verticalement
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <div>Centré !</div>
</div>

// Navbar : logo à gauche, liens à droite
<nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
  <Logo />
  <ul style={{ display: 'flex', gap: 16, listStyle: 'none' }}>
    <li>Accueil</li>
    <li>À propos</li>
    <li>Contact</li>
  </ul>
</nav>

// Colonne avec élément qui pousse le reste vers le bas
<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  <Header />
  <main style={{ flex: 1 }}>Contenu</main>  {/* prend tout l'espace restant */}
  <Footer />
</div>
```

```jsx
// Tailwind — grille de cartes
<div className="flex flex-wrap gap-4">
  {cards.map(card => (
    <div key={card.id} className="flex-1 min-w-[250px]">
      {card.content}
    </div>
  ))}
</div>
```

---

## 8. CSS Grid

Grid est le système de mise en page **bidimensionnel** (lignes ET colonnes).

### Propriétés du conteneur

```css
.grid {
  display: grid;

  /* Définir les colonnes */
  grid-template-columns: 200px 1fr 1fr;         /* tailles fixes/flexibles */
  grid-template-columns: repeat(3, 1fr);         /* 3 colonnes égales */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* responsive */

  /* Définir les lignes */
  grid-template-rows: auto 1fr auto;

  /* Espacement */
  gap: 16px;
  row-gap: 16px;
  column-gap: 24px;

  /* Zones nommées */
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";

  /* Alignement des cellules */
  justify-items: stretch;   /* stretch | start | center | end */
  align-items: stretch;

  /* Alignement de la grille dans son conteneur */
  justify-content: start;
  align-content: start;
}
```

### Propriétés des enfants

```css
.item {
  /* Placement par numéro de ligne */
  grid-column: 1 / 3;        /* de la colonne 1 à 3 */
  grid-column: 1 / -1;       /* de la 1ère à la dernière */
  grid-column: span 2;       /* s'étend sur 2 colonnes */

  grid-row: 2 / 4;

  /* Placement par zone nommée */
  grid-area: header;

  /* Alignement individuel */
  justify-self: center;
  align-self: end;
}
```

### Layout classique avec zones nommées

```jsx
// CSS Module
// layout.module.css
/*
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr 50px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
  gap: 0;
}
.header  { grid-area: header;  }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main;    }
.footer  { grid-area: footer;  }
*/

import styles from './layout.module.css';

function AppLayout({ children }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>Navigation</header>
      <aside className={styles.sidebar}>Menu</aside>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>Pied de page</footer>
    </div>
  );
}
```

### Grille responsive auto-fit

```jsx
// Galerie de cartes responsive sans media queries
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  }}
>
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

```jsx
// Tailwind
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## 9. z-index & empilement

`z-index` contrôle l'ordre d'empilement des éléments **dans le même contexte d'empilement**.

```jsx
// Échelle de z-index recommandée dans une app React
const Z = {
  base:    0,
  raised:  10,
  dropdown: 100,
  sticky:  200,
  overlay: 300,
  modal:   400,
  toast:   500,
  tooltip: 600,
};

// Utilisation
<div style={{ position: 'fixed', zIndex: Z.modal }}>Modal</div>
<div style={{ position: 'fixed', zIndex: Z.toast }}>Toast</div>
```

### Contexte d'empilement

Un nouveau contexte d'empilement est créé par :
- `position: relative/absolute/fixed/sticky` + `z-index` ≠ `auto`
- `opacity` < 1
- `transform` ≠ `none`
- `filter` ≠ `none`
- `isolation: isolate`

```jsx
// Forcer un nouveau contexte d'empilement (isoler les z-index enfants)
<div style={{ isolation: 'isolate' }}>
  {/* Les z-index à l'intérieur n'interfèrent pas avec l'extérieur */}
  <div style={{ position: 'absolute', zIndex: 9999 }}>Limité à ce contexte</div>
</div>
```

---

## 10. Transform & Translate

`transform` permet de déplacer, tourner, agrandir sans affecter le flux.

```jsx
// Translate — déplacer
<div style={{ transform: 'translateX(50px)' }} />         // horizontal
<div style={{ transform: 'translateY(-20px)' }} />        // vertical
<div style={{ transform: 'translate(50px, -20px)' }} />   // les deux
<div style={{ transform: 'translateX(50%)' }} />          // 50% de sa propre largeur

// Rotate — pivoter
<div style={{ transform: 'rotate(45deg)' }} />

// Scale — agrandir/réduire
<div style={{ transform: 'scale(1.1)' }} />
<div style={{ transform: 'scaleX(2)' }} />

// Combiner plusieurs transforms
<div style={{ transform: 'translateX(-50%) translateY(-50%) rotate(10deg)' }} />

// Avec transition (animation)
<div
  style={{
    transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
    opacity: isVisible ? 1 : 0,
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  }}
/>
```

### Centrage classique avec transform

```jsx
// Centrer absolument un élément de taille inconnue
<div style={{ position: 'relative', width: 400, height: 300 }}>
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  >
    Centré !
  </div>
</div>
```

---

## 11. Centrage — tous les cas

### Centrage horizontal

```css
/* Bloc dans un conteneur */
.box { margin: 0 auto; width: fit-content; }

/* Texte */
.text { text-align: center; }

/* Flexbox */
.flex { display: flex; justify-content: center; }

/* Grid */
.grid { display: grid; place-items: center; } /* ou justify-items: center */
```

### Centrage vertical

```css
/* Flexbox (le plus courant) */
.flex { display: flex; align-items: center; }

/* Grid */
.grid { display: grid; align-items: center; }

/* Absolu + transform */
.abs { position: absolute; top: 50%; transform: translateY(-50%); }
```

### Centrage total (horizontal + vertical)

```jsx
// 1. Flexbox (recommandé)
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  <div>Centré</div>
</div>

// 2. Grid place-items
<div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
  <div>Centré</div>
</div>

// 3. Absolu + transform (pour modal, popup)
<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
  <div>Centré</div>
</div>

// 4. Tailwind
<div className="flex items-center justify-center h-screen">
  <div>Centré</div>
</div>
// ou
<div className="grid place-items-center h-screen">
  <div>Centré</div>
</div>
```

---

## 12. Responsive & Media Queries en React

### CSS Module (approche recommandée)

```css
/* component.module.css */
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Hook `useMediaQuery` personnalisé

```jsx
import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Utilisation
function ResponsiveComponent() {
  const isMobile  = useMediaQuery('(max-width: 639px)');
  const isTablet  = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: isMobile ? 8 : 16,
      }}
    >
      {/* contenu */}
    </div>
  );
}
```

### Breakpoints standards (Tailwind-inspired)

| Nom | Largeur minimale |
|-----|-----------------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## 13. Positionnement avec Tailwind CSS

### Position

```jsx
<div className="static" />
<div className="relative" />
<div className="absolute" />
<div className="fixed" />
<div className="sticky" />
```

### Coordonnées (top / right / bottom / left / inset)

```jsx
<div className="absolute top-0 right-0" />          // coin haut-droite
<div className="absolute bottom-4 left-4" />        // en bas à gauche avec marge
<div className="absolute inset-0" />                // couvre tout
<div className="absolute inset-x-0 bottom-0" />    // toute la largeur en bas
<div className="sticky top-16" />                  // colle à 64px du haut
```

### Flexbox

```jsx
<div className="flex" />
<div className="flex flex-col" />
<div className="flex flex-row-reverse" />
<div className="flex flex-wrap" />
<div className="flex items-center justify-between gap-4" />
<div className="flex items-start justify-start" />
<div className="flex-1" />           // flex: 1 1 0
<div className="flex-none" />        // flex: none
<div className="flex-shrink-0" />    // flex-shrink: 0
```

### Grid

```jsx
<div className="grid grid-cols-3 gap-4" />
<div className="grid grid-cols-[200px_1fr_1fr] gap-6" />
<div className="grid grid-cols-12" />
<div className="col-span-2" />          // s'étend sur 2 colonnes
<div className="col-span-full" />       // toute la largeur
<div className="col-start-2 col-end-4" />
<div className="row-span-2" />
```

### z-index

```jsx
<div className="z-0" />     // z-index: 0
<div className="z-10" />    // z-index: 10
<div className="z-20" />
<div className="z-30" />
<div className="z-40" />
<div className="z-50" />    // z-index: 50
<div className="z-auto" />
```

### Responsive (préfixes)

```jsx
<div className="
  w-full
  sm:w-1/2
  md:w-1/3
  lg:w-1/4
  xl:w-1/5
" />

<div className="
  flex flex-col
  md:flex-row
  md:items-center
  md:justify-between
" />
```

---

## 14. Positionnement avec CSS Modules

```css
/* Card.module.css */
.card {
  position: relative;
  overflow: hidden;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s;
}

.card:hover .overlay {
  background: rgba(0, 0, 0, 0.3);
}
```

```jsx
// Card.jsx
import styles from './Card.module.css';
import clsx from 'clsx'; // optionnel, pour combiner des classes

function Card({ badge, children, className }) {
  return (
    <div className={clsx(styles.card, className)}>
      {badge && <span className={styles.badge}>{badge}</span>}
      <div className={styles.overlay} />
      {children}
    </div>
  );
}
```

### Combiner CSS Modules + styles dynamiques

```jsx
function Box({ isActive, size = 'medium' }) {
  return (
    <div
      className={clsx(
        styles.box,
        styles[size],                          // styles.small / .medium / .large
        { [styles.active]: isActive }          // conditionnel
      )}
      style={{
        // inline seulement pour les valeurs dynamiques
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
      }}
    />
  );
}
```

---

## 15. Patterns avancés

### Modal centrée (fixed + flex)

```jsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      {/* Contenu de la modal */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 32,
          maxWidth: 500,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{ position: 'absolute', top: 12, right: 12 }}
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
```

### Tooltip positionné dynamiquement

```jsx
import { useState, useRef } from 'react';

function Tooltip({ label, children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>

      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            backgroundColor: '#333',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            zIndex: 999,
            fontSize: 13,
          }}
        >
          {label}
          {/* Flèche */}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '5px solid transparent',
              borderTopColor: '#333',
            }}
          />
        </span>
      )}
    </span>
  );
}
```

### Sidebar fixe + contenu scrollable

```jsx
function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>

      {/* Sidebar fixe */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        <nav>Menu</nav>
      </aside>

      {/* Contenu principal scrollable */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        Contenu long...
      </main>

    </div>
  );
}
```

### Sticky header dans une liste virtualisée

```jsx
// Groupes avec headers sticky
function StickyList({ groups }) {
  return (
    <div style={{ overflowY: 'auto', height: 400 }}>
      {groups.map((group) => (
        <div key={group.label}>
          <h3
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#f3f4f6',
              padding: '6px 12px',
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              zIndex: 1,
            }}
          >
            {group.label}
          </h3>
          {group.items.map((item) => (
            <div key={item.id} style={{ padding: '8px 12px' }}>
              {item.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Animation d'entrée avec transform

```jsx
import { useState, useEffect } from 'react';

function SlideIn({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // déclencher après le mount pour que la transition s'active
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div
      style={{
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
      }}
    >
      {children}
    </div>
  );
}
```

---

## 16. Cheatsheet récapitulatif

### `position` en un coup d'œil

```
static   → flux normal, top/left ignorés
relative → décalage visuel, reste dans le flux, contexte pour absolute
absolute → hors flux, ancré au parent positionné
fixed    → hors flux, ancré au viewport
sticky   → relatif jusqu'au seuil, puis fixe dans son parent
```

### Centrage rapide

```jsx
// Flexbox
{ display:'flex', justifyContent:'center', alignItems:'center' }

// Grid
{ display:'grid', placeItems:'center' }

// Absolu (taille inconnue)
{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }

// Margin auto (horizontal, taille connue)
{ margin:'0 auto', width:'max-content' }
```

### Overlay complet

```jsx
{ position:'absolute', inset:0 }         // CSS moderne
{ position:'absolute', top:0, right:0, bottom:0, left:0 } // compatible
```

### Hiérarchie z-index suggérée

```
0    → base
10   → raised (cartes, éléments actifs)
100  → dropdown / popover
200  → sticky header
300  → overlay / backdrop
400  → modal
500  → toast / notification
600  → tooltip
```

### Correspondances Inline ↔ Tailwind

| Inline Style | Tailwind |
|---|---|
| `position: 'relative'` | `relative` |
| `position: 'absolute'` | `absolute` |
| `position: 'fixed'` | `fixed` |
| `position: 'sticky'` | `sticky` |
| `top: 0` | `top-0` |
| `inset: 0` | `inset-0` |
| `zIndex: 50` | `z-50` |
| `display: 'flex'` | `flex` |
| `alignItems: 'center'` | `items-center` |
| `justifyContent: 'between'` | `justify-between` |
| `display: 'grid'` | `grid` |
| `gridTemplateColumns: 'repeat(3,1fr)'` | `grid-cols-3` |
| `gap: 16` | `gap-4` |
| `transform: 'translate(-50%,-50%)'` | `-translate-x-1/2 -translate-y-1/2` |

---

*Manuel généré pour React — valable également pour Next.js, Remix et tout projet utilisant JSX.*