# 🧹 Vider le cache Next.js — Manuel de correction

Quand Next.js affiche des erreurs 404 ou des comportements étranges après une correction de code, le cache `.next` peut être corrompu. Voici comment le supprimer selon ton environnement.

---

## Commandes

### Bash (Linux / macOS)
```bash
rm -rf .next
```

### PowerShell (Windows)
```powershell
Remove-Item -Recurse -Force .next
```

### CMD (Windows)
```cmd
rmdir /s /q .next
```

---

## Procédure complète

```bash
# 1. Arrêter le serveur
Ctrl + C

# 2. Supprimer le cache (choisis ta commande selon ton OS)
rm -rf .next

# 3. Relancer le serveur
pnpm run dev
# ou
npm run dev
# ou
yarn dev
```

---

## Quand appliquer cette correction ?

| Symptôme | Cause probable |
|---|---|
| Page 404 alors que le fichier existe | Cache corrompu après une erreur de compilation |
| Modifications de code non prises en compte | Cache obsolète |
| Erreurs d'hydratation persistantes | Cache incohérent entre client et serveur |
| Comportement étrange après un renommage de fichier | Ancien chemin toujours en cache |

---

## Pourquoi ça arrive ?

Next.js garde un cache dans `.next/` pour accélérer les compilations. Si une **erreur de compilation survient** pendant que le cache s'écrit (ex: une faute de frappe comme `<Services />s`), le cache peut se retrouver dans un état corrompu. Même après avoir corrigé le code, Next.js continue de lire ce cache défectueux.

---

> 💡 **Astuce** : Le dossier `.next` est regénéré automatiquement au prochain `pnpm run dev`. Il n'y a aucun risque à le supprimer.
