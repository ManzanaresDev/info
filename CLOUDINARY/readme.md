# Manuel Cloudinary — Côté Client & Côté Serveur (Next.js)

---

## 1. Mise en place initiale

### Créer un compte et récupérer les credentials

Après inscription sur [cloudinary.com](https://cloudinary.com), tes credentials se trouvent dans le **Dashboard** :

- `Cloud Name` → identifiant unique de ton compte
- `API Key` → clé publique
- `API Secret` → clé secrète (**ne jamais l'exposer côté client**)

### Variables d'environnement

```env
# Accessibles côté client ET serveur
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ton_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ton_upload_preset

# Accessibles côté serveur UNIQUEMENT
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

> `NEXT_PUBLIC_` rend la variable accessible dans le navigateur.
> Ne jamais mettre `API_SECRET` en `NEXT_PUBLIC_`.

### Installation du SDK (côté serveur uniquement)

```bash
npm install cloudinary
```

---

## 2. Créer un Upload Preset (obligatoire pour le client)

Dans ton dashboard Cloudinary :
**Settings → Upload → Upload Presets → Add upload preset**

| Paramètre | Valeur recommandée |
|---|---|
| Signing mode | `Unsigned` (client) ou `Signed` (serveur) |
| Folder | `uploads/` (optionnel, pour organiser) |
| Allowed formats | `jpg, png, webp, gif` |
| Max file size | `5000000` (5 Mo) |
| Quality | `auto` |

---

## 3. Paramètres d'upload disponibles

Ces paramètres s'ajoutent au `formData` lors de n'importe quel upload (client ou serveur).

### Référence complète

| Paramètre | Type | Exemple | Description |
|---|---|---|---|
| `file` | `File` ou `string` | `file` | **Obligatoire.** Le fichier ou l'URL source |
| `upload_preset` | `string` | `"my_preset"` | **Obligatoire (unsigned).** Preset configuré dans le dashboard |
| `public_id` | `string` | `"avatars/abc123"` | Nom du fichier sans extension. Si omis, Cloudinary génère un ID aléatoire |
| `folder` | `string` | `"avatars"` | Dossier de destination. Équivalent à préfixer le `public_id` |
| `overwrite` | `boolean` | `true` | Écrase le fichier si le `public_id` existe déjà (défaut: `true`) |
| `resource_type` | `string` | `"image"`, `"video"`, `"raw"`, `"auto"` | Type de ressource. `"auto"` détecte automatiquement |
| `format` | `string` | `"webp"`, `"jpg"`, `"png"` | Force le format de sortie |
| `quality` | `string` ou `number` | `"auto"`, `80` | Qualité de compression |
| `transformation` | `string` | `"w_400,h_400,c_fill"` | Transformations appliquées à l'upload |
| `tags` | `string` | `"avatar,user"` | Tags séparés par des virgules pour organiser |
| `context` | `string` | `"alt=Photo de profil\|caption=Avatar"` | Métadonnées clé-valeur séparées par `\|` |
| `eager` | `string` | `"w_300,h_300,c_fill"` | Génère des variantes transformées dès l'upload |
| `unique_filename` | `boolean` | `false` | Ajoute un suffixe aléatoire au `public_id` |
| `use_filename` | `boolean` | `true` | Utilise le nom du fichier original comme `public_id` |
| `notification_url` | `string` | `"https://ton-site.com/webhook"` | URL appelée par Cloudinary quand l'upload est terminé |

### Exemple complet

```ts
const uploadImage = async (file: File, userId: string): Promise<string | null> => {
  const formData = new FormData();

  // Obligatoires
  formData.append("file", file);
  formData.append("upload_preset", CloudinaryConfig.preset);

  // Organisation
  formData.append("folder", "avatars");
  formData.append("public_id", userId);          // → avatars/abc123

  // Comportement
  formData.append("overwrite", "true");           // écrase l'ancien avatar
  formData.append("unique_filename", "false");    // pas de suffixe aléatoire

  // Optimisation à l'upload
  formData.append("format", "webp");              // convertit en WebP
  formData.append("quality", "auto");             // qualité optimale automatique

  // Métadonnées
  formData.append("tags", "avatar,user");
  formData.append("context", "alt=Avatar utilisateur");

  const response = await fetch(
    `${CloudinaryConfig.url}${CloudinaryConfig.cloud}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) throw new Error("Erreur Cloudinary upload");
  const data = await response.json();
  return data.secure_url || null;
};
```

### `public_id` vs `folder` — quelle différence ?

```ts
// Ces deux écritures sont équivalentes :
formData.append("folder", "avatars");
formData.append("public_id", "abc123");
// → public_id final : "avatars/abc123"

// Et :
formData.append("public_id", "avatars/abc123");
// → public_id final : "avatars/abc123"
```

> **Recommandation** : utilise `folder` + `public_id` séparément pour plus de clarté.

---

## 4. Upload côté client

### Fonction utilitaire

```ts
// lib/cloudinary-client.ts

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Upload une image
export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`${BASE_URL}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Échec de l'upload");
  return res.json();
}

// Upload une vidéo
export async function uploadVideo(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`${BASE_URL}/video/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Échec de l'upload");
  return res.json();
}

// Upload depuis une URL externe
export async function uploadFromUrl(imageUrl: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", imageUrl);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`${BASE_URL}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Échec de l'upload");
  return res.json();
}
```

### Composant avec preview et progression

```tsx
// components/ImageUploader.tsx
"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/cloudinary-client";

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification côté client
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    // Prévisualisation locale immédiate
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    try {
      const result = await uploadImage(file);
      setImageUrl(result.secure_url);
      console.log("public_id:", result.public_id); // à stocker en BDD
    } catch (err) {
      setError("Erreur lors de l'upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />

      {loading && <p>Upload en cours...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {preview && (
        <img src={preview} alt="Prévisualisation" width={200} />
      )}

      {imageUrl && (
        <div>
          <p>✅ Image uploadée :</p>
          <img src={imageUrl} alt="Uploadée" width={200} />
          <p><a href={imageUrl} target="_blank">Voir l'URL</a></p>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Upload côté serveur (Route API Next.js)

L'upload signé est plus sécurisé : la signature est générée côté serveur, l'upload se fait ensuite depuis le client.

### Configuration du SDK

```ts
// lib/cloudinary-server.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

### Route API — Upload direct depuis le serveur

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "uploads",
            resource_type: "image",
            transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

### Route API — Générer une signature (upload signé depuis le client)

```ts
// app/api/cloudinary-signature/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary-server";

export async function POST(req: NextRequest) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "uploads";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
```

### Upload signé depuis le client (plus sécurisé)

```ts
// lib/cloudinary-signed-upload.ts

export async function signedUpload(file: File) {
  // 1. Demander la signature au serveur
  const sigRes = await fetch("/api/cloudinary-signature", { method: "POST" });
  const { signature, timestamp, folder, api_key, cloud_name } = await sigRes.json();

  // 2. Uploader directement vers Cloudinary avec la signature
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("api_key", api_key);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: "POST", body: formData }
  );

  return res.json();
}
```

---

## 6. Supprimer une image

La suppression nécessite toujours le côté serveur (API Secret requis).

```ts
// app/api/delete-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary-server";

export async function DELETE(req: NextRequest) {
  const { public_id } = await req.json();

  if (!public_id) {
    return NextResponse.json({ error: "public_id manquant" }, { status: 400 });
  }

  const result = await cloudinary.uploader.destroy(public_id);

  // result.result === "ok" si supprimé
  return NextResponse.json(result);
}
```

```ts
// Appel depuis le client
const deleteImage = async (publicId: string) => {
  await fetch("/api/delete-image", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_id: publicId }),
  });
};
```

---

## 7. Transformations d'images (URLs dynamiques)

L'un des points forts de Cloudinary : transformer une image via l'URL.

```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
```

### Exemples de transformations

```ts
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;

const publicId = "uploads/mon-image";

// Redimensionner (largeur 400, hauteur automatique)
const resized = `${BASE}/w_400/${publicId}`;

// Recadrer en carré 300x300
const cropped = `${BASE}/w_300,h_300,c_fill/${publicId}`;

// Qualité auto + format WebP automatique (recommandé)
const optimized = `${BASE}/q_auto,f_auto/${publicId}`;

// Miniature ronde 100x100
const avatar = `${BASE}/w_100,h_100,c_fill,r_max/${publicId}`;

// Combinaisons multiples
const full = `${BASE}/w_800,h_600,c_fill,q_auto,f_auto/${publicId}`;
```

### Paramètres de transformation courants

| Paramètre | Exemple | Description |
|---|---|---|
| `w_` | `w_400` | Largeur en pixels |
| `h_` | `h_300` | Hauteur en pixels |
| `c_` | `c_fill`, `c_fit`, `c_crop` | Mode de recadrage |
| `q_` | `q_auto`, `q_80` | Qualité |
| `f_` | `f_auto`, `f_webp` | Format de sortie |
| `r_` | `r_max`, `r_20` | Border radius |
| `e_` | `e_grayscale`, `e_blur:300` | Effets |
| `g_` | `g_face`, `g_center` | Point de focus (gravity) |

---

## 8. Intégration avec Next.js `<Image />`

```tsx
import Image from "next/image";

// next.config.js — autoriser le domaine Cloudinary
// images: { domains: ["res.cloudinary.com"] }

const publicId = "uploads/mon-image";
const src = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/${publicId}`;

export default function MyImage() {
  return (
    <Image
      src={src}
      alt="Mon image"
      width={800}
      height={600}
      priority
    />
  );
}
```

```js
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;
```

---

## 9. Récapitulatif — Quand utiliser quoi ?

| Besoin | Solution recommandée |
|---|---|
| Upload simple, projet perso | Upload unsigned côté client |
| App en production | Upload signé (signature serveur + upload client) |
| Upload depuis une action serveur | `upload_stream` via Route API |
| Supprimer une image | Toujours via Route API (API Secret) |
| Afficher avec optimisation | URL avec `q_auto,f_auto` |
| Intégration Next.js | `<Image />` + `remotePatterns` |

---

## 10. Bonnes pratiques

- Toujours **stocker le `public_id`** en base de données, pas l'URL complète (les transformations peuvent changer)
- Utiliser `q_auto,f_auto` sur toutes les images affichées (économie de bande passante significative)
- Restreindre les **formats autorisés** dans l'upload preset
- Définir une **taille max** dans l'upload preset (évite les abus)
- Pour une app avec authentification, vérifier que l'utilisateur est connecté **avant** de générer une signature
- Organiser les images avec des **dossiers** (`folder: "users/123/avatars"`)
