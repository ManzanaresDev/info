# Vérifier l'existence d'une adresse email avec Next.js

## Introduction

La vérification d'email se fait en plusieurs niveaux, du plus simple au plus fiable :

1. **Validation du format** (regex côté client)
2. **Vérification syntaxique avancée** (librairie)
3. **Vérification MX DNS** (le domaine peut recevoir des emails)
4. **Vérification SMTP** (la boîte existe vraiment — via une API tierce)

Ce tutoriel couvre toutes ces approches.

---

## Niveau 1 — Validation du format (côté client)

La méthode la plus rapide : vérifier que l'adresse ressemble à un email valide.

```tsx
// utils/validateEmail.ts

export function isValidEmailFormat(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

Utilisation dans un composant React :

```tsx
// components/EmailForm.tsx
"use client";

import { useState } from "react";
import { isValidEmailFormat } from "@/utils/validateEmail";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmailFormat(email)) {
      setError("Format d'email invalide.");
      return;
    }

    setError("");
    alert("Format valide !");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Vérifier</button>
    </form>
  );
}
```

> ⚠️ Cette méthode ne vérifie **pas** que l'adresse existe réellement.

---

## Niveau 2 — Validation avancée avec `zod` ou `validator.js`

### Avec Zod (recommandé dans Next.js)

```bash
npm install zod
```

```ts
// utils/emailSchema.ts
import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

// Utilisation
const result = emailSchema.safeParse({ email: "test@example.com" });

if (!result.success) {
  console.error(result.error.format());
} else {
  console.log("Email valide :", result.data.email);
}
```

### Avec validator.js

```bash
npm install validator
npm install --save-dev @types/validator
```

```ts
import isEmail from "validator/lib/isEmail";

isEmail("test@example.com"); // true
isEmail("pas-un-email");     // false
```

---

## Niveau 3 — Vérification du domaine MX (Route API Next.js)

Cette approche vérifie si le **domaine de l'email peut recevoir des messages** en consultant les enregistrements DNS MX.

### Installation

```bash
npm install dns-query
# ou utiliser le module natif Node.js `dns`
```

### Route API — `app/api/check-email/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Validation du format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { valid: false, reason: "Format invalide" },
      { status: 400 }
    );
  }

  const domain = email.split("@")[1];

  try {
    // Vérifie les enregistrements MX du domaine
    const mxRecords = await dns.resolveMx(domain);

    if (mxRecords && mxRecords.length > 0) {
      return NextResponse.json({
        valid: true,
        domain,
        mx: mxRecords.map((r) => r.exchange),
      });
    } else {
      return NextResponse.json({
        valid: false,
        reason: "Aucun enregistrement MX trouvé",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, reason: "Domaine introuvable ou inaccessible" },
      { status: 422 }
    );
  }
}
```

### Appel depuis le client

```tsx
"use client";

import { useState } from "react";

export default function EmailChecker() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkEmail = async () => {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setResult(data.valid ? `✅ Domaine valide` : `❌ ${data.reason}`);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
      />
      <button onClick={checkEmail} disabled={loading}>
        {loading ? "Vérification..." : "Vérifier"}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
```

> ✅ Cette méthode est **gratuite** et ne nécessite aucune API externe.  
> ⚠️ Elle ne garantit pas que la **boîte mail existe**, seulement que le domaine est configuré pour recevoir des emails.

---

## Niveau 4 — Vérification complète via une API tierce

Pour vérifier qu'une adresse email **existe vraiment** (sans envoyer d'email), il faut passer par un service SMTP spécialisé.

### Services recommandés

| Service | Offre gratuite | Précision |
|---|---|---|
| [Abstract API](https://www.abstractapi.com/email-validation) | 100 req/mois | ⭐⭐⭐⭐ |
| [Hunter.io](https://hunter.io/email-verifier) | 25 req/mois | ⭐⭐⭐⭐⭐ |
| [Mailboxlayer](https://mailboxlayer.com) | 100 req/mois | ⭐⭐⭐⭐ |
| [ZeroBounce](https://www.zerobounce.net) | Payant | ⭐⭐⭐⭐⭐ |

### Exemple avec Abstract API

1. Créez un compte sur [abstractapi.com](https://www.abstractapi.com) et obtenez votre clé API.
2. Ajoutez la clé dans `.env.local` :

```env
ABSTRACT_API_KEY=votre_clé_ici
```

3. Créez la route API :

```ts
// app/api/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const apiKey = process.env.ABSTRACT_API_KEY;
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Champs importants retournés par Abstract API
    const {
      is_valid_format,
      is_mx_found,
      is_smtp_valid,
      is_disposable_email,
      deliverability,
    } = data;

    return NextResponse.json({
      valid: deliverability === "DELIVERABLE",
      details: {
        formatValide: is_valid_format?.value,
        mxTrouvé: is_mx_found?.value,
        smtpValide: is_smtp_valid?.value,
        emailJetable: is_disposable_email?.value,
        livraison: deliverability,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
```

### Réponse type de l'API

```json
{
  "valid": true,
  "details": {
    "formatValide": true,
    "mxTrouvé": true,
    "smtpValide": true,
    "emailJetable": false,
    "livraison": "DELIVERABLE"
  }
}
```

---

## Bonus — Détecter les emails jetables

Si vous souhaitez bloquer les adresses temporaires (Mailinator, Temp-mail, etc.) sans API payante :

```bash
npm install disposable-email-domains
```

```ts
// utils/isDisposable.ts
import disposableDomains from "disposable-email-domains";

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}
```

```ts
// Exemple d'utilisation dans une route API
import { isDisposableEmail } from "@/utils/isDisposable";

if (isDisposableEmail(email)) {
  return NextResponse.json(
    { valid: false, reason: "Les adresses email temporaires ne sont pas acceptées." },
    { status: 400 }
  );
}
```

---

## Récapitulatif

| Méthode | Complexité | Fiabilité | Coût |
|---|---|---|---|
| Regex / format | ⭐ Très simple | Faible | Gratuit |
| Zod / validator.js | ⭐ Simple | Faible | Gratuit |
| Vérification MX DNS | ⭐⭐ Moyenne | Moyenne | Gratuit |
| API tierce (SMTP) | ⭐⭐⭐ Avancée | Élevée | Freemium |

### Recommandation

Pour la plupart des projets :
- **Formulaire d'inscription** → Zod pour le format + vérification MX côté serveur
- **Campagnes email / CRM** → API tierce (Hunter.io ou Abstract API)
- **Bloquer les abus** → Filtre emails jetables en complément
