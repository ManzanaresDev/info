# Gestion des erreurs avec un tableau de correspondances — Node.js ES6

## Introduction

Quand ton application renvoie une erreur, le code HTTP (404, 401, 500…) seul n'est pas très parlant pour l'utilisateur. L'idée est d'utiliser un **tableau de correspondances** pour associer chaque code à un message lisible.

---

## 1. Le tableau d'erreurs

```js
// errors.js
const errors = [
  { code: 404, message: "Page introuvable." },
  { code: 401, message: "Tu dois être connecté." },
  { code: 403, message: "Tu n'as pas accès à ça." },
  { code: 500, message: "Problème côté serveur." },
];

export const getErrorMessage = (errorCode) => {
  const error = errors.find(e => e.code === errorCode);
  return error ? error.message : "Une erreur inconnue est survenue.";
};
```

- `errors` est un tableau d'objets, chacun avec un `code` et un `message`.
- `find()` parcourt le tableau et retourne le premier objet dont le `code` correspond.
- Si aucun code ne correspond, on retourne un message par défaut.

---

## 2. Utilisation dans une route Express

```js
import express from "express";
import { getErrorMessage } from "./errors.js";

const app = express();

app.get("/user/:id", (req, res) => {
  const user = null; // imaginons qu'on ne trouve pas l'utilisateur

  if (!user) {
    const code = 404;
    return res.status(code).json({
      success: false,
      message: getErrorMessage(code),
    });
  }

  res.json({ success: true, data: user });
});

app.listen(3000, () => console.log("Serveur démarré sur le port 3000"));
```

---

## 3. Ce que le front reçoit

Quand l'utilisateur n'est pas trouvé, le serveur renvoie :

```json
{
  "success": false,
  "message": "Page introuvable."
}
```

Quand tout va bien :

```json
{
  "success": true,
  "data": { "id": 1, "nom": "Alice" }
}
```

---

## 4. Variante avec `[méthode, code]`

Certains tutoriels utilisent un tableau de tableaux pour affiner le message selon la méthode HTTP utilisée (`GET`, `POST`, `DELETE`…).

```js
// errors.js
const errors = [
  ["GET",    404, "Ressource introuvable."],
  ["POST",   400, "Données envoyées incorrectes."],
  ["DELETE", 403, "Suppression non autorisée."],
];

export const getErrorMessage = (method, code) => {
  const error = errors.find(([m, c]) => m === method && c === code);
  return error ? error[2] : "Erreur inconnue.";
};
```

```js
// Utilisation :
getErrorMessage("GET",    404); // → "Ressource introuvable."
getErrorMessage("POST",   400); // → "Données envoyées incorrectes."
getErrorMessage("DELETE", 403); // → "Suppression non autorisée."
```

### Explication du `find` avec destructuring

```js
errors.find(([m, c]) => m === method && c === code);
//           ^^^^^^
//   on "décompacte" chaque sous-tableau en variables m et c
//   pour comparer avec les paramètres reçus
```

---

## 5. Afficher l'erreur côté front (JavaScript)

```js
const afficherErreur = async () => {
  const response = await fetch("/user/99");
  const data = await response.json();

  if (!data.success) {
    console.log("Erreur :", data.message); // "Page introuvable."
  }
};
```

---

## Résumé

| Concept utilisé     | Rôle                                           |
|---------------------|------------------------------------------------|
| Tableau `errors`    | Stocker les correspondances code → message     |
| `.find()`           | Chercher le bon message dans le tableau        |
| Destructuring `[]`  | Lire facilement les tableaux de tableaux       |
| `export` / `import` | Partager la fonction entre les fichiers        |
| `res.status().json()` | Renvoyer le code HTTP + le message au front |

---

## À retenir

- Un tableau de correspondances est simple à lire et à modifier.
- `find()` s'arrête au premier résultat trouvé.
- On sépare toujours la logique des erreurs dans son propre fichier (`errors.js`) pour garder le code organisé.
