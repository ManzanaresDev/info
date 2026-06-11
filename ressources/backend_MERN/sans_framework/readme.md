
# 🧱 Manuel Backend JavaScript Vanilla – Architecture DAO / Service / Controller sans Framework

## 🎯 Objectif

Créer un serveur backend en JavaScript **sans Express** (ni framework), en utilisant uniquement les modules natifs, MongoDB via le driver officiel, et une architecture en couches :

```
Client → Routes → Controller → Service → DAO → MongoDB
```

---

## 📁 Structure du projet

```
backend/
│
├── config/
│   └── db.js
├── controllers/
│   └── task.controller.js
├── services/
│   └── task.service.js
├── dao/
│   └── task.dao.js
├── models/
│   └── task.model.js
├── routes/
│   └── task.routes.js
├── server.js
└── mld/
    └── task.mld.json
```

---

## 1. ⚙️ Connexion MongoDB (`config/db.js`)

```js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
export const connectDB = async () => {
  try {
    await client.connect();
    console.log('✅ MongoDB connecté');
    return client.db();
  } catch (err) {
    console.error('❌ Connexion MongoDB échouée :', err.message);
    process.exit(1);
  }
};
```

---

## 2. 🧬 MLD – Modèle logique de données (`mld/task.mld.json`)

```json
{
  "collection": "tasks",
  "fields": {
    "title": "String",
    "completed": "Boolean",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

---

## 3. 📦 DAO (`dao/task.dao.js`)

```js
let collection;

export const initTaskDAO = (db) => {
  collection = db.collection('tasks');
};

export const getAllTasks = async () => {
  return await collection.find().toArray();
};

export const getTaskById = async (id) => {
  return await collection.findOne({ _id: new ObjectId(id) });
};

export const createTask = async (task) => {
  return await collection.insertOne({ ...task, createdAt: new Date(), updatedAt: new Date() });
};

export const updateTask = async (id, data) => {
  return await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
};

export const deleteTask = async (id) => {
  return await collection.deleteOne({ _id: new ObjectId(id) });
};
```

---

## 4. 🧠 Service (`services/task.service.js`)

```js
import * as dao from '../dao/task.dao.js';

export const getAll = async () => await dao.getAllTasks();
export const getById = async (id) => await dao.getTaskById(id);
export const create = async (task) => await dao.createTask(task);
export const update = async (id, data) => await dao.updateTask(id, data);
export const remove = async (id) => await dao.deleteTask(id);
```

---

## 5. 🎮 Contrôleur (`controllers/task.controller.js`)

```js
import * as service from '../services/task.service.js';

export const taskController = async (req, res) => {
  const { method, url } = req;

  if (url === '/tasks' && method === 'GET') {
    const tasks = await service.getAll();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tasks));
  }

  // POST, PUT, DELETE à implémenter...
};
```

---

## 6. 🌐 Routes + Serveur (`server.js`)

```js
import http from 'http';
import { connectDB } from './config/db.js';
import { taskController } from './controllers/task.controller.js';
import { initTaskDAO } from './dao/task.dao.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  const db = await connectDB();
  initTaskDAO(db);

  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/tasks')) {
      await taskController(req, res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => console.log(`🚀 Serveur sans framework sur le port ${PORT}`));
};

start();
```

---

## 📄 `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vanilla_example
```

---

## 🔐 Évolutions possibles

- Ajout de routes dynamiques (`/tasks/:id`)
- Ajout d’un routeur personnalisé
- Parsing JSON de `req.body`
- Middleware de validation
- Authentification simple par token dans les headers
