# 📡 Création d'un template NEXTJS reusitisable

---

## 🧱 1. Structure PRO d’un template

Voici une base que tu peux réutiliser sur tous tes projets :

```typescript
src/
 ├── components/       # composants UI réutilisables
 │    ├── ui/          # boutons, inputs, cards
 │    ├── layout/      # navbar, sidebar, footer
 │
 ├── pages/            # pages de l'app
 │
 ├── services/         # appels API
 │
 ├── hooks/            # hooks personnalisés
 │
 ├── context/          # auth, global state
 │
 ├── utils/            # fonctions helpers
 │
 ├── styles/           # CSS global
 │
 └── App.jsx
```

👉 **Si ton projet respecte ça → il devient réutilisable immédiatement**

## 🧩 2. Créer des composants vraiment réutilisables

Un composant réutilisable doit être :

- configurable
- indépendant
- sans logique métier spécifique

### Exemple 🔥 bouton réutilisable

```typescript
export default function Button({ text, onClick, type = "primary" }) {
 return (
   <button
     className={`btn ${type === "primary" ? "btn-primary" : "btn-secondary"}`}
     onClick={onClick}
   >
     {text}
   </button>
 );
}
```

👉 **Utilisable partout :**

```typescript
<Button text="Supprimer" type="secondary" onClick={handleDelete} />
<Button text="Valider" onClick={handleSubmit} />
```

### Exemple 🔥 Input générique

```typescript
export default function Input({ label, type, value, onChange }) {
  return (
    <div className="mb-3">
      <label>{label}</label>
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
```

## ⚙️ 3. Hooks personnalisés (clé du niveau supérieur)

Un template propre contient des hooks réutilisables.

### Exemple 🔥 useFetch

```typescript
import { useEffect, useState } from "react";

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
}
```

👉 **Utilisation :**

```typescript
const { data, loading } = useFetch("/api/tasks");
```

## 4. Template avec Auth intégrée (TRÈS IMPORTANT)

Vu ton niveau, tu dois intégrer directement :

- gestion des tokens
- contexte global

### Exemple structure auth

```typescript
context/
 └── AuthContext.jsx
```

```typescript
import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 🧩 5. Layout réutilisable

Tu dois avoir un layout unique :

```typescript
export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        {children}
      </div>
    </>
  );
}
```

## 🔁 6. Ce qui rend TON template puissant

Un bon template React doit inclure :

- ✅ Auth prête
- ✅ API centralisée (services/api.js)
- ✅ Composants UI génériques
- ✅ Layout global
- ✅ Gestion loading / error
- ✅ Structure claire

## 🚀 7. Ton objectif concret

Crée TON template perso :

Nom :

```bash
react-template-pro
```

- Puis réutilise-le pour :
- TaskManager
- Veilink
- futurs projets

### ⚠️ Le vrai conseil (important)

Ne tombe pas dans ce piège :

- ❌ Copier des templates
- ❌ Faire du design sans structure
- ❌ Mélanger logique + UI

👉 Ton template doit être simple mais propre

### 🧠 Niveau supérieur (quand tu seras prêt)

Ensuite tu pourras ajouter :

- routing avancé (ProtectedRoute)
- gestion des rôles
- système de notifications global
- thème sombre (cohérent avec ton style)
