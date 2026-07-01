# Tutoriel : Server Components vs Server Functions (React / Next.js)

Ce tutoriel explique deux concepts fondamentaux de React moderne (notamment avec Next.js App Router) :
les **Server Components** et les **Server Functions** (aussi appelées **Server Actions**). Vous verrez ce qu'ils sont, comment les utiliser avec des exemples concrets, et surtout **quand utiliser l'un ou l'autre**.

---

## 1. Les Server Components (RSC)

### Qu'est-ce qu'un Server Component ?

Un **Server Component** est un composant React qui s'exécute **uniquement sur le serveur**. Son code (et son JavaScript) n'est **jamais envoyé au navigateur**. Le serveur génère le HTML/JSX final et l'envoie au client, déjà rendu.

Dans Next.js (App Router), **tous les composants sont des Server Components par défaut**. Pas besoin de directive spéciale.

### Caractéristiques principales

- S'exécutent côté serveur, à chaque requête (ou en build, selon le cache).
- Peuvent accéder directement aux bases de données, fichiers, API internes, secrets d'environnement.
- N'ajoutent **aucun poids JavaScript** au bundle client.
- Ne peuvent **pas** utiliser de hooks d'état (`useState`, `useEffect`, `useContext`) ni d'événements (`onClick`, etc.).
- Peuvent être asynchrones (`async function`).

### Exemple : afficher une liste d'articles depuis une base de données

```tsx
// app/articles/page.tsx
// Server Component par défaut (pas de "use client")

import { db } from "@/lib/db";

export default async function ArticlesPage() {
  const articles = await db.article.findMany();

  return (
    <div>
      <h1>Liste des articles</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

Points clés :
- `db.article.findMany()` s'exécute côté serveur, le client ne voit jamais le code de la base de données.
- Aucun `useEffect` nécessaire pour charger les données : on `await` directement dans le composant.
- Le client reçoit du HTML déjà construit, ce qui améliore les performances et le SEO.

### Exemple : composer Server Component et Client Component

```tsx
// app/articles/page.tsx (Server Component)
import { db } from "@/lib/db";
import LikeButton from "./LikeButton";

