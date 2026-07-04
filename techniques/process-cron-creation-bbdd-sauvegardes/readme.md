# Tutoriel : Sauvegarde automatique d'une base de données Neon avec Cron

Ce tutoriel explique comment mettre en place un processus automatisé (via `cron`) qui effectue une copie/sauvegarde régulière d'une base de données PostgreSQL hébergée sur [Neon](https://neon.tech).

## Prérequis

- Un accès SSH à un serveur Linux (VPS, machine locale, conteneur, etc.) sur lequel le cron va s'exécuter
- `postgresql-client` installé (pour disposer de `pg_dump` et `psql`)
- La chaîne de connexion de votre base Neon (disponible dans le dashboard Neon, onglet **Connection Details**)
- Optionnel : un accès à un espace de stockage distant (S3, Backblaze B2, etc.) si vous voulez externaliser les sauvegardes

## 1. Récupérer la chaîne de connexion Neon

Dans le dashboard Neon, ouvrez votre projet puis récupérez l'URL de connexion, qui ressemble à :

```
postgresql://<user>:<password>@<endpoint>.neon.tech/<database>?sslmode=require
```

Neon impose `sslmode=require` : gardez ce paramètre dans vos scripts.

## 2. Installer le client PostgreSQL

Sur Debian/Ubuntu :

```bash
sudo apt update
sudo apt install -y postgresql-client
```

Vérifiez que `pg_dump` correspond (idéalement) à la même version majeure que votre instance Neon :

```bash
pg_dump --version
```

## 3. Stocker la chaîne de connexion en toute sécurité

Ne mettez jamais le mot de passe en clair dans le script versionné. Créez un fichier d'environnement dédié :

```bash
sudo mkdir -p /etc/neon-backup
sudo nano /etc/neon-backup/.env
```

Contenu du fichier :

```bash
NEON_DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require"
BACKUP_DIR="/var/backups/neon"
RETENTION_DAYS=14
```

Restreignez les permissions :

```bash
sudo chmod 600 /etc/neon-backup/.env
```

## 4. Créer le script de sauvegarde

Créez le dossier de destination et le script :

```bash
sudo mkdir -p /var/backups/neon
sudo nano /usr/local/bin/backup-neon.sh
```

Contenu du script :

```bash
#!/usr/bin/env bash
set -euo pipefail

# Charge les variables d'environnement
source /etc/neon-backup/.env

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="neon_backup_${TIMESTAMP}.dump"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Démarrage de la sauvegarde vers ${FILEPATH}"

# -F c = format custom (compressé, restaurable avec pg_restore)
pg_dump "${NEON_DATABASE_URL}" -F c -f "${FILEPATH}"

echo "[$(date)] Sauvegarde terminée : ${FILEPATH}"

# Nettoyage des sauvegardes plus anciennes que RETENTION_DAYS
find "${BACKUP_DIR}" -name "neon_backup_*.dump" -mtime +"${RETENTION_DAYS}" -delete

echo "[$(date)] Nettoyage effectué (rétention : ${RETENTION_DAYS} jours)"
```

Rendez le script exécutable :

```bash
sudo chmod +x /usr/local/bin/backup-neon.sh
```

Testez-le manuellement avant de l'automatiser :

```bash
sudo /usr/local/bin/backup-neon.sh
ls -lh /var/backups/neon
```

## 5. (Optionnel) Envoyer la sauvegarde vers un stockage distant

Si vous voulez éviter de garder les sauvegardes uniquement sur le même serveur, ajoutez un envoi vers S3 (ou équivalent) à la fin du script, par exemple avec l'AWS CLI :

```bash
# Ajout à la fin de backup-neon.sh
aws s3 cp "${FILEPATH}" "s3://mon-bucket-backups/neon/${FILENAME}"
```

Installation de l'AWS CLI si nécessaire :

```bash
sudo apt install -y awscli
aws configure
```

## 6. Planifier l'exécution avec Cron

Ouvrez la crontab de l'utilisateur qui exécutera la sauvegarde (idéalement pas root, sauf si nécessaire) :

```bash
sudo crontab -e
```

Ajoutez une ligne pour exécuter la sauvegarde tous les jours à 3h du matin :

```cron
0 3 * * * /usr/local/bin/backup-neon.sh >> /var/log/neon-backup.log 2>&1
```

Explication de la syntaxe cron :

| Champ         | Valeur | Signification            |
|---------------|--------|--------------------------|
| Minute        | 0      | à la minute 0            |
| Heure         | 3      | à 3h                     |
| Jour du mois  | *      | tous les jours           |
| Mois          | *      | tous les mois            |
| Jour semaine  | *      | tous les jours de semaine|

Autres exemples utiles :

```cron
# Toutes les 6 heures
0 */6 * * * /usr/local/bin/backup-neon.sh >> /var/log/neon-backup.log 2>&1

# Tous les lundis à 4h
0 4 * * 1 /usr/local/bin/backup-neon.sh >> /var/log/neon-backup.log 2>&1
```

## 7. Vérifier que le cron fonctionne

Créez le fichier de log s'il n'existe pas et surveillez son contenu après la première exécution planifiée :

```bash
sudo touch /var/log/neon-backup.log
tail -f /var/log/neon-backup.log
```

Vérifiez aussi que le cron est bien pris en compte :

```bash
sudo crontab -l
```

## 8. Restaurer une sauvegarde

Pour restaurer un dump `.dump` (format custom) dans une base Neon (ou une autre base PostgreSQL) :

```bash
pg_restore --no-owner --no-privileges \
  -d "postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require" \
  /var/backups/neon/neon_backup_20260704_030000.dump
```

> ⚠️ `--no-owner --no-privileges` évite les erreurs si les rôles PostgreSQL diffèrent entre l'origine et la destination.

## 9. Bonnes pratiques

- **Testez régulièrement la restauration** : une sauvegarde qu'on n'a jamais restaurée n'est pas fiable.
- **Chiffrez les sauvegardes** si elles contiennent des données sensibles (`gpg --symmetric` par exemple).
- **Alertez en cas d'échec** : ajoutez une notification (email, Slack, webhook) si `pg_dump` échoue.
- **Utilisez les branches Neon** : Neon propose aussi un système de *branching* de base de données, qui peut compléter (mais ne remplace pas) une vraie sauvegarde externe.
- **Surveillez l'espace disque** du dossier de sauvegarde local.

## 10. Exemple de notification en cas d'échec

Vous pouvez adapter le script pour envoyer une alerte simple en cas d'erreur :

```bash
#!/usr/bin/env bash
set -euo pipefail

source /etc/neon-backup/.env

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILEPATH="${BACKUP_DIR}/neon_backup_${TIMESTAMP}.dump"

if ! pg_dump "${NEON_DATABASE_URL}" -F c -f "${FILEPATH}"; then
  echo "Échec de la sauvegarde Neon le $(date)" | mail -s "ALERTE Backup Neon" votre-email@example.com
  exit 1
fi
```

---

Avec cette mise en place, vous disposez d'un processus automatisé, journalisé et avec rétention configurable pour sauvegarder votre base Neon.
