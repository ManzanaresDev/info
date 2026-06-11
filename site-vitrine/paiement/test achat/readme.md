# Tester Stripe en local + Envoi de fichier après paiement — OldBooks

---

## Partie 1 — Tester Stripe en local avec Stripe CLI

### 1.1 Installer la CLI Stripe

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (avec Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget -qO- https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe
```

### 1.2 Se connecter à Stripe

```bash
stripe login
```

Un lien s'ouvre dans le navigateur, tu confirmes l'accès à ton compte Stripe.

### 1.3 Écouter les webhooks en local

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

La CLI affiche dans le terminal :

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Copie ce secret dans ton `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.4 Simuler un paiement réussi

Lance ton serveur Next.js dans un autre terminal :

```bash
npm run dev
```

Puis simule un paiement depuis la CLI :

```bash
stripe trigger checkout.session.completed
```

Tu verras dans le terminal de la CLI :

```
✅ checkout.session.completed → POST http://localhost:3000/api/webhook [200]
```

Et dans ta base MongoDB, la commande passe de `pending` à `paid`.

### 1.5 Carte de test Stripe

Quand tu passes par la vraie page Stripe Checkout en local, utilise ces coordonnées :

| Champ | Valeur |
|---|---|
| Numéro de carte | `4242 4242 4242 4242` |
| Date d'expiration | N'importe quelle date future |
| CVC | N'importe quel code à 3 chiffres |
| Nom | N'importe quoi |

Pour simuler un **paiement refusé** : `4000 0000 0000 0002`
Pour simuler une **authentification 3D Secure** : `4000 0025 0000 3155`

---

## Partie 2 — Envoyer un fichier PDF après paiement

L'idée est simple : quand Stripe confirme le paiement via le webhook, tu envoies un email avec un lien de téléchargement sécurisé vers le fichier stocké dans Firebase Storage.

### Flux complet

```
Webhook checkout.session.completed
  → Récupère la commande dans MongoDB
  → Génère un lien signé Firebase Storage (valable 24h)
  → Envoie l'email avec le lien via Resend (ou Nodemailer)
```

### 2.1 Installation

```bash
npm install resend        # service d'envoi d'email simple
npm install firebase-admin  # SDK Firebase côté serveur pour les liens signés
```

### 2.2 Initialiser Firebase Admin

Firebase Admin permet de générer des liens signés temporaires côté serveur, sans exposer les credentials.

```ts
// src/lib/firebase-admin.ts
import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

export const adminStorage = admin.storage()
```

Variables à ajouter dans `.env.local` (disponibles dans Console Firebase → Paramètres → Comptes de service → Générer une clé privée) :

```env
FIREBASE_ADMIN_PROJECT_ID=ton-projet
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxx@ton-projet.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2.3 Initialiser Resend

```ts
// src/lib/resend.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

> Clé disponible sur **resend.com** après création d'un compte gratuit (3 000 emails/mois offerts).

### 2.4 Mettre à jour le Webhook

```ts
// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminStorage } from '@/lib/firebase-admin'
import { resend } from '@/lib/resend'
import connectDB from '@/lib/mongoose'
import Order from '@/models/order'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession

    await connectDB()

    // 1. Récupère la commande dans MongoDB
    const order = await Order.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'paid' },
      { new: true }
    )

    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

    // 2. Génère un lien signé Firebase Storage valable 24h
    //    Le fichier PDF doit être stocké dans Firebase Storage sous : pdfs/{libroId}.pdf
    const bucket = adminStorage.bucket()
    const file = bucket.file(`pdfs/${order.libroId}.pdf`)

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
    })

    // 3. Envoie l'email avec le lien
    await resend.emails.send({
      from: 'OldBooks <noreply@ton-domaine.com>',
      to: order.customerEmail,
      subject: `Votre livre : ${order.titulo}`,
      html: `
        <h2>Merci pour votre achat !</h2>
        <p>Votre livre <strong>${order.titulo}</strong> est prêt à être téléchargé.</p>
        <p>
          <a href="${signedUrl}" style="background:#f59e0b;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
            Télécharger mon livre (PDF)
          </a>
        </p>
        <p><small>Ce lien est valable 24 heures.</small></p>
      `,
    })
  }

  return NextResponse.json({ received: true })
}
```

### 2.5 Organisation des fichiers dans Firebase Storage

```
firebase-storage/
├── images/          ← images des livres (couvertures)
│   ├── livre-123-1.jpg
│   └── livre-123-2.jpg
└── pdfs/            ← fichiers PDF à envoyer après achat (non publics)
    ├── {libroId}.pdf
    └── ...
```

> ⚠️ Les fichiers dans `pdfs/` ne doivent **pas** être accessibles publiquement. Configure les règles Firebase Storage pour bloquer l'accès public à ce dossier — seul Firebase Admin (ton serveur) peut y générer des liens signés.

Règles Firebase Storage à appliquer :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Images publiques en lecture
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // PDFs privés — aucun accès direct
    match /pdfs/{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Récapitulatif du flux complet

```
1. L'utilisateur clique "Acheter" sur la page du livre
2. POST /api/checkout → session Stripe créée + commande "pending" en MongoDB
3. Redirection vers la page de paiement Stripe
4. L'utilisateur paye avec sa carte
5. Stripe appelle POST /api/webhook (checkout.session.completed)
6. Commande → "paid" dans MongoDB
7. Lien signé généré depuis Firebase Storage (valable 24h)
8. Email envoyé au client avec le lien de téléchargement
9. L'utilisateur est redirigé vers /commande/succes
```
