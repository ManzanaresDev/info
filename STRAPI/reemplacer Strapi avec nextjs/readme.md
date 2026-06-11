# 🚀 Backend MERN From Scratch (Remplacer Strapi)

## 🧱 1. Architecture du projet

```text
backend/
│
├── config/
│   └── db.js
│
├── models/
│   ├── user.model.js
│   ├── course.model.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── course.controller.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│
├── utils/
│   ├── generateToken.js
│
├── app.js
└── server.js
```

---

# 🔐 2. Authentification (JWT + Refresh Token)

## utils/generateToken.js

```js
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
```

---

# 👤 3. Modèle utilisateur avec rôles

## models/user.model.js

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

export default mongoose.model("User", userSchema);
```

---

# 🛡️ 4. Middleware d’authentification

## middlewares/auth.middleware.js

```js
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Non autorisé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide" });
  }
};
```

---

# 👑 5. Middleware rôle (admin)

## middlewares/role.middleware.js

```js
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};
```

---

# 📚 6. CRUD (Courses)

## models/course.model.js

```js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
});

export default mongoose.model("Course", courseSchema);
```

---

## controllers/course.controller.js

```js
import Course from "../models/course.model.js";

// CREATE
export const createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

// READ ALL
export const getCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};

// READ ONE
export const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json(course);
};

// UPDATE
export const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(course);
};

// DELETE
export const deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Supprimé" });
};
```

---

# 🚏 7. Routes sécurisées

## routes/course.routes.js

```js
import express from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getCourse);

// ADMIN ONLY
router.post("/", protect, isAdmin, createCourse);
router.put("/:id", protect, isAdmin, updateCourse);
router.delete("/:id", protect, isAdmin, deleteCourse);

export default router;
```

---

# 🔥 8. Fonctionnalités avancées (comme un vrai CMS)

## Pagination

```js
const page = req.query.page || 1;
const limit = req.query.limit || 10;

const courses = await Course.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

---

## Filtrage

```js
const query = {};

if (req.query.title) {
  query.title = new RegExp(req.query.title, "i");
}

const courses = await Course.find(query);
```

---

## Relations (populate)

```js
const courses = await Course.find().populate("user");
```

---

# ⚙️ 9. Bonnes pratiques à ajouter

## Sécurité

- helmet
- rate limiting
- validation (Joi / Zod)

## Auth avancée

- rotation refresh token
- blacklist tokens

## Architecture avancée

- service layer
- gestion des erreurs centralisée

---

# 🧠 Conclusion

Avec cette structure tu obtiens :

- un backend modulaire
- un système d’auth sécurisé
- une gestion des rôles
- un CRUD propre
- une base scalable

👉 Tu as maintenant ton propre "mini Strapi", mais maîtrisé à 100%.

---
