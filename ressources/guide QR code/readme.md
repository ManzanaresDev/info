# Manuel — QR Code dans tes projets Next.js / React

---

## 1. Installation

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

---

## 2. Utilisation côté client (composant React)

La génération de QR code se fait dans le navigateur via un `<canvas>`. Le composant doit être **client** (`"use client"`).

```tsx
"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function MonQrCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, "https://mon-site.com/ma-page", {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",   // couleur des pixels
        light: "#ffffff",  // couleur du fond
      },
    });
  }, []);

  return <canvas ref={canvasRef} />;
}
```

---

## 3. Générer une image PNG (Data URL)

Utile pour afficher avec une balise `<img>` ou télécharger.

```tsx
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrImage() {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL("https://mon-site.com/ma-page", {
      width: 300,
      margin: 2,
    }).then(setSrc);
  }, []);

  return src ? <img src={src} alt="QR Code" /> : null;
}
```

---

## 4. Générer côté serveur (Node.js / API Route)

Dans une API Route Next.js, on peut générer le QR en tant que buffer PNG et le renvoyer directement.

```ts
// app/api/qr/route.ts
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") ?? "https://mon-site.com";

  const buffer = await QRCode.toBuffer(url, {
    width: 300,
    margin: 2,
  });

  return new NextResponse(buffer, {
    headers: { "Content-Type": "image/png" },
  });
}
```

Appel depuis le navigateur :

```
/api/qr?url=https://mon-site.com/es/avis
```

---

## 5. Options disponibles

| Option | Type | Défaut | Description |
|---|---|---|---|
| `width` | number | 256 | Taille en pixels |
| `margin` | number | 4 | Bordure blanche autour du QR |
| `color.dark` | string (hex) | `#000000` | Couleur des modules |
| `color.light` | string (hex) | `#ffffff` | Couleur du fond |
| `errorCorrectionLevel` | `L` `M` `Q` `H` | `M` | Tolérance aux erreurs |
| `type` | `image/png` `image/jpeg` `image/webp` | `image/png` | Format (toDataURL) |
| `scale` | number | 4 | Multiplicateur de taille |

### Niveaux de correction d'erreur

| Niveau | Récupération | Usage |
|---|---|---|
| `L` | 7% | QR propre, sans logo |
| `M` | 15% | Usage standard |
| `Q` | 25% | Avec petit logo au centre |
| `H` | 30% | Avec grand logo, conditions difficiles |

---

## 6. QR code avec logo au centre

Pour intégrer un logo, superpose-le sur le canvas après génération. Utilise le niveau `H` pour compenser les pixels cachés.

```tsx
"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrAvecLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, "https://mon-site.com", {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#2c3a20", light: "#f5f0e8" },
    }).then(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const logo = new Image();
      logo.src = "/logo.png";
      logo.onload = () => {
        const logoSize = 60;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;

        // Fond blanc derrière le logo
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, 8);
        ctx.fill();

        ctx.drawImage(logo, x, y, logoSize, logoSize);
      };
    });
  }, []);

  return <canvas ref={canvasRef} />;
}
```

---

## 7. Télécharger le QR code

```tsx
function telecharger(canvas: HTMLCanvasElement) {
  const lien = document.createElement("a");
  lien.download = "qrcode.png";
  lien.href = canvas.toDataURL("image/png");
  lien.click();
}
```

---

## 8. URL dynamique selon la langue

Pour adapter l'URL selon la locale de ton app Next.js :

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";

export default function QrAvis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useParams();
  const locale = params?.locale ?? "es";

  useEffect(() => {
    if (!canvasRef.current) return;

    const url = `https://mon-site.com/${locale}/avis`;

    QRCode.toCanvas(canvasRef.current, url, {
      width: 200,
      margin: 1,
      color: { dark: "#2c3a20", light: "#f5f0e8" },
    });
  }, [locale]);

  return <canvas ref={canvasRef} />;
}
```

---

## 9. Récapitulatif des méthodes

| Méthode | Retourne | Usage |
|---|---|---|
| `QRCode.toCanvas(canvas, url, options)` | `Promise<void>` | Rendu direct dans `<canvas>` |
| `QRCode.toDataURL(url, options)` | `Promise<string>` | Src pour balise `<img>` |
| `QRCode.toBuffer(url, options)` | `Promise<Buffer>` | API Route, fichier PNG |
| `QRCode.toString(url, options)` | `Promise<string>` | SVG ou texte terminal |

---

## 10. Erreurs courantes

**`window is not defined`** — tu utilises `qrcode` dans un Server Component. Ajoute `"use client"` en haut du fichier.

**QR illisible** — augmente `width` (minimum 150px pour un scan fiable) ou réduis `margin` à 1.

**Logo qui casse la lecture** — passe `errorCorrectionLevel` à `"H"` et limite le logo à 30% de la surface du QR.

**Couleurs inversées** — `dark` = couleur des pixels (doit être foncée), `light` = fond (doit être clair). Ne pas inverser.
