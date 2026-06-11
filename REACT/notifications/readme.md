# 🔔 Notifications avec React-Toastify

React-Toastify permet d'afficher facilement des notifications (succès, erreur, info…) dans une application React.

---

## 📦 Installation

```bash
npm install react-toastify
```

ou

```bash
yarn add react-toastify
```

---

## 🧩 Mise en place globale (une seule fois)

Dans ton fichier principal (souvent `main.jsx` ou `App.jsx`) :

```jsx
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      {/* Le conteneur doit être présent une seule fois */}
      <ToastContainer />
      {/* Le reste de ton application */}
    </>
  );
}

export default App;
```

---

## 🚀 Utilisation dans un composant

```jsx
import { toast } from "react-toastify";

function ExampleComponent() {
  const handleSuccess = () => {
    toast.success("Utilisateur créé avec succès !");
  };

  const handleError = () => {
    toast.error("Une erreur est survenue.");
  };

  const handleInfo = () => {
    toast.info("Voici une information importante.");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Succès</button>
      <button onClick={handleError}>Erreur</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}

export default ExampleComponent;
```

---

## 🎛️ Options personnalisées

```jsx
toast.success("Sauvegarde effectuée !", {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
});
```

---

## 🎨 Types de notifications disponibles

| Type | Méthode |
|------|---------|
| Succès | `toast.success()` |
| Erreur | `toast.error()` |
| Info | `toast.info()` |
| Avertissement | `toast.warning()` |
| Défaut | `toast()` |

---

## 🧠 Bonnes pratiques

✔ Mettre `<ToastContainer />` **une seule fois** dans l'app  
✔ Utiliser les toasts pour les retours utilisateur (API, formulaires, actions)  
❌ Ne pas spammer les notifications  

---

React-Toastify est parfait pour améliorer l’UX avec très peu de code ✨
