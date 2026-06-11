# Manuel d’internationalisation — Next.js App Router (sans middleware)

> Guide complet pour mettre en place le multilingue avec `next-intl` dans Next.js App Router, sans redirection automatique et avec sélection manuelle de la langue.

---

# Table des matières

1. Installation
2. Structure du projet
3. Fichiers de traduction
4. Configuration `next-intl`
5. Configuration `next.config.ts`
6. Layout multilingue
7. Utilisation dans les composants
8. Variables dynamiques et pluriels
9. Sélecteur de langue manuel
10. Génération statique des locales
11. SEO multilingue
12. Checklist finale

---

# 1. Installation

Installer `next-intl` :

```bash
npm install next-intl
```

---

# 2. Structure du projet

```text
mon-projet/
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       └── about/
│           └── page.tsx
│
├── components/
│   └── LanguageSwitcher.tsx
│
├── messages/
│   ├── fr.json
│   └── en.json
│
├── src/
│   └── i18n.ts
│
├── next.config.ts
│
└── package.json
```

---

# 3. Fichiers de traduction

Créer un fichier JSON par langue.

## `messages/fr.json`

```json
{
  "nav": {
    "home": "Accueil",
    "about": "À propos"
  },

  "home": {
    "title": "Bienvenue",
    "subtitle": "Bienvenue sur notre site",
    "button": "Commencer"
  },

  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "welcome": "Bonjour {name}"
  }
}
```

---

## `messages/en.json`

```json
{
  "nav": {
    "home": "Home",
    "about": "About"
  },

  "home": {
    "title": "Welcome",
    "subtitle": "Welcome to our website",
    "button": "Get started"
  },

  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "welcome": "Hello {name}"
  }
}
```

---

# 4. Configuration `next-intl`

Créer :

```text
src/i18n.ts
```

## `src/i18n.ts`

```ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

---

# 5. Configuration `next.config.ts`

Créer ou modifier :

```text
next.config.ts
```

## `next.config.ts`

```ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

---

# 6. Layout multilingue

Créer :

```text
app/[locale]/layout.tsx
```

## `app/[locale]/layout.tsx`

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["fr", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

# 7. Utilisation dans les composants

---

## Server Component

### `app/[locale]/page.tsx`

```tsx
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main>
      <h1>{t("title")}</h1>

      <p>{t("subtitle")}</p>

      <button>{t("button")}</button>
    </main>
  );
}
```

---

## Client Component

### `components/SaveButton.tsx`

```tsx
"use client";

import { useTranslations } from "next-intl";

export default function SaveButton() {
  const t = useTranslations("common");

  return <button>{t("save")}</button>;
}
```

---

# 8. Variables dynamiques et pluriels

---

## Variables dynamiques

### JSON

```json
{
  "common": {
    "welcome": "Bonjour {name}"
  }
}
```

### Utilisation

```tsx
t("welcome", {
  name: "Marcos",
});
```

Résultat :

```text
Bonjour Marcos
```

---

## Gestion des pluriels

### JSON

```json
{
  "common": {
    "messages": "{count, plural, =0 {Aucun message} one {# message} other {# messages}}"
  }
}
```

### Utilisation

```tsx
t("messages", { count: 0 });
t("messages", { count: 1 });
t("messages", { count: 5 });
```

Résultats :

```text
Aucun message
1 message
5 messages
```

---

# 9. Sélecteur de langue manuel

Créer :

```text
components/LanguageSwitcher.tsx
```

## `components/LanguageSwitcher.tsx`

```tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();

  const pathname = usePathname();

  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);

    router.push(newPath);
  };

  return (
    <div>
      <button onClick={() => switchLocale("fr")}>FR</button>

      <button onClick={() => switchLocale("en")}>EN</button>
    </div>
  );
}
```

---

# 10. Génération statique des locales

Déjà incluse dans le layout :

```tsx
export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}
```

Cela permet à Next.js de générer :

```text
/fr
/en
```

au build.

---

# 11. SEO multilingue

---

## Métadonnées localisées

### `app/[locale]/page.tsx`

```tsx
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "home",
  });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}
```

---

## Balises hreflang

Dans le layout :

```tsx
<head>
  <link rel="alternate" hrefLang="fr" href="https://monsite.com/fr" />

  <link rel="alternate" hrefLang="en" href="https://monsite.com/en" />
</head>
```

---

# 12. Checklist finale

## Configuration

- [ ] `next-intl` installé
- [ ] `src/i18n.ts` créé
- [ ] `next.config.ts` configuré
- [ ] dossier `app/[locale]` créé
- [ ] `layout.tsx` configuré

---

## Traductions

- [ ] `messages/fr.json`
- [ ] `messages/en.json`
- [ ] clés identiques dans chaque langue

---

## Composants

- [ ] `getTranslations()` dans les Server Components
- [ ] `useTranslations()` dans les Client Components
- [ ] switcher de langue ajouté

---

## SEO

- [ ] `generateMetadata`
- [ ] `hreflang`
- [ ] `generateStaticParams`

---

# Résultat final

URLs générées :

```text
/fr
/en
/fr/about
/en/about
```

Aucune redirection automatique.

La langue change uniquement quand l’utilisateur clique sur le switcher.
