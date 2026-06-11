# Intégration de Firebase dans un projet Next.js (avec dossier `src/`)

Ce guide explique comment installer et configurer Firebase dans un projet Next.js moderne (2025), en utilisant un dossier `src/`.

---

## 🚀 1. Installation de Firebase

Dans votre projet Next.js :

```
npm install firebase
```

---

## 🔧 2. Créer un projet Firebase

1. Accédez à : https://console.firebase.google.com
2. Créez un projet.
3. Ajoutez une **application Web**.
4. Récupérez la configuration Firebase fournie.

Exemple :

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 📁 3. Configuration Firebase dans Next.js

Créez le fichier :

`src/lib/firebase.ts`

```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 🔑 4. Variables d'environnement

Créez :

`.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

> Toutes les variables doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client.

---

## 🧪 5. Exemples d'utilisation

### 🔐 Authentification

```ts
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
```

### 📁 Firestore

```ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const addUser = async () => {
  await addDoc(collection(db, "users"), {
    name: "Marcos",
    createdAt: Date.now(),
  });
};
```

### 📦 Storage

```ts
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export const uploadFile = async (file: File) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  return await uploadBytes(storageRef, file);
};
```

---

## ☁️ 6. Déploiement Next.js sur Firebase Hosting

### Installer l'outil Firebase CLI

```
npm install -g firebase-tools
firebase login
```

### Initialiser l'hébergement

```
firebase init hosting
```

### Build du site

```
npm run build
```

### Déploiement

```
firebase deploy
```

---

## 📌 Besoin d'ajouter quelque chose ?

- Auth complète (inscription, login, logout)
- CRUD Firestore
- Upload Storage
- Middleware Next.js + Firebase Auth
- Sécurisation des pages avec session Firebase

Demandez si vous souhaitez ajouter des modules supplé