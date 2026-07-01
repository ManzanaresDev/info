# 📘 Manuel rapide — nvm (Node Version Manager)

## 1. ⚙️ Installation

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Puis recharge ton shell :

```bash
source ~/.bashrc
# ou
source ~/.zshrc
```

Vérifie :

```bash
nvm -v
```

## 2. 📦 Installation de Node.js

```bash
nvm install 18
```

Installer la dernière version LTS :

```bash
nvm install --lts
```

## 3. 🔄 Changer de version

```bash
nvm use 18
```

Version par défaut :

```bash
nvm alias default 18
```

## 4. 📋 Lister les versions

```bash
nvm ls
```

Versions disponibles :

```bash
nvm ls-remote
```

## 5. 🧹 Désinstaller une version

```bash
nvm uninstall 16
```

Puis dans le projet :

```bash
nvm use
```

---

### 🚀 Commandes utiles

| commande          | Action                    |
| ----------------- | ------------------------- |
| nvm current       | `formats.medium`          |
| nvm which current | `chemin Node utilisé`     |
| nvm install node  | `dernière version stable` |
| nvm install iojs  | `version io.js (ancien)`  |

---

### 🧠 Bonnes pratiques

Toujours utiliser .nvmrc par projet
Préférer LTS pour production
Éviter d’installer Node globalement hors nvm
Vérifier la version après chaque projet :
