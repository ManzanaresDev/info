# 📘 Manuel : Cloner un seul sous-dossier avec Git

En Git, il n’est pas possible de cloner **uniquement** un sous-dossier directement.  
Mais plusieurs solutions existent selon le besoin :

---

## 🔹 1. Méthode `git sparse-checkout` (avec historique)

Permet d’avoir **l’historique Git** mais seulement le sous-dossier choisi.

```bash
# Cloner le dépôt sans extraire les fichiers
git clone --no-checkout <url-du-repo>
cd <nom-du-repo>

# Activer le mode sparse-checkout
git sparse-checkout init --cone

# Définir le sous-dossier à extraire
git sparse-checkout set chemin/vers/sous-dossier

# Récupérer les fichiers de la branche voulue (ex: main)
git checkout main
```
