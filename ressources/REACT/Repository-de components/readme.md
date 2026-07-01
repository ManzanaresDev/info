# 🧩 Manuel rapide — shadcn/ui (React)

## 1. ⚙️ C’est quoi ?

**shadcn/ui**, ce n’est pas une librairie classique.

👉 Tu copies les composants directement dans ton projet  
👉 Tu peux les modifier librement

✔ Basé sur :
- React
- Tailwind CSS
- Radix UI

---

## 2. 🚀 Installation rapide

```bash
npx shadcn-ui@latest init
```

Ajouter un composant :

```bash
npx shadcn-ui@latest add button
```

---

## 3. 🧱 Utilisation basique

```jsx
import { Button } from "@/components/ui/button"

export default function App() {
  return <Button>Cliquer ici</Button>
}
```

---

## 4. 🎨 Modifier un composant

Modifier directement :

```jsx
// components/ui/button.jsx
className="bg-red-500 hover:bg-red-700"
```

---

## 5. 📦 Ajouter d’autres composants

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

---

## 6. 🧠 Bonnes pratiques

Structure :

```
/components/ui/
/components/custom/
```

---

## 7. 💡 Exemple Card

```jsx
import { Card, CardContent } from "@/components/ui/card"

export default function Example() {
  return (
    <Card>
      <CardContent>Hello world</CardContent>
    </Card>
  )
}
```

---

## 8. ⚠️ Pièges fréquents

- Oublier Tailwind
- Mauvais alias @/
- Dépendances manquantes

---

## 🧾 Résumé

✔ Composants copiés  
✔ 100% personnalisables  
✔ Design moderne
