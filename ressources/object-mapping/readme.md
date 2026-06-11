# Mapping typé avec fonctions (React + TypeScript)

Ce document montre comment implémenter un **objet de mapping** utilisant la syntaxe `[clé]: valeur`, avec **fonctions**, **JSX** et **TypeScript**.

---

## 1. Types

```ts
export type UrlType = "internal" | "external" | "disabled";

export interface MenuElement {
  name: string;
  url: string;
  urlType: UrlType;
}
```

---

## 2. Objet de mapping (fonctions typées)

```tsx
import ActivableLink from "@/components/ActivableLink";
import { MenuElement, UrlType } from "./types";

type LinkRenderer = (elem: MenuElement) => JSX.Element;

export const linkMapping: Record<UrlType, LinkRenderer> = {
  internal: (elem) => (
    <ActivableLink href={elem.url}>
      {elem.name}
    </ActivableLink>
  ),

  external: (elem) => (
    <a
      href={elem.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {elem.name}
    </a>
  ),

  disabled: (elem) => (
    <span className="opacity-50 cursor-not-allowed">
      {elem.name}
    </span>
  ),
};
```

---

## 3. Utilisation dans un composant

```tsx
import Typography from "@/components/Typography";
import { MenuElement } from "./types";
import { linkMapping } from "./linkMapping";

interface Props {
  elem: MenuElement;
}

export default function MenuItem({ elem }: Props) {
  return (
    <Typography
      variant="caption3"
      theme="gray"
      weight="medium"
      className="space-y-4"
    >
      {linkMapping[elem.urlType](elem)}
    </Typography>
  );
}
```

---

## 4. Variante sécurisée (fallback)

```tsx
const renderLink = linkMapping[elem.urlType];

{renderLink ? renderLink(elem) : null}
```

---

## Avantages

- typage strict (`Record<UrlType, ...>`)
- aucun `if`, `switch` ou ternaire
- extensible facilement
- lisible et maintenable

---

Ce pattern est idéal pour les menus, actions conditionnelles, permissions ou rendus dynamiques complexes.

