# Manuel : Système d'avis via QR Code — Next.js + Strapi

## Architecture générale

```
Client flashe QR code
        ↓
Ouvre une page web  →  Formulaire d'avis
        ↓
Server Action / API
        ↓
Strapi (stockage)  →  Site vitrine affiche les avis
```

---

## 1. Collection Type `Avis` dans Strapi

Crée une **Collection Type** nommée `Avis` avec les champs suivants :

| Champ | Type | Description |
|-------|------|-------------|
| `nom` | Text | Prénom du client |
| `message` | Long text | Contenu de l'avis |
| `note` | Number | Note de 1 à 5 |
| `valide` | Boolean | Modération avant publication |

> ⚠️ Le champ `valide` est important — ton amie pourra valider chaque avis manuellement avant qu'il apparaisse sur le site.

---

## 2. Permissions Strapi

Dans **Settings → Roles → Public**, active :

- `avis` → `create` ✅ (pour recevoir les avis)
- `avis` → `find` ✅ (pour afficher les avis sur le site)

---

## 3. Structure des fichiers Next.js

```
app/
├── avis/
│   ├── page.tsx              →  /avis  (formulaire)
│   └── merci/
│       └── page.tsx          →  /avis/merci  (confirmation)
│
lib/
├── avis.ts                   ←  Server Action + fetch Strapi
│
components/
└── FormulaireAvis.tsx        ←  Client Component
```

---

## 4. Page formulaire `/avis`

```tsx
// app/avis/page.tsx
import { FormulaireAvis } from "@/components/FormulaireAvis";

export default function PageAvis() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Laisser un avis</h1>
      <p className="text-gray-500 mb-8">Votre avis compte beaucoup, merci !</p>
      <FormulaireAvis />
    </main>
  );
}
```

---

## 5. Composant formulaire

```tsx
// components/FormulaireAvis.tsx
"use client";

import { envoyerAvis } from "@/lib/avis";

export function FormulaireAvis() {
  return (
    <form
      action={envoyerAvis}
      className="flex flex-col gap-4 w-full max-w-md"
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

      {/* Honeypot anti-spam (champ caché) */}
      <input name="honeypot" className="hidden" tabIndex={-1} />

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

## 6. Server Action

```typescript
// lib/avis.ts
"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { Config } from "@/config/config";

export async function envoyerAvis(formData: FormData) {
  // Anti-spam honeypot
  const honeypot = formData.get("honeypot");
  if (honeypot) return; // bot détecté, on ignore silencieusement

  const avis = {
    nom: formData.get("nom"),
    message: formData.get("message"),
    note: Number(formData.get("note")),
    valide: false, // en attente de modération
  };

  const response = await fetch(`${Config.serverUrl}/api/avis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: avis }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'envoi de l'avis");
  }

  revalidateTag("avis"); // revalide l'affichage des avis sur le site
  redirect("/avis/merci");
}
```

---

## 7. Page de confirmation

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

## 8. Récupérer et afficher les avis sur le site

```typescript
// lib/avis.ts (ajout)
import { unstable_cacheTag as cacheTag } from "next/cache";
import { unstable_cacheLife as cacheLife } from "next/cache";

export type Avis = {
  id: number;
  documentId: string;
  nom: string;
  message: string;
  note: number;
  createdAt: string;
};

export async function recupererAvis(): Promise<Avis[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("avis");

  // On affiche uniquement les avis validés
  const response = await fetch(
    `${Config.serverUrl}/api/avis?filters[valide][$eq]=true&sort=createdAt:desc`
  );

  if (!response.ok) return [];

  const json = await response.json();
  return json.data;
}
```

```tsx
// components/SectionAvis.tsx
import { recupererAvis } from "@/lib/avis";

export async function SectionAvis() {
  const avis = await recupererAvis();

  if (!avis.length) return null;

  return (
    <section>
      <h2>Avis clients</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {avis.map((a) => (
          <div key={a.id} className="border rounded-xl p-6 shadow-sm">
            <p className="text-yellow-400">{"⭐".repeat(a.note)}</p>
            <p className="mt-2 text-gray-700">{a.message}</p>
            <p className="mt-4 font-semibold text-sm">— {a.nom}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## 9. Générer le QR Code

### Option A — En ligne (rapide)

Utilise un générateur gratuit comme :
- [qr-code-generator.com](https://www.qr-code-generator.com)
- [goqr.me](https://goqr.me)

L'URL à encoder :
```
https://tonsite.com/avis
```

### Option B — Intégré dans Next.js

```bash
npm install qrcode.react
```

```tsx
// components/QRCodeAvis.tsx
"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeAvis() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl">
      <QRCodeSVG value="https://tonsite.com/avis" size={200} />
      <p className="text-sm text-gray-500">Scannez pour laisser un avis</p>
    </div>
  );
}
```

---

## 10. Check-list finale

- [ ] Collection Type `Avis` créée dans Strapi
- [ ] Permissions `create` et `find` activées dans Strapi
- [ ] Page `/avis` avec formulaire mobile-friendly
- [ ] Server Action `envoyerAvis` avec honeypot anti-spam
- [ ] Page `/avis/merci` de confirmation
- [ ] Composant `SectionAvis` sur le site vitrine
- [ ] QR Code généré pointant vers `/avis`
- [ ] QR Code imprimé et affiché en boutique

---

## Points importants

| Sujet | Solution |
|-------|----------|
| **Modération** | Champ `valide` dans Strapi, validation manuelle |
| **Spam** | Honeypot dans le formulaire |
| **Mobile first** | Page `/avis` pensée pour téléphone |
| **Confirmation** | Redirection vers `/avis/merci` après envoi |
| **Cache** | `cacheTag("avis")` + `revalidateTag("avis")` après chaque envoi |
