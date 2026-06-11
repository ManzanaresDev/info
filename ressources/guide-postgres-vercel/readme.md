# Manuel : PostgreSQL sur Vercel

> Guide complet pour créer, organiser et utiliser une base de données PostgreSQL avec Vercel (Neon)

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Structure du projet](#2-structure-du-projet)
3. [Créer la base de données Postgres sur Vercel](#3-créer-la-base-de-données-postgres-sur-vercel)
4. [Configurer les variables d'environnement](#4-configurer-les-variables-denvironnement)
5. [Installer les dépendances](#5-installer-les-dépendances)
6. [Connexion à la base de données](#6-connexion-à-la-base-de-données)
7. [Définir le schéma (migrations)](#7-définir-le-schéma-migrations)
8. [Opérations CRUD](#8-opérations-crud)
9. [Utilisation dans les API Routes (Next.js)](#9-utilisation-dans-les-api-routes-nextjs)
10. [Bonnes pratiques](#10-bonnes-pratiques)
11. [Dépannage courant](#11-dépannage-courant)

---

## 1. Prérequis

Avant de commencer, assurez-vous d'avoir :

- Un compte [Vercel](https://vercel.com) actif
- [Node.js](https://nodejs.org) >= 18 installé
- `npm` ou `pnpm` disponible en ligne de commande
- Un projet déployé ou lié à Vercel (`vercel link`)

---

## 2. Structure du projet

Organisation recommandée des fichiers pour un projet Next.js avec PostgreSQL :

```
mon-projet/
├── .env.local                  # Variables d'environnement locales (jamais commitées)
├── .env.example                # Exemple de variables (commité, sans valeurs sensibles)
├── package.json
├── next.config.js
│
├── lib/
│   ├── db.ts                   # Client de connexion PostgreSQL
│   └── schema.sql              # Définition du schéma SQL
│
├── app/
│   └── api/
│       ├── users/
│       │   └── route.ts        # API Route : /api/users
│       └── posts/
│           └── route.ts        # API Route : /api/posts
│
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_posts.sql
│   └── 003_add_indexes.sql
│
└── scripts/
    └── migrate.ts              # Script d'exécution des migrations
```

**Règles d'organisation :**

- `lib/db.ts` — un seul point d'entrée pour la connexion, importé partout ailleurs
- `migrations/` — fichiers SQL numérotés, jamais modifiés après exécution
- `.env.local` — ajouté au `.gitignore`, ne contient que les secrets locaux

---

## 3. Créer la base de données Postgres sur Vercel

### Via le Dashboard Vercel

1. Ouvrez votre projet sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Allez dans l'onglet **Storage**
3. Cliquez sur **Create Database** → sélectionnez **Postgres** (propulsé par Neon)
4. Choisissez un nom, une région proche de vos utilisateurs, puis confirmez
5. Vercel injecte automatiquement les variables d'environnement dans votre projet déployé

### Via la CLI Vercel

```bash
# Lier votre projet local à Vercel
vercel link

# Créer la base et récupérer les variables localement
vercel env pull .env.local
```

---

## 4. Configurer les variables d'environnement

Après création, Vercel génère ces variables automatiquement :

```env
# .env.local — généré par `vercel env pull`
POSTGRES_URL="postgres://user:password@host/dbname?sslmode=require"
POSTGRES_PRISMA_URL="postgres://user:password@host/dbname?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://user:password@host/dbname?sslmode=require"
POSTGRES_USER="user"
POSTGRES_HOST="host.neon.tech"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="dbname"
```

**Ne commitez jamais `.env.local`.** Ajoutez-le au `.gitignore` :

```bash
echo ".env.local" >> .gitignore
```

Créez un `.env.example` avec les clés (sans valeurs) pour documenter le projet :

```env
# .env.example
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

---

## 5. Installer les dépendances

### Option A — SDK officiel Vercel Postgres (recommandé)

```bash
npm install @vercel/postgres
```

Simple, optimisé pour l'environnement Vercel, utilise automatiquement `POSTGRES_URL`.

### Option B — `pg` (driver natif Node.js)

```bash
npm install pg
npm install --save-dev @types/pg
```

Plus verbeux, mais plus de contrôle et portable hors Vercel.

### Option C — Drizzle ORM (ORM léger)

```bash
npm install drizzle-orm @vercel/postgres
npm install --save-dev drizzle-kit
```

---

## 6. Connexion à la base de données

### Avec `@vercel/postgres`

```typescript
// lib/db.ts
import { sql } from '@vercel/postgres';

// `sql` est un tag template prêt à l'emploi
// Pas besoin de gérer manuellement la connexion
export { sql };
```

### Avec `pg` (pool de connexions)

```typescript
// lib/db.ts
import { Pool } from 'pg';

// Réutiliser le pool entre les invocations (important en serverless)
let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,              // connexions simultanées max
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export { getPool };
```

> **Attention en serverless** : les fonctions Vercel sont sans état. Utilisez un pool avec une taille raisonnable (`max: 5–10`) ou la variable `POSTGRES_PRISMA_URL` qui active PgBouncer (connection pooling externe).

---

## 7. Définir le schéma (migrations)

### Fichier de schéma de référence

```sql
-- lib/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published  ON posts(published);
```

### Script de migration

```typescript
// scripts/migrate.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPool } from '../lib/db';

async function migrate() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Table de suivi des migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows: applied } = await client.query(
      'SELECT filename FROM _migrations'
    );
    const appliedSet = new Set(applied.map((r: { filename: string }) => r.filename));

    const migrationsDir = join(process.cwd(), 'migrations');
    const files = readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql') || appliedSet.has(file)) continue;

      console.log(`Applying migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (filename) VALUES ($1)', [file]
      );
      await client.query('COMMIT');
      console.log(`✓ ${file}`);
    }

    console.log('Migrations terminées.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
```

Exécutez les migrations :

```bash
npx tsx scripts/migrate.ts
```

---

## 8. Opérations CRUD

Les exemples suivants utilisent `@vercel/postgres`.

### Créer (INSERT)

```typescript
import { sql } from '@vercel/postgres';

async function createUser(email: string, name: string) {
  const { rows } = await sql`
    INSERT INTO users (email, name)
    VALUES (${email}, ${name})
    RETURNING *
  `;
  return rows[0];
}
```

### Lire (SELECT)

```typescript
// Tous les utilisateurs
async function getUsers() {
  const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`;
  return rows;
}

// Un utilisateur par ID
async function getUserById(id: number) {
  const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ?? null;
}

// Jointure : posts avec auteur
async function getPublishedPosts() {
  const { rows } = await sql`
    SELECT p.id, p.title, p.content, u.name AS author_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.published = TRUE
    ORDER BY p.created_at DESC
  `;
  return rows;
}
```

### Modifier (UPDATE)

```typescript
async function publishPost(id: number) {
  const { rows } = await sql`
    UPDATE posts
    SET published = TRUE, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ?? null;
}
```

### Supprimer (DELETE)

```typescript
async function deleteUser(id: number) {
  await sql`DELETE FROM users WHERE id = ${id}`;
}
```

> **Sécurité** : les template literals de `@vercel/postgres` sont automatiquement paramétrés. Ne concaténez jamais de variables directement dans une requête SQL brute.

---

## 9. Utilisation dans les API Routes (Next.js)

### GET — lister des ressources

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql`SELECT id, email, name, created_at FROM users`;
    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

### POST — créer une ressource

```typescript
// app/api/users/route.ts (suite)
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = CreateUserSchema.parse(body);

    const { rows } = await sql`
      INSERT INTO users (email, name)
      VALUES (${email}, ${name})
      RETURNING *
    `;

    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

### Route dynamique (GET par ID, DELETE)

```typescript
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  return NextResponse.json({ user: rows[0] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  await sql`DELETE FROM users WHERE id = ${id}`;
  return new Response(null, { status: 204 });
}
```

---

## 10. Bonnes pratiques

### Sécurité

- Utilisez **toujours** des requêtes paramétrées (jamais de concaténation de chaînes SQL)
- Validez les entrées avec une librairie comme [Zod](https://zod.dev) avant toute insertion
- Limitez les permissions de l'utilisateur DB au strict nécessaire (`SELECT`, `INSERT`, `UPDATE`, `DELETE` — jamais `DROP` ou `ALTER` en production)

### Performance

- Ajoutez des **index** sur les colonnes fréquemment filtrées ou jointurées
- Utilisez la variable `POSTGRES_PRISMA_URL` (PgBouncer activé) pour les workloads à fort trafic
- Évitez les `SELECT *` en production — listez explicitement les colonnes nécessaires
- Paginagez les résultats lourds avec `LIMIT` et `OFFSET` ou curseurs

### Fiabilité

- Wrappez les opérations multi-étapes dans des **transactions** (`BEGIN / COMMIT / ROLLBACK`)
- Gérez toujours les erreurs dans les API routes et renvoyez des codes HTTP appropriés
- Journalisez les erreurs côté serveur sans exposer les détails à l'utilisateur final

### Développement local

```bash
# Tirer les variables de production vers l'environnement local
vercel env pull .env.local

# Ou pointer vers une instance locale (Docker)
# POSTGRES_URL=postgres://postgres:password@localhost:5432/mydb
```

---

## 11. Dépannage courant

| Symptôme | Cause probable | Solution |
|---|---|---|
| `connection timeout` | Pool saturé ou PgBouncer non activé | Utiliser `POSTGRES_PRISMA_URL`, réduire `max` du pool |
| `SSL SYSCALL error` | SSL non configuré | Ajouter `?sslmode=require` à l'URL ou `ssl: { rejectUnauthorized: false }` |
| `relation "users" does not exist` | Migration non exécutée | Lancer `npx tsx scripts/migrate.ts` |
| Variables `undefined` en local | `.env.local` absent | Lancer `vercel env pull .env.local` |
| `too many connections` | Chaque invocation ouvre une connexion | Réutiliser le pool (singleton), activer PgBouncer |
| Données corrompues en cas d'erreur | Pas de transaction | Encapsuler dans `BEGIN / COMMIT / ROLLBACK` |

---

## Ressources

- [Documentation Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon — PostgreSQL serverless](https://neon.tech/docs)
- [SDK `@vercel/postgres`](https://www.npmjs.com/package/@vercel/postgres)
- [Next.js App Router + Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod — validation de schéma](https://zod.dev)
