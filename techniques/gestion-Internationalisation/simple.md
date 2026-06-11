# Internationalisation Next.js — Guide simplifié

## Ce qu'on va faire

Gérer plusieurs langues via l'URL (`/fr`, `/es`) sans lib, sans cookie, sans hook.

---

## Structure du projet

```
/app
  page.tsx           ← redirige vers /fr par défaut
  /[lang]
    layout.tsx       ← layout commun à toutes les langues
    page.tsx         ← page d'accueil
/locales
  fr.json
  es.json
/lib
  i18n.ts            ← helper pour charger les traductions
/components
  LangSwitcher.tsx   ← boutons FR / ES
```

---

## Étape 1 — Les fichiers de traductions

```json
// locales/fr.json
{
  "welcome": "Bienvenue",
  "description": "Ceci est mon application"
}
```

```json
// locales/es.json
{
  "welcome": "Bienvenido",
  "description": "Esta es mi aplicación"
}
```

---

## Étape 2 — Le helper de traduction

```ts
// lib/i18n.ts
export async function getTranslations(lang: string) {
  return (await import(`../locales/${lang}.json`)).default;
}
```

---

## Étape 3 — La redirection par défaut

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';

export default function Root() {
  redirect('/fr');
}
```

---

## Étape 4 — Le layout

```tsx
// app/[lang]/layout.tsx
export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Étape 5 — Une page avec traductions

```tsx
// app/[lang]/page.tsx
import { getTranslations } from '@/lib/i18n';
import LangSwitcher from '@/components/LangSwitcher';

export default async function Home({
  params,
}: {
  params: { lang: string };
}) {
  const t = await getTranslations(params.lang);

  return (
    <main>
      <LangSwitcher />
      <h1>{t.welcome}</h1>
      <p>{t.description}</p>
    </main>
  );
}
```

---

## Étape 6 — Le sélecteur de langue

```tsx
// components/LangSwitcher.tsx
import Link from 'next/link';

export default function LangSwitcher() {
  return (
    <nav>
      <Link href="/fr">FR</Link>
      <Link href="/es">ES</Link>
    </nav>
  );
}
```

---

## Ajouter une nouvelle langue

1. Créer `locales/de.json` avec les traductions
2. Ajouter `<Link href="/de">DE</Link>` dans `LangSwitcher.tsx`

C'est tout.

---

## Résumé

| Fichier | Rôle |
|---|---|
| `app/page.tsx` | Redirige `/` → `/fr` |
| `app/[lang]/layout.tsx` | Layout avec `lang` dans `<html>` |
| `app/[lang]/page.tsx` | Page qui charge les traductions |
| `locales/fr.json` | Textes en français |
| `locales/es.json` | Textes en espagnol |
| `lib/i18n.ts` | Charge le bon fichier JSON |
| `components/LangSwitcher.tsx` | Liens vers `/fr` et `/es` |

> Aucune dépendance supplémentaire. La langue vit dans l'URL, c'est tout.
