# Clés React (`key`) — Listes dynamiques, suppression et réordonnancement

Ce document explique **quelle option utiliser pour les `key` React** lorsque les éléments d’une liste peuvent être **supprimés**, **ajoutés** ou **réordonnés**.

---

## 🎯 Rôle d’une `key`

Une `key` sert à permettre à React de :
- identifier chaque élément de façon fiable
- préserver l’état interne des composants
- optimiser les re-renders

### Une bonne `key` doit être :
- **stable dans le temps**
- **liée à la donnée**, pas au rendu
- **unique dans la liste**
- **indépendante de l’ordre**

---

## ❌ À ne jamais utiliser

```jsx
key={uuidv4()}
key={nanoid()}
key={Math.random()}
key={index}
```

### Pourquoi ?
- la clé change à chaque render
- React démonte / remonte les composants
- perte d’état
- bugs lors des suppressions ou tris

---

## ✅ Options recommandées (par ordre de priorité)

### 🥇 ID métier / backend (cas idéal)

```jsx
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

✔ stable
✔ lié à la donnée
✔ sûr pour suppression / tri / drag & drop

---

### 🥈 ID généré UNE FOIS à la création (frontend)

👉 **Ne jamais générer l’ID dans le `map`**

```ts
type Item = {
  id: string;
  label: string;
};

const addItem = (label: string) => {
  setItems(prev => [
    ...prev,
    { id: crypto.randomUUID(), label },
  ]);
};
```

```jsx
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

✔ stable
✔ ordre indépendant
✔ suppression sans effet de bord

---

### 🥉 Clé dérivée (lecture seule uniquement)

```jsx
key={`${item.type}-${item.name}`}
```

⚠️ À utiliser seulement si :
- la combinaison est réellement unique
- les valeurs sont immuables

---

## 🚨 Cas particulier : listes strictement statiques

```jsx
key={index}
```

Acceptable **uniquement si** :
- aucun ajout
- aucune suppression
- aucun réordonnancement

➡️ rare en pratique

---

## 🧠 Règle d’or

> **Une `key` doit survivre à la suppression, au tri et au re-render.**

Si la clé change quand l’UI change → c’est une mauvaise `key`.

---

## 🧪 Résumé

| Situation | Key recommandée |
|---------|----------------|
| Données backend | `item.id` |
| Liste dynamique frontend | `crypto.randomUUID()` à la création |
| Lecture seule | clé dérivée |
| Liste statique | `index` (toléré) |

---

Ce guide peut servir de **référence équipe**, **checklist d’audit React**, ou **annexe de projet**.

