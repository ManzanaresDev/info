# 🎨 Manuel professionnel d’utilisation des fonts en design web

## 📌 Introduction

La typographie est un pilier fondamental du design web. Elle influence la lisibilité, l’expérience utilisateur, l’identité de marque et même les performances. Une mauvaise utilisation des polices peut nuire à la compréhension, tandis qu’une bonne hiérarchie typographique guide naturellement l’utilisateur.

---

## 🧠 1. Comprendre les types de fonts

### 🔹 Serif

- Avec empattements (petites extensions aux extrémités)
- Style classique, sérieux, éditorial
- Exemples : Times New Roman, Georgia

### 🔹 Sans-serif

- Sans empattements
- Moderne, propre, très lisible à l’écran
- Exemples : Arial, Helvetica, Inter

### 🔹 Monospace

- Chaque caractère a la même largeur
- Utilisé pour le code
- Exemples : Courier New, Fira Code

### 🔹 Display / Decorative

- Fonts stylisées pour titres uniquement
- À utiliser avec parcimonie

---

## 📏 2. Hiérarchie typographique

Créer une structure claire :

```text
H1 → Titre principal (32px - 48px)
H2 → Sous-titre (24px - 32px)
H3 → Section (18px - 24px)
Body → Texte (14px - 18px)
Caption → Légendes (12px - 14px)
```

**Bonnes pratiques**:
-Maximum 2 à 3 fonts par projet
-Utiliser font-weight plutôt que multiplier les polices
-Créer un contraste visuel clair

## 🔠 3. Lisibilité et accessibilité

### ✔️ Règles essentielles :

- Taille minimum : 16px pour le body
- Line-height : 1.4 à 1.7
- Contraste élevé (WCAG recommandé)
- Éviter les textes en MAJUSCULES pour les paragraphes

### ❌ À éviter :

- Fonts trop fines (thin)
- Texte gris clair sur fond blanc
- Longues lignes (> 75 caractères)
- Créer une structure claire :

## 🎯 4. Choisir une font professionnelle

**Critères** :

- Lisibilité
- Compatibilité web
- Performance
- Image de marque
  **Fonts recommandées** :
- Inter → moderne, UI
- Roboto → polyvalente
- Open Sans → lisible
- Montserrat → titres élégants
- Poppins → design moderne

## ⚙️ 5. Intégration web

### 🔹 Google Fonts (rapide)

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap"
  rel="stylesheet"
/>
```

### 🔹 CSS

```css
body {
  font-family: "Inter", sans-serif;
}
```

## 🚀 6. Performance

**Bonnes pratiques** :

- Charger uniquement les poids nécessaires
- Utiliser font-display: swap
- Préférer .woff2

```css
@font-face {
  font-family: "CustomFont";
  src: url("/fonts/font.woff2") format("woff2");
  font-display: swap;
}
```

## 📐 7. Espacement (très important)

**Letter-spacing :s** :

- Titres : +1px à +3px (souvent en uppercase)
- Texte : normal

**Line-height** :

```css
body {
  line-height: 1.6;
}
```

## 🌙 8. Typographie et UI moderne

**Dark mode :** :

- Éviter le blanc pur (#FFF)
- Préférer #EAEAEA ou #DDD

## 🎨 9. Combinaisons efficaces

```text
Inter + Playfair Display
Roboto + Montserrat
Poppins + Open Sans
```

## 🧪 10. Tests et validation

**À tester :** :

- Mobile / Desktop
- Résolutions différentes
- Accessibilité (contrast checker)

**Outils** :

- Google Lighthouse
- Figma
- Chrome DevTools

## 📋 11. Checklist finale

```text
✔ Lisibilité correcte
✔ Hiérarchie claire
✔ Maximum 2-3 fonts
✔ Chargement optimisé
✔ Responsive OK
✔ Contraste accessible
✔ Cohérence design respectée
```

## 🧩 Conclusion

Une bonne typographie ne se remarque pas… mais une mauvaise, immédiatement.
Le but est de guider l’utilisateur sans qu’il en ait conscience, tout en renforçant l’identité visuelle.

👉 Simplicité, cohérence, lisibilité : les 3 règles d’or.
