Guide des fichiers layout.tsx dans Next.js (App Router)
Introduction

Dans Next.js App Router, un fichier layout.tsx permet de définir une structure commune à plusieurs pages.

Un layout reste monté lors de la navigation entre les routes qu'il englobe, ce qui le rend idéal pour :

Les barres de navigation (Navbar)
Les menus latéraux (Sidebar)
Les pieds de page (Footer)
Les Providers (AuthProvider, ThemeProvider, QueryClientProvider, etc.)
Les vérifications d'authentification
Les structures visuelles communes
Layout racine

Fichier :

app/layout.tsx

Ce layout est obligatoire et doit contenir les balises HTML principales de l'application.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
title: "Mon site",
description: "Description du site",
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html lang="fr">
<body>{children}</body>
</html>
);
}
Responsabilités
Définir <html>
Définir <body>
Importer les styles globaux
Déclarer les métadonnées globales
Ajouter les providers globaux
Layout de section

Exemple :

app/dashboard/layout.tsx

Toutes les routes situées dans le dossier dashboard hériteront de ce layout.

import Navbar from "@/components/Navbar";

export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<>
<Navbar />
<main>{children}</main>
</>
);
}
Routes concernées
app/
└── dashboard/
├── layout.tsx
├── page.tsx
├── users/
│ └── page.tsx
└── settings/
└── page.tsx

La navbar restera affichée pendant la navigation entre :

/dashboard
/dashboard/users
/dashboard/settings
Layout d'authentification

Exemple :

app/auth/layout.tsx

Permet d'appliquer une mise en page spécifique aux pages de connexion et d'inscription.

export default function AuthLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="container">
{children}
</div>
);
}
Routes concernées
app/
└── auth/
├── layout.tsx
├── login/
│ └── page.tsx
└── register/
└── page.tsx
Exemple d'arborescence complète
app/
├── layout.tsx
├── page.tsx
│
├── auth/
│ ├── layout.tsx
│ ├── login/
│ │ └── page.tsx
│ └── register/
│ └── page.tsx
│
└── dashboard/
├── layout.tsx
├── page.tsx
├── users/
│ └── page.tsx
└── courses/
└── page.tsx
Bonnes pratiques
À mettre dans un layout

✅ Navbar

✅ Sidebar

✅ Footer

✅ Providers

✅ Vérification d'authentification

✅ Structure commune à plusieurs pages

À éviter dans un layout

❌ Contenu spécifique à une page

❌ Données propres à une seule route

❌ Logique métier spécifique

❌ Composants qui doivent être recréés à chaque navigation

Règle simple

Un layout.tsx doit contenir tout ce qui doit rester affiché lorsque l'utilisateur navigue entre plusieurs pages d'une même section.

Si un élément doit être partagé par plusieurs routes, il a probablement sa place dans un layout.
