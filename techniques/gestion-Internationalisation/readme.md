# i18n avec Next.js App Router

> Guide de mise en place de l'internationalisation avec `next-intl` pour un projet Next.js utilisant l'App Router (`/app`).

---

## Structure de dossiers

```
app/
└── [locale]/
    ├── layout.tsx       ← Provider i18n ici
    ├── page.tsx
    └── about/
        └── page.tsx

messages/
├── fr.json
└── en.json

src/
├── i18n.ts              ← Config next-intl
└── middleware.ts        ← Redirection automatique
```

---

## Installation

```bash
npm install next-intl
```

---

## Configuration étape par étape

### `src/i18n.ts` — Config de base

```ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));
```

### `next.config.js`

```js
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');
module.exports = withNextIntl({});
```

### `src/middleware.ts` — Redirection automatique selon la langue du navigateur

```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'en', 'de'],
  defaultLocale: 'fr',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

### `app/[locale]/layout.tsx` — Provider pour les Client Components

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params: { locale } }) {
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

## Utilisation dans les composants

### Server Component (sans hook)

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('home');
  return <h1>{t('title')}</h1>;
}
```

### Client Component (avec hook)

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Button() {
  const t = useTranslations('common');
  return <button>{t('buttons.save')}</button>;
}
```

---

## Points clés à retenir avec l'App Router

| Contexte | Fonction à utiliser |
|---|---|
| Server Component | `getTranslations()` (async) |
| Client Component | `useTranslations()` (hook) |
| Détection de langue | Middleware `next-intl` |
| Pré-génération statique | `generateStaticParams()` |

- Le **middleware** gère la détection et la redirection automatique vers la bonne locale.
- `generateStaticParams` permet de **pré-générer** toutes les routes localisées en SSG :

```tsx
// app/[locale]/page.tsx
export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'de' }];
}
```

---

## Ressources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl — App Router](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
