# Manuel — Barre de Progression Upload & Download

---

## 1. Pourquoi `fetch` ne suffit pas pour l'upload ?

`fetch` est l'API moderne pour les requêtes HTTP, mais elle a une limitation importante :

| Opération | `fetch` | `XMLHttpRequest` |
|---|---|---|
| Suivi progression **upload** | ❌ Non supporté | ✅ `xhr.upload.progress` |
| Suivi progression **download** | ✅ Via `ReadableStream` | ✅ `xhr.progress` |
| Syntaxe | Moderne / async-await | Ancienne mais fonctionnelle |
| Annulation | ✅ `AbortController` | ✅ `xhr.abort()` |

> **Règle simple :**
> - Upload avec progression → **`XMLHttpRequest`**
> - Download avec progression → **`fetch` + `ReadableStream`** ou `XMLHttpRequest`

---

## 2. Barre de progression — Upload

### Fonction utilitaire générique

```ts
// lib/upload-with-progress.ts

interface UploadOptions {
  url: string;
  formData: FormData;
  onProgress?: (percent: number) => void;
  onComplete?: (response: any) => void;
  onError?: (error: Error) => void;
}

export function uploadWithProgress({
  url,
  formData,
  onProgress,
  onComplete,
  onError,
}: UploadOptions): XMLHttpRequest {
  const xhr = new XMLHttpRequest();

  // ✅ Événement de progression (se déclenche pendant l'envoi)
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress?.(percent);
    }
  });

  // ✅ Upload terminé
  xhr.addEventListener("load", () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        onComplete?.(data);
      } catch {
        onComplete?.(xhr.responseText);
      }
    } else {
      onError?.(new Error(`Erreur HTTP ${xhr.status}`));
    }
  });

  // ✅ Erreur réseau
  xhr.addEventListener("error", () => {
    onError?.(new Error("Erreur réseau"));
  });

  // ✅ Upload annulé
  xhr.addEventListener("abort", () => {
    onError?.(new Error("Upload annulé"));
  });

  xhr.open("POST", url);
  xhr.send(formData);

  // On retourne xhr pour pouvoir l'annuler si besoin
  return xhr;
}
```

### Version Promise (async/await compatible)

```ts
// lib/upload-with-progress.ts

export function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): { promise: Promise<any>; abort: () => void } {
  let xhr: XMLHttpRequest;

  const promise = new Promise((resolve, reject) => {
    xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Erreur HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Erreur réseau")));
    xhr.addEventListener("abort", () => reject(new Error("Upload annulé")));

    xhr.open("POST", url);
    xhr.send(formData);
  });

  return {
    promise,
    abort: () => xhr.abort(), // ✅ permet d'annuler depuis l'extérieur
  };
}
```

### Utilisation avec Cloudinary

```ts
// lib/cloudinary-upload.ts
import { uploadWithProgress } from "./upload-with-progress";
import { CloudinaryConfig } from "@/config/cloudinary";

export function uploadImageToCloudinary(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CloudinaryConfig.preset);
  formData.append("folder", "avatars");
  formData.append("public_id", userId);

  const url = `${CloudinaryConfig.url}${CloudinaryConfig.cloud}/image/upload`;

  return uploadWithProgress(url, formData, onProgress);
}
```

### Composant React — Upload avec barre de progression

```tsx
// components/UploadWithProgress.tsx
"use client";

import { useState, useRef } from "react";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

export default function UploadWithProgress() {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setProgress(0);

    const { promise, abort } = uploadImageToCloudinary(
      file,
      "user-123",
      (percent) => setProgress(percent)
    );

    // Stocker abort pour pouvoir annuler
    abortRef.current = abort;

    try {
      const data = await promise;
      setImageUrl(data.secure_url);
      setStatus("done");
    } catch (error: any) {
      if (error.message === "Upload annulé") {
        setStatus("idle");
      } else {
        setStatus("error");
      }
    }
  };

  const handleCancel = () => {
    abortRef.current?.();
    setProgress(0);
    setStatus("idle");
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={status === "uploading"}
      />

      {/* Barre de progression */}
      {status === "uploading" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Upload en cours...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-red-500 underline"
          >
            Annuler
          </button>
        </div>
      )}

      {status === "done" && (
        <p className="text-green-500">✅ Upload terminé !</p>
      )}

      {status === "error" && (
        <p className="text-red-500">❌ Erreur lors de l'upload.</p>
      )}

      {imageUrl && <img src={imageUrl} alt="Uploadée" width={200} />}
    </div>
  );
}
```

---

## 3. Barre de progression — Download

Pour le download, `fetch` supporte nativement la progression via `ReadableStream`.

### Principe

```
fetch(url)
  └─ response.body          → ReadableStream
       └─ reader.read()     → chunks successifs
            └─ loaded / total → pourcentage
```

