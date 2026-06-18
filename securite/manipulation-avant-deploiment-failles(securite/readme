# 🧩 Objectif final

Tu veux que ton projet refuse automatiquement de se déployer si une dépendance a une faille de sécurité critique.

## 🪜 Étape 1 — Tu crées un fichier dans ton projet

Dans ton projet (à la racine), crée ce dossier + fichier :

```bash
.github/workflows/security-audit.yml
```

👉 Si ça n’existe pas, tu le crées manuellement.

## 🪜 Étape 2 — Tu colles ce code dedans

```bash
name: Security Audit

on:
  push:
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - run: npm audit --audit-level=high
```

🧠 Ce que ça fait concrètement

À chaque fois que tu fais :

- un git push
- une pull request

GitHub va automatiquement :

- Installer ton projet (npm ci)
- Analyser les dépendances (npm audit)
- Vérifier les failles

🚨 Si une faille est trouvée

- niveau HIGH ou CRITICAL → ❌ ça bloque tout
- le push / merge est refusé

## 🪜 Étape 3 — Vérifier que ça marche

Tu peux tester en local :

```bash
npm audit
```

## ⚙️ Important à comprendre

❌ Ce n’est PAS une commande à lancer en production

Tu ne fais pas ça sur ton serveur en boucle.

👉 C’est GitHub qui le fait automatiquement avant de valider ton code.

## 🟢 Résultat final

Quand tu pushes ton code :

soit tout est OK → ça passe
soit il y a une faille → ça bloque

## 🧩 Option utile (facile à ajouter après)

Tu peux ajouter ça plus tard :

👉 mise à jour automatique des dépendances

```bash
.github/dependabot.yml
```

## 👍 Résumé ultra simple

- tu ajoutes 1 fichier
- GitHub vérifie la sécurité automatiquement
- si danger → déploiement bloqué
