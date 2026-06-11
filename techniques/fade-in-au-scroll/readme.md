# 🎯 Fade-in au scroll (React + CSS Module)

## ✅ 1. Objectif

- Le texte apparaît quand il entre dans l’écran

- Animation fluide (fade + léger mouvement)

- Solution moderne avec Intersection Observer

- Performant et responsive

## 📦 2. Composant React

```javascript
import { useEffect, useRef, useState } from "react";
import styles from "./Box.module.css";

export default function Box() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target); // optionnel (animation une seule fois)
        }
      },
      {
        threshold: 0.3, // déclenche quand 30% visible
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <p ref={ref} className={`${styles.text} ${visible ? styles.show : ""}`}>
        Mon texte qui apparaît au scroll
      </p>
    </div>
  );
}
```

## 🎨 3. CSS Module (Box.module.css)

```javascript
.container {
  position: relative;
  height: 400px;
  border: 1px solid black;
}

/* état initial (caché) */
.text {
  position: absolute;
  top: 50%;
  left: 20%;

  opacity: 0;
  transform: translateY(-40%);
  transition: all 0.6s ease;
}

/* état visible */
.show {
  opacity: 1;
  transform: translateY(-50%);
}
```

### ✨ Résultat

**Le texte :**

- apparaît uniquement quand il entre dans le viewport 👀

- fade-in en douceur

- glisse légèrement vers sa position finale

- reste centré verticalement

### 🔥 Options utiles

👉 **Animation qui se rejoue (au lieu de “une seule fois”)**
Supprime cette ligne :

```javascript
observer.unobserve(entry.target);
```

### 👉 Déclencher plus tôt / plus tard

👉 **Animation qui se rejoue (au lieu de “une seule fois”)**
Supprime cette ligne :

```javascript
threshold: 0.1; // plus tôt
threshold: 0.7; // plus tard
```

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

---

## 🚀 Déplacer l'élément vers sa position finale

Le déplacement est géré par le `translateY` :

```css
/* État initial : légèrement au-dessus */
.text {
  opacity: 0;
  transform: translateY(-40%);
}

/* État final : descend vers sa position */
.show {
  opacity: 1;
  transform: translateY(-50%);
}
```

L'élément glisse de `-40%` à `-50%`, soit **10% vers le bas** pendant le fade-in.

### 🎛️ Jouer sur l'amplitude et la direction

**Venir du bas ↑**
```css
.text { opacity: 0; transform: translateY(30px); }
.show  { opacity: 1; transform: translateY(0); }
```

**Venir de la gauche →**
```css
.text { opacity: 0; transform: translateX(-30px); }
.show  { opacity: 1; transform: translateX(0); }
```

**Combo fade + slide propre (recommandé)**
```css
.text { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
.show  { opacity: 1; transform: translate(-50%, -50%); }
```

> 💡 Plus la différence entre les deux `transform` est grande, plus le glissement est prononcé.  
> `20px` → effet subtil · `60px` → effet plus dramatique
