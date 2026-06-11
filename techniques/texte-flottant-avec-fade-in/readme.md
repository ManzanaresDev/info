# 🎯 Texte flottant avec fade-in en React (CSS Module)

## ✅ 1. Objectif

Texte en position: absolute

- Centré verticalement

- Position horizontale libre

- Effet fade-in

- Compatible responsive

## 📦 2. Composant React

```javascript
import { useEffect, useState } from "react";
import styles from "./Box.module.css";

export default function Box() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className={styles.container}>
      <p className={`${styles.text} ${visible ? styles.show : ""}`}>
        Mon texte
      </p>
    </div>
  );
}
```

## 🎨 3. CSS Module (Box.module.css)

```javascript
.container {
  position: relative;
  height: 200px;
  border: 1px solid black;
}

/* Texte flottant */
.text {
  position: absolute;
  top: 50%;
  left: 20%; /* 👉 modifiable (px, %, clamp...) */

  opacity: 0;
  transform: translateY(-40%);
  transition: all 0.6s ease;
}

/* État visible */
.show {
  opacity: 1;
  transform: translateY(-50%);
}
```

### ✨ Résultat

Le texte :

- apparaît progressivement (fade-in)

- glisse légèrement vers sa position finale

- reste centré verticalement

- peut être déplacé horizontalement facilemen

### 🔥 Astuces

```css
left: 10%;
```

ou

```css
left: clamp(10px, 5vw, 100px);
```

### 👉 Ajouter un délai

```css
.text {
  transition: all 0.6s ease;
  transition-delay: 0.3s;
}
```
