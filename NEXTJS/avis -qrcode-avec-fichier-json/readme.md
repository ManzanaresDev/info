# Manuel : Système d'avis avec fichier JSON — Next.js (v1)

> **Pas de base de données, pas de Strapi**  
> Stockage simple dans un fichier `avis.json` local  
> Facile à migrer vers Strapi en v2

---

## 1. Structure du projet

```
app/
├── avis/
│   ├── page.tsx                  →  /avis  (formulaire)
│   └── merci/
│       └── page.tsx              →  /avis/merci  (confirmation)
│
data/
└── avis.json                     ←  stockage des avis
│
lib/
└── avis.ts                       ←  logique lecture / écriture
│
components/
├── FormulaireAvis.tsx            ←  formulaire client
└── SectionAvis.tsx               ←  affichage des avis
```

---

## 2. Fichier JSON initial

Crée le dossier `data/` à la racine du projet et le fichier `avis.json` :

```json
[]
```

> ⚠️ Ajoute `data/avis.json` à ton `.gitignore` si tu ne veux pas versionner les avis.

```
# .gitignore
data/avis.json
```

---

## 3. Type `Avis`

```typescript
// lib/avis.ts

export type Avis = {
  id: number;
  nom: string;
  message: string;
  note: number;
  valide: boolean;
  createdAt: string;
};
```

---

## 4. Lire et écrire dans le fichier JSON

```typescript
// lib/avis.ts
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "avis.json");

// Lire tous les avis
export async function lireAvis(): Promise<Avis[]> {
  try {
    const contenu = await fs.readFile(filePath, "utf-8");
    return JSON.parse(contenu);
  } catch {
    return []; // retourne tableau vide si fichier inexistant
  }
}

// Écrire tous les avis
async function ecrireAvis(avis: Avis[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(avis, null, 2), "utf-8");
}
```

---

## 5. Récupérer les avis validés (pour l'affichage)

```typescript
// lib/avis.ts (suite)

export async function recupererAvis(): Promise<Avis[]> {
  const tous = await lireAvis();

  // Uniquement les avis validés, du plus récent au plus ancien
  return tous
    .filter((a) => a.valide)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
```

---

## 6. Server Action — Envoyer un avis

```typescript
// lib/avis.ts (suite)
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function envoyerAvis(formData: FormData) {
  // Anti-spam honeypot
  const honeypot = formData.get("honeypot");
  if (honeypot) return; // bot détecté, on ignore

  const nouvelAvis: Avis = {
    id: Date.now(),                              // id unique basé sur timestamp
    nom: formData.get("nom") as string,
    message: formData.get("message") as string,
    note: Number(formData.get("note")),
    valide: false,                               // en attente de validation manuelle
    createdAt: new Date().toISOString(),
  };

  const avisExistants = await lireAvis();
  avisExistants.push(nouvelAvis);
  await ecrireAvis(avisExistants);              // sauvegarde dans le JSON

  revalidatePath("/");                          // revalide la page d'accueil
  redirect("/avis/merci");                      // redirige vers confirmation
}
```

---

## 7. Valider un avis manuellement

Pour modérer, crée une fonction de validation :

```typescript
// lib/avis.ts (suite)

export async function validerAvis(id: number): Promise<void> {
  const tous = await lireAvis();

  const mis_a_jour = tous.map((a) =>
    a.id === id ? { ...a, valide: true } : a
  );

  await ecrireAvis(mis_a_jour);
  revalidatePath("/");
}

export async function supprimerAvis(id: number): Promise<void> {
  const tous = await lireAvis();
  const filtres = tous.filter((a) => a.id !== id);

  await ecrireAvis(filtres);
  revalidatePath("/");
}
```

---

## 8. Composant formulaire

```tsx
// components/FormulaireAvis.tsx
"use client";

import { envoyerAvis } from "@/lib/avis";

export function FormulaireAvis() {
  return (
    <form
      action={envoyerAvis}
      className="flex flex-col gap-4 w-full max-w-md mx-auto"
    >
      {/* Prénom */}
      <input
        name="nom"
        placeholder="Votre prénom"
        required
        className="border rounded-lg px-4 py-3"
      />

      {/* Message */}
      <textarea
        name="message"
        placeholder="Votre avis..."
        rows={4}
        required
        className="border rounded-lg px-4 py-3 resize-none"
      />

      {/* Note */}
      <select name="note" className="border rounded-lg px-4 py-3">
        <option value="5">⭐⭐⭐⭐⭐ — Excellent</option>
        <option value="4">⭐⭐⭐⭐ — Très bien</option>
        <option value="3">⭐⭐⭐ — Bien</option>
        <option value="2">⭐⭐ — Moyen</option>
        <option value="1">⭐ — Décevant</option>
      </select>

      {/* Honeypot anti-spam — invisible pour l'utilisateur */}
      <input
        name="honeypot"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <button
        type="submit"
        className="bg-[var(--primary)] text-white rounded-lg py-3 font-semibold"
      >
        Envoyer mon avis
      </button>
    </form>
  );
}
```

---

## 9. Page formulaire `/avis`

```tsx
// app/avis/page.tsx
import { FormulaireAvis } from "@/components/FormulaireAvis";

export default function PageAvis() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Laisser un avis</h1>
      <p className="text-gray-500 mb-8">
        Votre avis compte beaucoup, merci !
      </p>
      <FormulaireAvis />
    </main>
  );
}
```

