# 🎨 Trois façons de styliser un composant React

Voici trois méthodes principales pour appliquer du style dans une application **React** :

---

## 1️⃣ Style inline avec un objet `style`

Méthode simple et rapide :

```jsx
// App.jsx
export default function App() {
  const buttonStyle = {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1 style={{ color: "#333" }}>Style inline avec objet</h1>
      <button style={buttonStyle}>Clique-moi</button>
    </div>
  );
}
```

✅ **Avantage** : rapide à utiliser  
❌ **Inconvénient** : pas de `:hover` ou de media queries  

---

## 2️⃣ Utilisation de **CSS Modules**

Fichiers CSS isolés pour chaque composant.

**`App.module.css`**
```css
.container {
  text-align: center;
  margin-top: 40px;
}

.title {
  color: #333;
}

.button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.button:hover {
  background-color: #218838;
}
```

**`App.jsx`**
```jsx
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Style avec CSS Modules</h1>
      <button className={styles.button}>Clique-moi</button>
    </div>
  );
}
```

✅ **Avantage** : classes locales (pas de conflits)  
❌ **Inconvénient** : nécessite un bundler comme Vite ou CRA  

---

## 3️⃣ Utilisation de **styled-components**

Approche "CSS-in-JS" moderne et dynamique.

### Installation
```bash
npm install styled-components
```

**`App.jsx`**
```jsx
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const Title = styled.h1`
  color: #333;
`;

const Button = styled.button`
  background-color: #ff5733;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #e04e2e;
  }
`;

export default function App() {
  return (
    <Container>
      <Title>Style avec styled-components</Title>
      <Button>Clique-moi</Button>
    </Container>
  );
}
```

✅ **Avantage** : styles dynamiques, parfait pour les thèmes  
❌ **Inconvénient** : dépendance supplémentaire

---

💡 Ces trois méthodes peuvent être combinées selon les besoins de ton projet React.
