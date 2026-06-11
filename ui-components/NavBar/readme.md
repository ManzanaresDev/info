# Composant React : NavBar

Le composant `NavBar` est une barre de navigation réactive pour un site web, conçue avec React et Tailwind CSS. Elle inclut un menu principal, un bouton hamburger pour les écrans mobiles, et un bouton d'action "Let's talk".

## Fonctionnalités principales

- **Responsive** : le menu s’adapte aux écrans larges et mobiles.
- **Menu Hamburger** : visible sur mobile pour ouvrir/fermer le menu.
- **Navigation fluide** : clic sur un lien fait défiler la section correspondante en douceur (`scrollIntoView`).
- **Bouton d’action** : un bouton "Let's talk" stylisé pour les appels à l’action.
- **Style moderne** : bordures arrondies, ombres et transitions pour une meilleure expérience utilisateur.

## Structure

1. **Logo** : texte + icône.
2. **Bouton menu (mobile)** : ouvre le menu responsive.
3. **Menu responsive** :
   - Liste de liens vers les sections du site.
   - Bouton de fermeture pour mobile.
   - Bouton "Let's talk".

## Liste des sections du menu

| Nom          | Lien            |
| ------------ | --------------- |
| Skills       | `#Skills`       |
| Services     | `#Services`     |
| About me     | `#About`        |
| Projects     | `#Projects`     |
| Testimonials | `#Testimonials` |
| Contact      | `#Contact`      |

## Code

## =======

## 1. Gestion de l’état

```javascript
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

- `isMenuOpen` contrôle si le menu mobile est ouvert ou fermé.
- La fonction `setIsMenuOpen` est déclenchée par les clics sur le bouton hamburger ou sur la croix de fermeture.

**Comportement :**

- `false` → menu fermé.
- Clique sur le hamburger → `true` → menu mobile visible.
- Clique sur la croix ou un lien → `false` → menu se referme.

---

## 2. Structure du composant

### a) Logo

```jsx
<div className="text-3xl font-bold flex items-center">
  Logo
  <img ... />
</div>
```

- Texte "Logo" + icône décorative.
- Alignement horizontal avec `flex items-center`.

### b) Bouton hamburger (mobile)

- Visible uniquement sur mobile (`md:hidden`).
- Clique → ouvre le menu mobile plein écran.
- Disparaît lorsque le menu est ouvert, remplacé par la croix de fermeture.

### c) Menu responsive

- Affichage conditionnel (`isMenuOpen ? "flex" : "hidden"`).
- **Mobile** : `fixed inset-0`, fond semi-transparent (`bg-black/90`).
- **Desktop** : menu horizontal intégré (`md:flex-row`).

#### Bouton de fermeture (croix)

- Positionné en haut à droite sur mobile (`absolute top-5 right-5`).
- Ferme le menu au clic.

#### Liste de liens

- Vertical sur mobile, horizontal sur desktop.
- Clic → défilement fluide vers la section correspondante et fermeture du menu mobile.

#### Bouton d’action "Let's talk"

- Effet 3D simulé avec `border-b-4`.
- Positionnement dynamique selon l’écran (`mt-8` sur mobile, `md:mt-0` sur desktop).

---

## 3. Fonction de navigation fluide

```javascript
const scrollIntoSection = (href) => {
  setIsMenuOpen(false);
  const section = document.querySelector(href);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};
```

- Ferme le menu mobile après clic.
- Défilement fluide vers la section ciblée.
- `e.preventDefault()` empêche le comportement par défaut de l’ancre `<a>`.

---

## 4. Responsive Design et Tailwind CSS

- Classes utilitaires pour :

  - Espacement : `p-3`, `space-x-8`, `space-y-6`.
  - Typographie : `text-3xl`, `font-bold`, `font-medium`.
  - Couleurs et transitions : `hover:text-yellow-400`, `transition-all duration-200`.
  - Positionnement : `absolute`, `fixed`, `inset-0`, `top-5`, `right-5`.

- Mobile : overlay modale.
- Desktop : menu intégré en ligne.

---

## 5. Points forts

- Clarté et modularité.
- UX mobile-first.
- Navigation fluide.
- Styles modernes et transitions attractives.

---

## 6. Code complet

> > > > > > > e565d42 (components update)

```jsx
import React, { useState } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const Menu = [
    { name: "Skills", href: "#Skills" },
    { name: "Services", href: "#Services" },
    { name: "About me", href: "#About" },
    { name: "Projects", href: "#Projects" },
    { name: "Testimonials", href: "#Testimonials" },
    { name: "Contact", href: "#Contact" },
  ];

  const scrollIntoSection = (href) => {
    setIsMenuOpen(false);
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="z-20">
      <nav className="flex justify-center">
        <div className="flex items-center relative bg-white w-[90%] md:w-4/5 p-3 justify-between rounded-3xl shadow-md">
          {/* Logo */}
          <div className="text-3xl font-bold flex items-center">
            Logo
            <img
              src="https://img.icons8.com/material-outlined/24/F9E400/filled-circle--v1.png"
              alt="Filled circle"
              className="w-2 h-3 ml-2"
            />
          </div>

          {/* Bouton menu hamburger (mobile seulement) */}
          <div className="md:hidden z-30">
            {!isMenuOpen && (
              <button
                type="button"
                className="block focus:outline-none"
                onClick={() => setIsMenuOpen(true)}
              >
                <img
                  src="https://img.icons8.com/ios-filled/50/000000/menu--v1.png"
                  alt="menu"
                  width={40}
                  height={40}
                />
              </button>
            )}
          </div>

          {/* Menu responsive */}
          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } fixed inset-0 z-20 flex-col items-center justify-center bg-black/90
            md:static md:z-auto md:flex md:flex-row md:space-x-8 md:bg-transparent`}
          >
            {/* Bouton "croix" visible uniquement sur mobile */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-5 right-5 md:hidden"
            >
              <img
                src="https://img.icons8.com/ios-filled/50/ffffff/delete-sign.png"
                alt="close"
                width={35}
                height={35}
              />
            </button>

            <ul className="flex flex-col items-center space-y-6 md:flex-row md:space-x-8 md:space-y-0 font-medium">
              {Menu.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="block text-white md:text-black hover:text-yellow-400 transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollIntoSection(item.href);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <button className="mt-8 md:mt-0 bg-yellow-400 font-bold py-2 px-5 border border-b-4 border-black rounded-3xl hover:text-black hover:border-yellow-300">
              Let's talk
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
```
