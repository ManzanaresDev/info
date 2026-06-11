# 📡 Créer des endpoints API dans Next.js (App Router)

Dans Next.js App Router, un endpoint API se crée avec un fichier `route.ts` dans le dossier `app/api/`.

---

## Structure des fichiers

```
app/
└── api/
    └── mon-endpoint/
        └── route.ts
```

---

## Exemple de base

```typescript
// app/api/mon-endpoint/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ recu: body });
}
```

> Accessible sur `http://localhost:3000/api/mon-endpoint`

---

## Les méthodes HTTP disponibles

```typescript
export async function GET(request: Request) {}
export async function POST(request: Request) {}
export async function PUT(request: Request) {}
export async function DELETE(request: Request) {}
export async function PATCH(request: Request) {}
```

---

## Avec paramètre dynamique

```
app/api/users/[id]/route.ts
```

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  return NextResponse.json({ userId: id });
}
```

> Accessible sur `/api/users/123`

---

## Récupérer les query params

```typescript
// /api/users?nom=Marco
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nom = searchParams.get("nom");

  return NextResponse.json({ nom });
}
```

---

## Retourner différents status codes

```typescript
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email) {
    return NextResponse.json(
      { error: "Email requis" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## Codes de statut courants

| Code | Signification |
|---|---|
| `200` | OK (défaut) |
| `201` | Créé avec succès |
| `400` | Mauvaise requête |
| `401` | Non authentifié |
| `403` | Interdit |
| `404` | Non trouvé |
| `500` | Erreur serveur |

---

## Récapitulatif des cas d'usage

| Besoin | Solution |
|---|---|
| Route simple | `app/api/mon-endpoint/route.ts` |
| Route avec paramètre | `app/api/users/[id]/route.ts` |
| Query params | `new URL(request.url).searchParams` |
| Lire le body | `await request.json()` |
| Retourner du JSON | `NextResponse.json({ ... })` |
| Définir un status code | `NextResponse.json({}, { status: 400 })` |