> **Important** : la progression n'est possible que si le serveur renvoie un header
> `Content-Length` dans sa réponse. Sans ce header, `total` vaut `0` et le
> pourcentage ne peut pas être calculé.

### Fonction utilitaire générique

```ts
// lib/download-with-progress.ts

interface DownloadOptions {
  url: string;
  onProgress?: (percent: number) => void;
}

export async function downloadWithProgress({
  url,
  onProgress,
}: DownloadOptions): Promise<Blob> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }

  // Récupérer la taille totale depuis le header
  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    throw new Error("ReadableStream non supporté");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;

    // Calcul du pourcentage (seulement si Content-Length disponible)
    if (total > 0) {
      const percent = Math.round((loaded / total) * 100);
      onProgress?.(percent);
    }
  }

  // Reconstituer le fichier complet
  return new Blob(chunks);
}
```

### Télécharger un fichier avec progression

```ts
// lib/download-file.ts
import { downloadWithProgress } from "./download-with-progress";

export async function downloadFile(
  url: string,
  filename: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const blob = await downloadWithProgress({ url, onProgress });

  // Déclencher le téléchargement dans le navigateur
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();

  // Nettoyer
  URL.revokeObjectURL(objectUrl);
}
```

### Composant React — Download avec barre de progression

```tsx
// components/DownloadWithProgress.tsx
"use client";

import { useState } from "react";
import { downloadFile } from "@/lib/download-file";

interface Props {
  url: string;
  filename: string;
  label?: string;
}

export default function DownloadWithProgress({
  url,
  filename,
  label = "Télécharger",
}: Props) {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "downloading" | "done" | "error">("idle");

  const handleDownload = async () => {
    setStatus("downloading");
    setProgress(0);

    try {
      await downloadFile(url, filename, (percent) => setProgress(percent));
      setStatus("done");
    } catch (error) {
      console.error("Erreur download:", error);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={status === "downloading"}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {status === "downloading" ? "Téléchargement..." : label}
      </button>

      {/* Barre de progression */}
      {status === "downloading" && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Téléchargement en cours...</span>
            <span>{progress > 0 ? `${progress}%` : "..."}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-200"
              style={{ width: progress > 0 ? `${progress}%` : "100%" }}
              // ↑ Si pas de Content-Length, animation infinie en fallback
            />
          </div>
        </div>
      )}

      {status === "done" && <p className="text-green-500 text-sm">✅ Téléchargement terminé !</p>}
      {status === "error" && <p className="text-red-500 text-sm">❌ Erreur lors du téléchargement.</p>}
    </div>
  );
}
```

---

## 4. Cas particulier — Pas de `Content-Length` (fallback)

Certains serveurs (dont Cloudinary) ne renvoient pas toujours `Content-Length`.
Dans ce cas, impossible de calculer un vrai pourcentage. Deux solutions :

### Option A — Barre indéterminée (animation CSS)

```tsx
{/* Barre qui défile de gauche à droite en boucle */}
{status === "downloading" && (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div className="h-2 bg-blue-500 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
  </div>
)}
```

```css
/* globals.css */
@keyframes progress {
  0%   { width: 0%;   margin-left: 0%; }
  50%  { width: 60%;  margin-left: 20%; }
  100% { width: 0%;   margin-left: 100%; }
}
```

### Option B — Progresser sur les octets reçus sans total

```ts
// Afficher les Mo reçus plutôt qu'un pourcentage
const loadedMB = (loaded / 1024 / 1024).toFixed(1);
onProgress?.(`${loadedMB} Mo reçus`);
```

---

## 5. Récapitulatif

| Besoin | Solution |
|---|---|
| **Upload** avec progression | `XMLHttpRequest` + `xhr.upload.progress` |
| **Download** avec progression | `fetch` + `ReadableStream` |
| Annuler un upload | `xhr.abort()` |
| Annuler un download | `AbortController` + `signal` passé à `fetch` |
| Serveur sans `Content-Length` | Barre indéterminée (animation CSS) |
| Compatible async/await | Envelopper `XHR` dans une `Promise` |

---

## 6. Bonnes pratiques

- Toujours gérer l'état **`"idle" | "uploading" | "done" | "error"`** plutôt qu'un simple booléen `isLoading`
- Proposer un bouton **Annuler** pendant l'upload (UX importante sur mobile ou connexion lente)
- Réinitialiser la progression à `0` avant chaque nouvel upload
- Utiliser `transition-all duration-200` sur la barre pour un rendu fluide
- Vérifier la présence de `Content-Length` avant de calculer un pourcentage, sinon basculer sur une barre indéterminée
- Sur mobile, limiter la taille du fichier **avant** l'upload (évite d'attendre pour rien)
