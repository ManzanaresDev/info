# Composant UI : ProjectContainer (React)

## 📦 Description

Ce composant `ProjectContainer` est un conteneur réutilisable pour afficher des projets sous forme de grille.  
Il est conçu pour être simple, modulable et compatible avec un style sombre.

---

## 📁 Composant React

```jsx
// src/components/ui/ProjectContainer.jsx

import React from "react";
import "./projectContainer.css";

export default function ProjectContainer({ title, subtitle, children }) {
  return (
    <section className="project-container">
      <div className="project-container-header">
        {title && <h2 className="project-title">{title}</h2>}
        {subtitle && <p className="project-subtitle">{subtitle}</p>}
      </div>

      <div className="project-grid">{children}</div>
    </section>
  );
}
```

## 🧪 Exemple d’utilisation

```jsx
import ProjectContainer from "./components/ui/ProjectContainer";

export default function Page() {
  return (
    <ProjectContainer
      title="Mes projets"
      subtitle="Quelques réalisations récentes"
    >
      <div className="project-card">Projet 1</div>
      <div className="project-card">Projet 2</div>
      <div className="project-card">Projet 3</div>
    </ProjectContainer>
  );
}
```

## 🎨 CSS (style sombre)

```jsx
/* src/components/ui/projectContainer.css */

.project-container {
  padding: 40px;
  background: #0f0f0f;
  color: #ffffff;
  min-height: 100%;
}

.project-container-header {
  margin-bottom: 25px;
}

.project-title {
  font-size: 28px;
  margin: 0;
}

.project-subtitle {
  color: #aaaaaa;
  margin-top: 5px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

/* Carte projet */
.project-card {
  background: #1b1b1b;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  transition: 0.2s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  border-color: #444444;
}
```

## 🚀 Bonus (idées d’évolution)

- Ajouter une image de projet
- Ajouter des tags (React, Node, MongoDB…)
- Ajouter un bouton GitHub / Demo
- Ajouter des animations (Framer Motion)
- Ajouter un filtre par catégorie
