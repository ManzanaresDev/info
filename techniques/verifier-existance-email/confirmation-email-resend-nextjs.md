# Vérification d'email par lien de confirmation avec Resend + Next.js

## Comment ça fonctionne

Le flux de vérification par email est le suivant :

```
Utilisateur entre son email
        ↓
Génération d'un token unique (stocké en DB)
        ↓
Envoi d'un email avec un lien contenant le token (via Resend)
        ↓
L'utilisateur clique sur le lien
        ↓
Next.js vérifie le token → marque l'email comme vérifié
```

---

## Prérequis

- Un compte [Resend](https://resend.com) (gratuit : 3 000 emails/mois)
- Un domaine vérifié dans Resend (ou utiliser `onboarding@resend.dev` pour les tests)
- Une base de données (exemple avec **Prisma + PostgreSQL**, adaptable)

---

## Installation

```bash
npm install resend
npm install @prisma/client prisma
npm install crypto  # natif Node.js, pas besoin d'install
```

---

## Étape 1 — Configurer Resend

Créez un compte sur [resend.com](https://resend.com), générez une clé API, puis ajoutez-la dans `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Étape 2 — Schéma de base de données (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   Boolean   @default(false)
  createdAt       DateTime  @default(now())
  verificationTokens EmailVerificationToken[]
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name add_email_verification
```

---

## Étape 3 — Utilitaire : générer un token

```ts
// lib/token.ts
import crypto from "crypto";

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getTokenExpiry(hours = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
```

---

## Étape 4 — Utilitaire : envoyer l'email avec Resend

```ts
// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "Mon App <noreply@tondomaine.com>", // ou onboarding@resend.dev pour les tests
    to: email,
    subject: "Confirmez votre adresse email",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2>Confirmez votre email</h2>
        <p>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            background-color: #0070f3;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 16px 0;
          "
        >
          Confirmer mon email
        </a>
        <p style="color: #666; font-size: 14px;">
          Ce lien expire dans 24 heures.<br/>
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Ou copiez ce lien dans votre navigateur :<br/>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Erreur Resend : ${error.message}`);
  }

  return data;
}
```

---

## Étape 5 — Route API : inscription + envoi de l'email

```ts
// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken, getTokenExpiry } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validation du format
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const { email } = result.data;

  try {
    // Vérifie si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    // Crée ou récupère l'utilisateur
    const user = existingUser ?? await prisma.user.create({ data: { email } });

    // Supprime les anciens tokens pour cet utilisateur
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Génère un nouveau token
    const token = generateVerificationToken();
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: getTokenExpiry(24),
      },
    });

    // Envoie l'email de confirmation
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: "Un email de confirmation a été envoyé.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
```

---

## Étape 6 — Route API : vérification du token

```ts
// app/api/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/error?reason=missing-token", req.url));
  }

  try {
    // Cherche le token en base
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Token introuvable
    if (!verificationToken) {
      return NextResponse.redirect(new URL("/auth/error?reason=invalid-token", req.url));
    }

    // Token expiré
    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      return NextResponse.redirect(new URL("/auth/error?reason=expired-token", req.url));
    }

    // Marque l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Supprime le token utilisé
    await prisma.emailVerificationToken.delete({ where: { token } });

    // Redirige vers une page de succès
    return NextResponse.redirect(new URL("/auth/verified", req.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/auth/error?reason=server-error", req.url));
  }
}
```

---

## Étape 7 — Pages de résultat

### Page de succès

```tsx
// app/auth/verified/page.tsx
export default function VerifiedPage() {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <h1>✅ Email confirmé !</h1>
      <p>Votre adresse email a bien été vérifiée. Vous pouvez maintenant vous connecter.</p>
      <a href="/login">Se connecter</a>
    </div>
  );
}
```

### Page d'erreur

```tsx
// app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  "missing-token": "Le lien est incomplet.",
  "invalid-token": "Ce lien de vérification est invalide.",
  "expired-token": "Ce lien a expiré. Veuillez vous réinscrire pour en recevoir un nouveau.",
  "server-error": "Une erreur est survenue. Réessayez plus tard.",
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "server-error";

  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <h1>❌ Erreur de vérification</h1>
      <p>{messages[reason] ?? messages["server-error"]}</p>
      <a href="/register">Recommencer</a>
    </div>
  );
}
```

---

## Étape 8 — Formulaire d'inscription (client)

```tsx
// app/register/page.tsx
"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("sent");
      setMessage(data.message);
    } else {
      setStatus("error");
      setMessage(data.error);
    }
  };

  if (status === "sent") {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <h2>📬 Vérifiez votre boîte mail</h2>
        <p>{message}</p>
        <p style={{ color: "#666" }}>Le lien expire dans 24 heures.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "60px auto", padding: 24 }}>
      <h2>Créer un compte</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
      />
      {status === "error" && <p style={{ color: "red" }}>{message}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        style={{ width: "100%", padding: 10, background: "#0070f3", color: "white", border: "none", borderRadius: 6 }}
      >
        {status === "loading" ? "Envoi en cours..." : "S'inscrire"}
      </button>
    </form>
  );
}
```

---

## Bonus — Template email avec React Email (optionnel)

Resend supporte les composants React Email pour des emails plus maintenables :

```bash
npm install @react-email/components react-email
```

```tsx
// emails/VerificationEmail.tsx
import {
  Html, Head, Body, Container, Heading,
  Text, Button, Hr, Link
} from "@react-email/components";

interface Props {
  verifyUrl: string;
  email: string;
}

export function VerificationEmail({ verifyUrl, email }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ background: "white", padding: 24, borderRadius: 8, maxWidth: 560 }}>
          <Heading>Confirmez votre email</Heading>
          <Text>Bonjour,</Text>
          <Text>
            Merci de vous être inscrit avec <strong>{email}</strong>.
            Cliquez ci-dessous pour confirmer votre adresse.
          </Text>
          <Button
            href={verifyUrl}
            style={{ background: "#0070f3", color: "white", padding: "12px 24px", borderRadius: 6 }}
          >
            Confirmer mon email
          </Button>
          <Hr />
          <Text style={{ color: "#999", fontSize: 12 }}>
            Ce lien expire dans 24h. Si vous n'avez pas créé de compte, ignorez cet email.
          </Text>
          <Link href={verifyUrl} style={{ fontSize: 12, color: "#999" }}>{verifyUrl}</Link>
        </Container>
      </Body>
    </Html>
  );
}
```

Utilisation dans `sendVerificationEmail` :

```ts
import { render } from "@react-email/render";
import { VerificationEmail } from "@/emails/VerificationEmail";

const html = render(<VerificationEmail verifyUrl={verifyUrl} email={email} />);

await resend.emails.send({
  from: "Mon App <noreply@tondomaine.com>",
  to: email,
  subject: "Confirmez votre adresse email",
  html,
});
```

---

## Récapitulatif de la structure de fichiers

```
app/
├── api/
│   ├── register/route.ts       ← Inscription + envoi email
│   └── verify-email/route.ts  ← Vérification du token
├── auth/
│   ├── verified/page.tsx       ← Page de succès
│   └── error/page.tsx          ← Page d'erreur
└── register/page.tsx           ← Formulaire

lib/
├── email.ts                    ← Envoi via Resend
├── token.ts                    ← Génération de tokens
└── prisma.ts                   ← Client Prisma

emails/
└── VerificationEmail.tsx       ← Template React Email (optionnel)

prisma/
└── schema.prisma               ← Modèles User + Token
```

---

## Sécurité — Points importants

- Les tokens sont générés avec `crypto.randomBytes(32)` : 256 bits d'entropie, non prédictibles.
- Chaque token est à usage unique : il est supprimé après utilisation.
- Les tokens expirent après 24 heures.
- Les anciens tokens sont supprimés à chaque nouvelle inscription pour éviter les doublons.
- Ne jamais exposer le token dans les logs côté serveur.