export default async function ArticlesPage() {
  const articles = await db.article.findMany();

  return (
    <ul>
      {articles.map((article) => (
        <li key={article.id}>
          {article.title}
          <LikeButton articleId={article.id} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/articles/LikeButton.tsx
"use client";

import { useState } from "react";

export default function LikeButton({ articleId }: { articleId: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? "❤️ Aimé" : "🤍 J'aime"}
    </button>
  );
}
```

Ici, le composant parent reste un Server Component (rapide, léger), et seul le bouton interactif devient un **Client Component** grâce à `"use client"`.

---

## 2. Les Server Functions (Server Actions)

### Qu'est-ce qu'une Server Function ?

Une **Server Function** (appelée *Server Action* dans Next.js) est une **fonction qui s'exécute toujours sur le serveur**, mais qui peut être **appelée depuis le client** (par exemple lors d'un clic, d'une soumission de formulaire, etc.).

Elle se déclare avec la directive `"use server"`.

### Caractéristiques principales

- Permet d'exécuter du code serveur (écriture en base, appel API sécurisé, envoi d'email, etc.) **en réaction à une action utilisateur**.
- Peut être appelée depuis un Server Component **ou** un Client Component.
- Idéale pour les formulaires, les mutations de données (créer, modifier, supprimer).
- Le code de la fonction reste sur le serveur, mais elle est invocable comme une fonction normale côté client (React génère un appel réseau automatiquement).

### Exemple : formulaire avec Server Function (depuis un Server Component)

```tsx
// app/contact/page.tsx
import { db } from "@/lib/db";

async function createMessage(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const message = formData.get("message") as string;

  await db.message.create({
    data: { name, message },
  });
}

export default function ContactPage() {
  return (
    <form action={createMessage}>
      <input type="text" name="name" placeholder="Votre nom" />
      <textarea name="message" placeholder="Votre message" />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

Points clés :
- `"use server"` indique que cette fonction doit toujours s'exécuter côté serveur.
- Le formulaire fonctionne même sans JavaScript activé (progressive enhancement).
- Aucune route API (`/api/...`) à créer manuellement.

### Exemple : Server Function appelée depuis un Client Component

```tsx
// app/actions.ts
"use server";

import { db } from "@/lib/db";

export async function deleteArticle(id: string) {
  await db.article.delete({ where: { id } });
}
```

```tsx
// app/articles/DeleteButton.tsx
"use client";

import { deleteArticle } from "@/app/actions";

export default function DeleteButton({ id }: { id: string }) {
  return (
    <button onClick={() => deleteArticle(id)}>
      Supprimer
    </button>
  );
}
```

Points clés :
- La fonction `deleteArticle` est définie dans un fichier séparé avec `"use server"` en haut du fichier.
- Elle est importée et utilisée dans un Client Component comme une fonction normale.
- React/Next.js gère automatiquement l'appel réseau vers le serveur.

### Exemple : Server Function avec gestion d'état (formulaire avec retour de statut)

```tsx
// app/actions.ts
"use server";

export async function subscribe(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email.includes("@")) {
    return { success: false, message: "Email invalide" };
  }

  // logique d'inscription...
  return { success: true, message: "Inscription réussie !" };
}
```

```tsx
// app/newsletter/Form.tsx
"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/actions";

export default function NewsletterForm() {
  const [state, formAction] = useActionState(subscribe, null);

  return (
    <form action={formAction}>
      <input type="email" name="email" placeholder="Votre email" />
      <button type="submit">S'inscrire</button>
      {state && <p>{state.message}</p>}
    </form>
  );
}
```

`useActionState` permet de récupérer le résultat retourné par la Server Function et d'afficher un message de feedback à l'utilisateur.

---

## 3. Tableau comparatif

| Critère | Server Component | Server Function |
|---|---|---|
| Rôle principal | **Afficher** des données (rendu) | **Exécuter une action** (mutation, écriture) |
| Déclaration | Par défaut (pas de directive) | `"use server"` |
| Quand s'exécute-t-il ? | Lors du rendu de la page | Lors d'une interaction utilisateur (clic, submit...) |
| Accès direct à la BDD | Oui, pour lire les données | Oui, pour écrire/modifier les données |
| Peut renvoyer du JSX | Oui | Non (renvoie des données : objets, statuts...) |
| Utilisé dans un Client Component | Non (impossible directement) | Oui, via import |
| Interactivité (state, events) | Non | Non lui-même, mais déclenché par l'interactivité côté client |

---

## 4. Quand utiliser l'un ou l'autre ?

### Utilisez un **Server Component** quand :

- Vous devez **afficher** des données provenant d'une base de données, d'un fichier, ou d'une API.
- Vous voulez réduire la quantité de JavaScript envoyée au navigateur.
- Le contenu est principalement statique ou ne nécessite pas d'interactivité immédiate.
- Vous voulez améliorer le SEO et le temps de chargement initial (le HTML est déjà prêt).
- Exemple typique : une page de blog, une fiche produit, un tableau de bord en lecture seule.

### Utilisez une **Server Function** quand :

- L'utilisateur doit **déclencher une action** qui modifie des données côté serveur (créer, mettre à jour, supprimer).
- Vous construisez un **formulaire** (contact, inscription, commentaire, panier, etc.).
- Vous voulez éviter de créer des routes API classiques (`/api/...`) pour des opérations simples.
- Vous avez besoin que le code sensible (clé API, logique métier, accès BDD) reste strictement côté serveur, tout en étant appelable depuis l'interface.
- Exemple typique : bouton "Ajouter au panier", formulaire d'inscription, suppression d'un élément, like/dislike.

### En résumé simple

> **Server Component = je montre quelque chose (lecture).**
> **Server Function = l'utilisateur fait quelque chose (écriture/action).**

Dans une application réelle, les deux travaillent ensemble :
- Le **Server Component** charge et affiche la liste des tâches d'une todo-list.
- Une **Server Function** est appelée lorsque l'utilisateur clique sur "Ajouter une tâche" ou "Supprimer".

---

## 5. Exemple complet : Todo List combinant les deux

```tsx
// app/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  await db.task.create({ data: { title, done: false } });
  revalidatePath("/todos");
}

export async function toggleTask(id: string, done: boolean) {
  await db.task.update({ where: { id }, data: { done: !done } });
  revalidatePath("/todos");
}
```

```tsx
// app/todos/page.tsx (Server Component)
import { db } from "@/lib/db";
import { addTask, toggleTask } from "@/app/actions";

export default async function TodosPage() {
  const tasks = await db.task.findMany();

  return (
    <div>
      <form action={addTask}>
        <input type="text" name="title" placeholder="Nouvelle tâche" />
        <button type="submit">Ajouter</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span style={{ textDecoration: task.done ? "line-through" : "none" }}>
              {task.title}
            </span>
            <form action={toggleTask.bind(null, task.id, task.done)}>
              <button type="submit">
                {task.done ? "Marquer non fait" : "Marquer fait"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Ici :
- La **page** est un Server Component qui charge et affiche les tâches.
- `addTask` et `toggleTask` sont des **Server Functions** qui modifient les données et déclenchent `revalidatePath` pour rafraîchir l'affichage.

---

## 6. Bonnes pratiques

- Gardez vos **Server Components** par défaut, ne basculez en `"use client"` que lorsque c'est nécessaire (interactivité, hooks, événements).
- Regroupez vos **Server Functions** dans des fichiers dédiés (ex. `actions.ts`) avec `"use server"` en haut du fichier pour la clarté.
- Pensez à `revalidatePath` ou `revalidateTag` après une mutation pour que les Server Components affichent les données à jour.
- Validez toujours les données reçues côté serveur dans une Server Function (ne faites jamais confiance aux données venant du client).
- N'exposez jamais de secrets (clés API, identifiants de BDD) dans un Client Component : ils doivent rester dans un Server Component ou une Server Function.
