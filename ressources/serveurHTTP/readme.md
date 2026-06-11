# Manuel rapide : Créer un serveur HTTP Node.js en ES6 avec `.env`

---

## Pré-requis

- Node.js installé (version >= 14 recommandée)
- Terminal / invite de commande
- Connaissance basique de JavaScript et terminal

---

## 1. Créer un fichier `.env`

Ce fichier contiendra la configuration de ton serveur (hôte et port).

```env
HOST=127.0.0.1
PORT=3000
```

## 2.Installer la dépendance dotenv

Pour pouvoir lire les variables définies dans .env, il faut installer dotenv.

```env
npm install dotenv
```

## 3.Créer le fichier serveur server.mjs

Utilise la syntaxe ES6 (import/export).

```env
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Serveur Node.js avec ES6 et .env');
});

server.listen(port, hostname, () => {
  console.log(`Serveur lancé sur http://${hostname}:${port}/`);
});
```

## 4. Lancer le serveur

```env
node server.mjs
```

## 5. Tester

Ouvre un navigateur et va sur :

```env
http://127.0.0.1:3000/
```

Tu dois voir le message :

```env
Serveur Node.js avec ES6 et .env
```

## 6. Résumé des commandes:

- npm install dotenv — installer la gestion des variables d'environnement
- node server.mjs — lancer le serveur

## 7. Notes importantes

- Le fichier .env ne doit pas être commité en général (ajoute-le à .gitignore)

- Utiliser les variables d’environnement permet de changer la config sans modifier le code

- .mjs est l’extension pour indiquer à Node.js d’utiliser les modules ES6
