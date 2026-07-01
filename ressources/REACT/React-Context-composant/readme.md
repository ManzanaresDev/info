# Manuel — Le Context React

## À quoi ça sert ?

Le **Context** résout le problème du **prop drilling** : sans lui, pour passer une donnée d'un composant parent à un enfant profondément imbriqué, tu dois faire transiter cette donnée à travers *tous* les composants intermédiaires, même ceux qui n'en ont pas besoin.

Le context permet de rendre une donnée globale accessible à n'importe quel composant de l'arbre, sans aucun prop.

```
Sans context (prop drilling) :
<App user={user}>
  <Layout user={user}>        ← n'en a pas besoin
    <Sidebar user={user}>     ← n'en a pas besoin
      <Avatar user={user} />  ← seul celui-ci en a besoin
    </Sidebar>
  </Layout>
</App>

Avec context :
<UserProvider>
  <App>
    <Layout>
      <Sidebar>
        <Avatar />  ← useUser() ✅ accès direct, sans aucun prop
      </Sidebar>
    </Layout>
  </App>
</UserProvider>
```

---

## Les 4 étapes pour construire un context

### Étape 1 — Créer le context

```tsx
// src/context/ThemeContext.tsx
import { createContext } from "react";

// On définit la forme des données et leurs valeurs par défaut
export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});
```

> `createContext()` prend en argument la valeur *par défaut*, utilisée uniquement si un composant consomme le context sans avoir de Provider parent.

---

### Étape 2 — Créer le Provider

Le Provider est un composant qui **enveloppe** une partie de l'arbre et injecte la valeur réelle dans le context.

```tsx
// src/context/ThemeContext.tsx
import { createContext, useState, useContext } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

// Le Provider gère l'état et expose les données
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personnalisé pour consommer le context proprement
export const useTheme = () => useContext(ThemeContext);
```

---

### Étape 3 — Brancher le Provider dans l'app

Le Provider doit **englober** tous les composants qui auront besoin du context. On le place généralement au niveau le plus haut possible.

```tsx
// src/main.tsx (ou _app.tsx sous Next.js)
import { ThemeProvider } from "@/context/ThemeContext";
import App from "./App";

export default function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

---

### Étape 4 — Consommer le context dans n'importe quel composant

```tsx
// src/components/Header.tsx
import { useTheme } from "@/context/ThemeContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{ background: theme === "light" ? "#fff" : "#222" }}>
      <h1>Mon App</h1>
      <button onClick={toggleTheme}>
        Passer en mode {theme === "light" ? "sombre" : "clair"}
      </button>
    </header>
  );
}
```

Pas besoin de prop, peu importe la profondeur du composant dans l'arbre.

---

## Patterns avancés

### Séparer la logique dans un hook personnalisé

C'est le pattern utilisé avec `useFirebaseAuth`. La logique complexe vit dans le hook, le context ne fait que la distribuer.

```tsx
// src/hooks/useThemeLogic.ts
function useThemeLogic() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () =>
    setTheme((p) => (p === "light" ? "dark" : "light"));
  return { theme, toggleTheme };
}

// src/context/ThemeContext.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeLogic = useThemeLogic(); // toute la logique est ici

  return (
    <ThemeContext.Provider value={themeLogic}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

### Typer le context avec TypeScript (recommandé)

```tsx
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// On initialise à undefined pour forcer l'usage dans un Provider
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Le hook lève une erreur explicite si le Provider est manquant
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  return ctx;
}
```

> C'est la technique la plus robuste : elle signale immédiatement si quelqu'un oublie d'ajouter le Provider.

---

### Combiner plusieurs contexts

```tsx
// src/main.tsx
export default function Root() {
  return (
    <AuthUserProvider>
      <ThemeProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </AuthUserProvider>
  );
}
```

Chaque context est indépendant et ne gère qu'une seule responsabilité.

---

## Exemple complet — Context d'authentification

Exemple proche de ton code `authUserProvider.tsx` :

```tsx
// src/context/AuthContext.tsx
import { createContext, useContext } from "react";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import { UserDocument } from "@/types/user";

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  phoneNumber: string;
  photoURL: string;
  userDocument: UserDocument;
}

interface AuthContextType {
  authUser: AuthUser;
  authUserIsLoading: boolean;
}

const init: AuthUser = {
  uid: "",
  email: "",
  displayName: "",
  emailVerified: false,
  phoneNumber: "",
  photoURL: "",
  userDocument: {} as UserDocument,
};

const AuthContext = createContext<AuthContextType>({
  authUser: init,
  authUserIsLoading: true,
});

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();

  return (
    <AuthContext.Provider
      value={{
        authUser: auth.authUser as AuthUser,
        authUserIsLoading: auth.authUserIsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Utilisation dans un composant :

```tsx
// src/components/ProfileMenu.tsx
import { useAuth } from "@/context/AuthContext";

export function ProfileMenu() {
  const { authUser, authUserIsLoading } = useAuth();

  if (authUserIsLoading) return <p>Chargement...</p>;

  return (
    <div>
      <img src={authUser.photoURL} alt="avatar" />
      <span>{authUser.displayName}</span>
    </div>
  );
}
```

---

## Résumé

| Concept | Rôle |
|---|---|
| `createContext()` | Crée le context avec une valeur par défaut |
| `<Context.Provider value={...}>` | Injecte la valeur réelle dans l'arbre |
| `useContext(Context)` | Consomme la valeur depuis n'importe quel composant enfant |
| Hook personnalisé (`useAuth`, `useTheme`) | Encapsule `useContext` pour une API plus propre |

> En résumé, le context est une **variable globale mais sûre et réactive** : quand sa valeur change, tous les composants qui la consomment se re-rendent automatiquement.
