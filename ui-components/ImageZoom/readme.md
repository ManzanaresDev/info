# Composant ImageZoom — Explication détaillée

## Rôle du composant

`ImageZoom` affiche une image avec deux fonctionnalités :
- **Zoom au survol de la souris** (desktop) — l'image suit le curseur
- **Pinch to zoom** (mobile) — zoom avec deux doigts + déplacement avec un doigt

---

## Structure générale

```tsx
export default function ImageZoom({ src, alt }: Props) {
  // ...
}
```

Le composant reçoit deux props : `src` (l'URL de l'image) et `alt` (le texte alternatif).

---

## Les états et références

```tsx
const containerRef = useRef<HTMLDivElement>(null);
```
Référence vers le `<div>` conteneur. Elle permet de récupérer sa position et ses dimensions dans la page via `getBoundingClientRect()` — indispensable pour calculer où se trouve le curseur **relativement** à l'image.

```tsx
const [scale, setScale] = useState(1);
```
Niveau de zoom actuel. `1` = taille normale, `4` = zoom maximum (défini plus bas). Utilisé pour calculer la taille de l'image en arrière-plan (`backgroundSize`).

```tsx
const [position, setPosition] = useState({ x: 50, y: 50 });
```
Position du point de focus en pourcentage (0–100). `{ x: 50, y: 50 }` = centre de l'image. Utilisé pour `backgroundPosition`, ce qui donne l'effet de loupe.

```tsx
const lastTouchDistance = useRef<number | null>(null);
```
Mémorise la distance entre les deux doigts au dernier événement tactile. Permet de calculer le **delta** (variation) entre deux positions successives pour déterminer si l'utilisateur écarte ou rapproche les doigts.

---

## Zoom souris — `handleMouseMove`

```tsx
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;

  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  setPosition({ x, y });
};
```

À chaque mouvement de souris sur le conteneur :

1. `getBoundingClientRect()` récupère les coordonnées du conteneur dans la fenêtre (`rect.left`, `rect.top`, `rect.width`, `rect.height`)
2. `e.clientX - rect.left` = position du curseur **à l'intérieur** du conteneur en pixels
3. On divise par la largeur puis multiplie par 100 pour obtenir un **pourcentage**
4. Ce pourcentage est passé à `backgroundPosition` — CSS déplace alors l'image pour que la zone sous le curseur soit toujours visible

**Exemple :** si le curseur est à 75% de la largeur du conteneur, `backgroundPosition: 75%` décale l'image pour montrer la partie droite.

---

## Calcul de distance entre deux doigts — `getDistance`

```tsx
const getDistance = (touches: React.TouchList) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};
```

Calcule la distance euclidienne (théorème de Pythagore) entre les deux points de contact. Quand cette distance **augmente**, l'utilisateur écarte les doigts → zoom avant. Quand elle **diminue**, il les rapproche → zoom arrière.

---

## Zoom tactile — `handleTouchMove`

```tsx
const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;

  // Pinch zoom — 2 doigts
  if (e.touches.length === 2) {
    const distance = getDistance(e.touches);

    if (lastTouchDistance.current) {
      const delta = distance - lastTouchDistance.current;
      setScale((prev) => Math.min(Math.max(prev + delta * 0.01, 1), 4));
    }

    lastTouchDistance.current = distance;
  }

  // Déplacement — 1 doigt (seulement si zoomé)
  if (e.touches.length === 1 && scale > 1) {
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }
};
```

**Bloc 2 doigts (pinch zoom) :**

- Calcule la distance actuelle entre les deux doigts
- Compare avec `lastTouchDistance.current` (distance au mouvement précédent)
- `delta` = différence → positif si on écarte, négatif si on rapproche
- `delta * 0.01` adoucit la sensibilité du zoom
- `Math.max(..., 1)` empêche de dézoomer en dessous de la taille normale
- `Math.min(..., 4)` bloque le zoom à 4x maximum
- Sauvegarde la distance actuelle pour le prochain événement

**Bloc 1 doigt (déplacement) :**

- Ne fonctionne que si `scale > 1` (inutile de se déplacer si l'image n'est pas zoomée)
- Même logique que `handleMouseMove` — calcule la position en pourcentage

```tsx
const handleTouchEnd = () => {
  lastTouchDistance.current = null;
};
```

Remet à zéro la distance mémorisée quand les doigts quittent l'écran, pour éviter un saut brutal au prochain pinch.

---

## Le rendu — style CSS dynamique

```tsx
<div
  style={{
    backgroundImage: `url(${src})`,
    backgroundPosition: `${position.x}% ${position.y}%`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${scale * 100}%`,
    width: "100%",
    height: "60vh",
    borderRadius: "10px",
    overflow: "hidden",
    touchAction: "none",
    cursor: scale > 1 ? "grab" : "zoom-in",
    transition: "background-size 0.1s ease",
  }}
>
```

| Propriété CSS | Rôle |
|---|---|
| `backgroundImage` | L'image est affichée en fond pour pouvoir être repositionnée librement |
| `backgroundPosition` | Déplace l'image selon la position du curseur ou du doigt |
| `backgroundSize: scale * 100%` | `scale=1` → `100%` (normal), `scale=2` → `200%` (zoom x2) |
| `backgroundRepeat: no-repeat` | Évite que l'image se répète quand elle est plus petite que le conteneur |
| `overflow: hidden` | Masque les parties de l'image qui débordent du conteneur |
| `touchAction: none` | Désactive le comportement tactile natif du navigateur (scroll, zoom page) pour que les événements touch soient gérés par React |
| `cursor` | Affiche `zoom-in` par défaut et `grab` quand l'image est zoomée |
| `transition` | Adoucit les changements de taille au zoom |

```tsx
<img
  src={src}
  alt={alt}
  style={{ width: "100%", height: "80%", objectFit: "cover", opacity: 0 }}
/>
```

L'image `<img>` est **invisible** (`opacity: 0`) — elle sert uniquement à occuper l'espace dans le DOM pour que le conteneur ait une hauteur naturelle, et pour que les lecteurs d'écran puissent lire le texte `alt`.

---

## Résumé du flux

```
Mouvement souris / doigt
       ↓
Calcul de la position en % dans le conteneur
       ↓
setPosition({ x, y })
       ↓
backgroundPosition mis à jour → l'image suit le curseur

Pinch (2 doigts)
       ↓
Calcul du delta de distance
       ↓
setScale(prev + delta * 0.01) — entre 1 et 4
       ↓
backgroundSize mis à jour → l'image s'agrandit ou rétrécit
```
