# UUID v4 — Quand l’utiliser, quand l’éviter, alternatives

Ce document explique **quand utiliser UUID v4**, **quand l’éviter**, et **quelles alternatives modernes privilégier** selon le contexte (React, frontend, backend).

---

## ❌ Quand NE PAS utiliser UUID v4

### 1. Clés React (`key`)

```jsx
{items.map(item => (
  <Component key={uuidv4()} /> // ❌
))}
```

**Problème**
- nouvelle clé à chaque render
- React démonte et remonte les composants
- perte d’état interne
- performances dégradées

✅ **À la place**
```jsx
key={item.id}
```

---

### 2. Données persistées côté backend

- UUID v4 est long
- indexes SQL moins efficaces
- inutile si la base gère déjà un identifiant

✅ **Alternatives**
- auto-increment (SQL)
- `ObjectId` (MongoDB)
- `ULID` si l’ordre chronologique est requis

---

### 3. Génération frontend pour données « officielles »

- collisions théoriquement possibles
- aucune garantie serveur

✅ Générer les identifiants côté backend.

---

## ✅ Quand UUID v4 est pertinent

- IDs temporaires (optimistic UI)
- clés de formulaires dynamiques
- mocks et tests
- corrélation de logs
- identifiants locaux non persistés

---

## 🔥 Alternatives modernes recommandées

### 🥇 `crypto.randomUUID()` (natif)

```js
const id = crypto.randomUUID();
```

✔ natif
✔ rapide
✔ sécurisé
✔ aucune dépendance

> Supporté par Node.js ≥ 16 et navigateurs modernes

---

### 🥈 `nanoid` (frontend)

```bash
npm i nanoid
```

```js
import { nanoid } from "nanoid";
const id = nanoid();
```

✔ très court
✔ très rapide
✔ idéal pour React

---

### 🥉 `ULID`

```bash
npm i ulid
```

- triable chronologiquement
- lisible
- plus verbeux que `nanoid`

---

## 🧠 Règle simple

| Cas | Solution |
|----|---------|
| Clé React | ID stable existant |
| Temporaire UI | `nanoid` |
| Backend | ID base de données |
| Usage général moderne | `crypto.randomUUID()` |

---

Ce document peut être utilisé comme **référence projet**, **annexe technique** ou **guide d’équipe**.

