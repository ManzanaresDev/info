# Composant `HomeButton`

Le composant `HomeButton` est un composant réutilisable permettant d’afficher un bouton de navigation dans l’application.

Il est généralement utilisé dans les sections importantes du site comme :

- le Hero
- les cartes de services
- les CTA (Call To Action)
- les pages de réservation
- les sections promotionnelles

---

# Objectif du composant

Le but principal de `HomeButton` est de :

- centraliser le style des boutons
- éviter la duplication de code
- faciliter la maintenance
- garantir une cohérence visuelle dans toute l’application

---

# Fonctionnement général

Le composant reçoit des propriétés (`props`) permettant de personnaliser :

| Propriété   | Description                                   |
| ----------- | --------------------------------------------- |
| `href`      | URL de destination                            |
| `children`  | Texte ou contenu du bouton                    |
| `className` | Classes CSS supplémentaires                   |
| `variant`   | Variante visuelle du bouton                   |
| `target`    | Ouverture dans un nouvel onglet si nécessaire |

---

# Exemple simplifié

```tsx
import Link from "next/link";

interface HomeButtonProps {
  href: string;
  children: React.ReactNode;
}

export function HomeButton({ href, children }: HomeButtonProps) {
  return (
    <Link href={href} className="button">
      {children}
    </Link>
  );
}
```

# Explication détaillée

Importation de Link

```javascript
import Link from "next/link";
```

Le composant Link de Next.js permet :

- une navigation rapide
- le préchargement des pages
- une meilleure performance
- une navigation sans rechargement complet

## Interface TypeScript

```javascript
interface HomeButtonProps {
  href: string;
  children: React.ReactNode;
}
```

Cette interface définit les propriétés attendues par le composant.

href

```javascript
href: string;
```

Correspond au lien de destination.

Exemple :

```javascript
href = "/services";
```

children;

```javascript
children: React.ReactNode;
```

Représente le contenu affiché dans le bouton.

## Retour JSX

```javascript
return (
  <Link href={href} className="button">
    {children}
  </Link>
);
```

Le composant retourne :

- un lien Next.js
- stylisé comme un bouton
- contenant le texte transmis via children

## Avantages de cette approche

Réutilisabilité

Le composant peut être utilisé partout :

```javascript
<HomeButton href="/about">À propos</HomeButton>
```

## Maintenance simplifiée

Si le style du bouton change :

```javascript
className = "button";
```

une seule modification met à jour tous les boutons du site.

## Cohérence visuelle

Tous les boutons partagent :

- les mêmes couleurs
- les mêmes animations
- les mêmes espacements
- les mêmes comportements

## Optimisations possibles

### Ajouter des variantes

Exemple :

```javascript
variant = "primary";
variant = "secondary";
variant = "outline";
```

### Ajouter des icônes

Exemple avec FontAwesome :

```javascript
<HomeButton href="/booking">Réserver →</HomeButton>
```

### Ajouter un état loading

Exemple :

```javascript
loading={true}
```

pour afficher un spinner pendant une action.

## Conclusion

Le composant HomeButton améliore :

- la structure du projet
- la lisibilité du code
- la réutilisation des composants
- la cohérence du design
- la maintenabilité globale de l’application
