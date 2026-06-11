# 📤 Pousser l’état actuel du projet vers une branche différente (Git)

## 1. 🔍 Vérifier la branche actuelle

```bash
git branch
```

> Cela te montre sur quelle branche tu travailles (ex. `main`).

---

## 2. 🛠️ Créer ou changer de branche

### 🔁 Si la branche existe déjà :

```bash
git checkout nom-de-la-branche
```

### 🆕 Si tu veux créer une nouvelle branche à partir de l’état actuel :

```bash
git checkout -b nom-de-la-nouvelle-branche
```

**Exemple :**
```bash
git checkout -b feature-navbar
```

---

## 3. ☁️ Pousser vers la branche distante

```bash
git push -u origin nom-de-la-branche
```

**Exemple :**
```bash
git push -u origin feature-navbar
```

> Le `-u` établit un lien de suivi avec la branche distante, ce qui te permet ensuite d’utiliser simplement `git push` ou `git pull`.

---

## ✅ Résumé express

```bash
git checkout -b nouvelle-branche
git push -u origin nouvelle-branche
```

Tu peux maintenant continuer à travailler sur cette branche sans impacter `main`.

---

## 📎 Remarques

- Si tu as déjà cloné un dépôt sur `main`, tu peux créer et pousser vers une autre branche sans conflit.
- Aucun écrasement n’aura lieu **tant que tu travailles dans des branches distinctes**.
