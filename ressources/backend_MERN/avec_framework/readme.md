
# 🧱 Manuel Backend MERN (ES6) – Architecture DAO / Service / Controller

## 🎯 Objectif

Mettre en place un backend Node.js / Express / MongoDB avec architecture propre :

```
Client → Routes → Controller → Service → DAO → Mongoose
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
├── app.js
└── server.js
```

---

## 1. 🔧 Initialisation

```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv
```

Dans `package.json` :

```json
"type": "module"
```

Fichier `.env` :

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_example
```

---

## 2. ⚙️ Connexion MongoDB (`config/db.js`)

```js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Échec connexion DB :', err.message);
    process.exit(1);
  }
};
```

---

## 3. 🧬 Modèle Mongoose (`models/task.model.js`)

```js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);
```

---

## 4. 📦 DAO – Accès aux données (`dao/task.dao.js`)

```js
import { Task } from '../models/task.model.js';

class TaskDAO {
  async getAll() {
    return await Task.find();
  }

  async getById(id) {
    return await Task.findById(id);
  }

  async create(data) {
    return await Task.create(data);
  }

  async update(id, data) {
    return await Task.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }
}

export default new TaskDAO();
```

---

## 5. 🧠 Service Métier (`services/task.service.js`)

```js
import taskDAO from '../dao/task.dao.js';

class TaskService {
  async getAllTasks() {
    return await taskDAO.getAll();
  }

  async createTask(data) {
    return await taskDAO.create(data);
  }

  async deleteTask(id) {
    return await taskDAO.delete(id);
  }

  async updateTask(id, data) {
    return await taskDAO.update(id, data);
  }
}

export default new TaskService();
```

---

## 6. 🎮 Contrôleur (`controllers/task.controller.js`)

```js
import taskService from '../services/task.service.js';

export const getAll = async (req, res) => {
  const tasks = await taskService.getAllTasks();
  res.json(tasks);
};

export const create = async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json(task);
};

export const update = async (req, res) => {
  const updated = await taskService.updateTask(req.params.id, req.body);
  res.json(updated);
};

export const remove = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.sendStatus(204);
};
```

---

## 7. 🌐 Routes (`routes/task.routes.js`)

```js
import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/task.controller.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
```

---

## 8. 🚦 App & Serveur

### `app.js`

```js
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import taskRoutes from './routes/task.routes.js';

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use('/tasks', taskRoutes);

export default app;
```

### `server.js`

```js
import app from './app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
```

---

## 🧪 API – Points d’entrée

| Méthode | Endpoint      | Action                   |
|---------|---------------|--------------------------|
| GET     | `/tasks`      | Lister les tâches        |
| POST    | `/tasks`      | Créer une tâche          |
| PUT     | `/tasks/:id`  | Modifier une tâche       |
| DELETE  | `/tasks/:id`  | Supprimer une tâche      |

---

## 🔐 Suggestions d’évolution

- 🔐 Authentification avec JWT
- ✅ Middleware de validation (Joi / Zod)
- 🧪 Tests unitaires avec Jest / Supertest
- 📘 Documentation Swagger
- ⚔️ Rate Limiting / Helmet / Logger

---
