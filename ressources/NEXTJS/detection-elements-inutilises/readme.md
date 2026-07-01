# Tutoriel : détecter le code et CSS inutilisés dans un projet Next.js

## 1. Knip — fichiers, exports et dépendances inutilisés

### Installation et premier scan

Pas besoin d'installer en local, tu peux lancer directement :

```bash
npx knip
```

Knip va analyser ton projet (il reconnaît automatiquement Next.js) et te sortir un rapport classé par catégorie, du style :

```
Unused files (2)
components/OldCarousel.tsx
lib/unusedHelper.ts

Unused exports (3)
formatDate    lib/utils.ts:12:17
oldFunction   lib/utils.ts:25:1

Unused dependencies (1)
moment

Unused devDependencies (1)
eslint-plugin-old
```

### Comment lire les résultats

- **Unused files** : des fichiers entiers jamais importés nulle part → candidats à la suppression complète.
- **Unused exports** : des fonctions/variables exportées mais jamais importées ailleurs → tu peux les rendre non-exportées ou les supprimer.
- **Unused dependencies** : des packages dans ton `package.json` jamais `import`és dans le code → à désinstaller (`npm uninstall moment`).

### Configurer Knip pour éviter les faux positifs

Si Knip te signale des fichiers que tu sais utilisés (ex : fichiers de config, middleware, routes API spéciales), crée un fichier `knip.json` à la racine :

```json
{
  "entry": ["app/**/page.tsx", "app/**/layout.tsx", "middleware.ts"],
  "project": ["**/*.{ts,tsx}"],
  "ignore": ["**/*.test.tsx", "node_modules/**"]
}
```

Relance ensuite :

```bash
npx knip
```

### Mode "production only" (plus strict)

Pour ignorer les fichiers de test/dev et se concentrer sur le code de prod :

```bash
npx knip --production
```

---

## 2. PurgeCSS — CSS inutilisé

### Installation

```bash
npm install -D purgecss
```

### Lancer en mode "rapport" (sans toucher à ton fichier original)

```bash
npx purgecss --css app/globals.css --content "./app/**/*.tsx" "./components/**/*.tsx" --output ./purge-report
```

Ça crée un dossier `purge-report/` avec une version épurée de ton CSS. **Ne remplace jamais ton fichier directement avec ça** — utilise-le comme comparaison.

### Comparer ce qui a été supprimé

```bash
diff app/globals.css purge-report/globals.css
```

Tout ce qui apparaît en `<` dans le diff est ce que PurgeCSS considère comme mort. Vérifie chaque ligne manuellement — PurgeCSS peut se tromper sur :

- les classes générées dynamiquement (`className={\`btn-${type}\`}`)
- les classes ajoutées via JS pur (`element.classList.add(...)`)
- les classes utilisées dans des fichiers `.ts` non scannés (vérifie bien le `--content`)

### Configuration plus fiable avec un fichier config

Crée `purgecss.config.js` à la racine :

```js
module.exports = {
  content: [
    "./app/**/*.{tsx,ts}",
    "./components/**/*.{tsx,ts}",
  ],
  css: ["./app/globals.css"],
  output: "./purge-report",
  safelist: [
    // classes à ne JAMAIS supprimer même si non détectées
    /^hero-/,
    "tag",
  ],
};
```

Lance avec :

```bash
npx purgecss --config ./purgecss.config.js
```

Le `safelist` est important : mets-y toutes les classes que tu sais légitimes mais que PurgeCSS pourrait rater (regex ou strings).

---

## 3. Extension VSCode "CSS Used" (optionnel, plus visuel)

Si tu préfères une vérification à la main sans rien casser automatiquement :

1. Ouvre VSCode → Extensions (`Ctrl+Shift+X`)
2. Cherche **"CSS Used"**
3. Installe-la
4. `Ctrl+Shift+P` → tape `CSS Used: generate report`
5. Choisis ton dossier de scan

Elle génère un rapport HTML listant les classes utilisées et non utilisées, sans toucher à tes fichiers. Bon complément pour confirmer manuellement les résultats de PurgeCSS avant suppression.

---

## Workflow recommandé

1. `npx knip` → repère fichiers/exports/deps morts, nettoie ceux-là d'abord (le plus sûr)
2. `npx purgecss --config ./purgecss.config.js` → génère le rapport CSS
3. `diff app/globals.css purge-report/globals.css` → liste les classes suspectes
4. Pour chaque classe suspecte : `grep -rln "nom-classe" --include="*.tsx" .` pour confirmer avant suppression
5. Édite `globals.css` à la main avec les confirmations

Ne supprime jamais en te basant uniquement sur l'outil — le grep manuel reste la meilleure garantie.
