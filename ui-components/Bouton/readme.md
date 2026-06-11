# 🧩 Button Component – Gestion texte + icône

Ce document décrit **l’API recommandée** et les **règles de conception** pour un composant `Button` capable de gérer :

- bouton texte
- bouton icône seule
- bouton texte + icône (gauche / droite)

Objectif : **API claire, cohérente, maintenable**.

---

## 🎯 Objectifs fonctionnels

Le composant `Button` doit permettre :

- ✔️ un bouton **texte seul**
- ✔️ un bouton **icône seule** (circulaire)
- ✔️ un bouton **texte + icône**
  - icône à gauche
  - icône à droite
- ✔️ un comportement clair selon le `variant`

---

## 🧱 API du composant

### Props

```ts
interface Props {
  size?: "small" | "medium" | "large";
  variant?: "accent" | "secondary" | "outline" | "disable" | "ico";
  icon?: IconType;
  iconPosition?: "left" | "right";
  iconTheme?: "accent" | "secondary" | "gray";
  disabled?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}
```

---

## 🧠 Règles de comportement (IMPORTANT)

| Cas | Comportement attendu |
|---|---|
| `variant === "ico"` | Icône seule, bouton circulaire |
| `variant === "ico"` | ❌ pas de texte (`children` ignoré) |
| `variant === "ico"` | ❌ pas de `gap` |
| `variant !== "ico"` + `icon` | Icône + texte |
| `iconPosition="left"` | Icône avant le texte |
| `iconPosition="right"` | Icône après le texte |
| `isLoading === true` | Contenu masqué, spinner centré |

---

## 🧩 Structure JSX recommandée

### Conteneur du bouton

```tsx
<button
  type="button"
  disabled={disabled}
  className={clsx(
    "relative flex items-center justify-center",
    variantStyle,
    sizeStyle,
    isLoading && "cursor-wait"
  )}
>
```

---

### Contenu interne

```tsx
<div
  className={clsx(
    isLoading && "invisible",
    "flex items-center",
    variant !== "ico" && icon && "gap-2",
    variant === "ico" && "justify-center"
  )}
>
  {icon && variant !== "ico" && iconPosition === "left" && (
    <icon.icon size={icoSize} />
  )}

  {variant !== "ico" && children}

  {icon && variant !== "ico" && iconPosition === "right" && (
    <icon.icon size={icoSize} />
  )}

  {icon && variant === "ico" && <icon.icon size={icoSize} />}
</div>
```

---

## 📏 Gestion des tailles (rappel)

Pour un bouton **icône ronde** :

- ❌ PAS de `padding`
- ✅ `width === height`
- ✅ `rounded-full`

Exemple :

```ts
variant === "ico" ? "w-10 h-10 rounded-full" : "py-3 px-4"
```

---

## 🧪 Exemples d’utilisation

### Bouton texte simple
```tsx
<Button>Envoyer</Button>
```

### Texte + icône à gauche
```tsx
<Button icon={{ icon: RiMailLine }} iconPosition="left">
  Contact
</Button>
```

### Texte + icône à droite
```tsx
<Button icon={{ icon: RiArrowRightLine }} iconPosition="right">
  Suivant
</Button>
```

### Icône seule (réseaux sociaux)
```tsx
<Button
  variant="ico"
  icon={{ icon: RiFacebookBoxFill }}
  iconTheme="gray"
/>
```

---

## 🧠 Bonnes pratiques

- ✅ Toute la logique visuelle vit dans `Button`
- ❌ Aucun contournement dans les composants parents
- ✅ Une API = un comportement prévisible
- ✅ Facile à documenter, tester et maintenir

---

## 🚀 Évolutions possibles

- Discriminated union TypeScript (`variant === "ico"`)
- Tooltip automatique pour boutons icônes
- `aria-label` obligatoire pour accessibilité
- Animation hover dédiée aux boutons `ico`