---

## 10. Page de confirmation `/avis/merci`

```tsx
// app/avis/merci/page.tsx
import Link from "next/link";

export default function PageMerci() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">🙏</div>
      <h1 className="text-3xl font-bold mb-2">Merci pour votre avis !</h1>
      <p className="text-gray-500 mb-8">
        Il sera publié après vérification. Votre retour nous aide beaucoup.
      </p>
      <Link href="/" className="text-[var(--primary)] underline">
        Retour au site
      </Link>
    </main>
  );
}
```

---

## 11. Afficher les avis sur le site

```tsx
// components/SectionAvis.tsx
import { recupererAvis } from "@/lib/avis";

export async function SectionAvis() {
  const avis = await recupererAvis();

  if (!avis.length) return null;

  return (
    <section className="py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-10">
        Avis clients
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {avis.map((a) => (
          <div key={a.id} className="border rounded-xl p-6 shadow-sm bg-white">
            <p className="text-yellow-400 text-xl">{"⭐".repeat(a.note)}</p>
            <p className="mt-3 text-gray-700 italic">"{a.message}"</p>
            <p className="mt-4 font-semibold text-sm text-gray-500">
              — {a.nom}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## 12. Valider les avis — page admin simple

Pour que ton amie puisse valider les avis sans toucher au JSON :

```tsx
// app/admin/avis/page.tsx
import { lireAvis, validerAvis, supprimerAvis } from "@/lib/avis";

export default async function AdminAvis() {
  const tous = await lireAvis();
  const enAttente = tous.filter((a) => !a.valide);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Avis en attente ({enAttente.length})
      </h1>

      {enAttente.length === 0 && (
        <p className="text-gray-500">Aucun avis en attente ✅</p>
      )}

      {enAttente.map((a) => (
        <div key={a.id} className="border rounded-xl p-6 mb-4 bg-white shadow-sm">
          <p className="font-semibold">{a.nom} — {"⭐".repeat(a.note)}</p>
          <p className="mt-2 text-gray-700">{a.message}</p>
          <div className="flex gap-4 mt-4">
            {/* Valider */}
            <form action={validerAvis.bind(null, a.id)}>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
                ✅ Valider
              </button>
            </form>
            {/* Supprimer */}
            <form action={supprimerAvis.bind(null, a.id)}>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
                🗑️ Supprimer
              </button>
            </form>
          </div>
        </div>
      ))}
    </main>
  );
}
```

---

## 13. Structure finale du fichier `lib/avis.ts`

```typescript
"use server";

import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type Avis = {
  id: number;
  nom: string;
  message: string;
  note: number;
  valide: boolean;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "avis.json");

export async function lireAvis(): Promise<Avis[]> {
  try {
    const contenu = await fs.readFile(filePath, "utf-8");
    return JSON.parse(contenu);
  } catch {
    return [];
  }
}

async function ecrireAvis(avis: Avis[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(avis, null, 2), "utf-8");
}

export async function recupererAvis(): Promise<Avis[]> {
  const tous = await lireAvis();
  return tous
    .filter((a) => a.valide)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function envoyerAvis(formData: FormData) {
  const honeypot = formData.get("honeypot");
  if (honeypot) return;

  const nouvelAvis: Avis = {
    id: Date.now(),
    nom: formData.get("nom") as string,
    message: formData.get("message") as string,
    note: Number(formData.get("note")),
    valide: false,
    createdAt: new Date().toISOString(),
  };

  const existants = await lireAvis();
  existants.push(nouvelAvis);
  await ecrireAvis(existants);

  revalidatePath("/");
  redirect("/avis/merci");
}

export async function validerAvis(id: number): Promise<void> {
  const tous = await lireAvis();
  const mis_a_jour = tous.map((a) => (a.id === id ? { ...a, valide: true } : a));
  await ecrireAvis(mis_a_jour);
  revalidatePath("/");
}

export async function supprimerAvis(id: number): Promise<void> {
  const tous = await lireAvis();
  const filtres = tous.filter((a) => a.id !== id);
  await ecrireAvis(filtres);
  revalidatePath("/");
}
```

---

## 14. Check-list

- [ ] Créer `data/avis.json` avec `[]`
- [ ] Ajouter `data/avis.json` au `.gitignore`
- [ ] Créer `lib/avis.ts` avec toutes les fonctions
- [ ] Créer `components/FormulaireAvis.tsx`
- [ ] Créer `app/avis/page.tsx`
- [ ] Créer `app/avis/merci/page.tsx`
- [ ] Créer `components/SectionAvis.tsx`
- [ ] Créer `app/admin/avis/page.tsx` (modération)
- [ ] Ajouter `<SectionAvis />` sur la page d'accueil
- [ ] Générer et afficher le QR Code pointant vers `/avis`

---

## 15. Migration vers Strapi (v2)

Quand tu passeras à Strapi, seul `lib/avis.ts` change :

| v1 (JSON) | v2 (Strapi) |
|-----------|-------------|
| `fs.readFile` | `fetch(/api/avis)` |
| `fs.writeFile` | `fetch(/api/avis, { method: POST })` |
| `revalidatePath` | `revalidateTag("avis")` |
| Page admin maison | Back-office Strapi |

> Le reste du code (formulaire, pages, composants) reste **identique**.
