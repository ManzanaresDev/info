# Guide d’audit minimal de sécurité d’un site WordPress

## Objectif

Ce guide décrit une première passe d’audit de sécurité d’un site WordPress. Il s’appuie sur les contrôles de sécurité identifiés dans le guide fourni et les organise en étapes pratiques avec les outils à utiliser.

> **Important :** ne réaliser les scans et tests actifs que sur un site dont vous êtes propriétaire ou pour lequel vous disposez d’une autorisation explicite.

---

# 1. Préparer l’audit

## Informations à noter

Avant de commencer, créer une fiche d’audit avec :

- URL du site ;
- environnement : production / préproduction ;
- version de WordPress ;
- version de PHP ;
- hébergeur ;
- thème actif ;
- plugins installés ;
- nombre de comptes administrateurs ;
- présence d’un WAF/CDN ;
- date de l’audit.

## Outils

- Navigateur : Chrome ou Firefox
- DevTools du navigateur
- `curl`
- WP-CLI, si un accès serveur est disponible
- Un scanner WordPress autorisé
- Un scanner TLS/headers

---

# 2. Vérifier la version de WordPress, PHP, du thème et des plugins

## Étape 1 — Depuis WordPress

Dans l’administration :

**Tableau de bord → Mises à jour**

Vérifier :

- WordPress ;
- plugins ;
- thèmes.

Supprimer les plugins inutilisés plutôt que simplement les désactiver.

## Étape 2 — Avec WP-CLI

Si un accès SSH est disponible :

```bash
wp core version
wp plugin list
wp theme list
php -v
```

Pour rechercher les mises à jour :

```bash
wp core check-update
wp plugin update --dry-run
wp theme update --dry-run
```

## Étape 3 — Identifier les plugins vulnérables

Comparer les versions installées avec les vulnérabilités connues.

Outils possibles :

- WPScan ;
- WP-CLI ;
- base de vulnérabilités des plugins ;
- scanner de sécurité utilisé par l’hébergeur.

### Résultat attendu

Documenter :

| Composant | Version | À jour | Vulnérabilité connue | Action |
|---|---|---|---|---|
| WordPress | … | Oui/Non | Oui/Non | … |
| Plugin X | … | Oui/Non | Oui/Non | … |
| Thème X | … | Oui/Non | Oui/Non | … |
| PHP | … | Oui/Non | — | … |

---

# 3. Vérifier les comptes et privilèges

## Étape 1 — Administration WordPress

Aller dans :

**Utilisateurs → Tous les utilisateurs**

Lister les utilisateurs ayant le rôle :

- Administrateur ;
- Éditeur ;
- autres rôles disposant de capacités sensibles.

Vérifier :

- comptes anciens ;
- comptes inconnus ;
- comptes de prestataires qui ne sont plus nécessaires ;
- comptes administrateurs en surnombre.

## Étape 2 — Avec WP-CLI

```bash
wp user list
```

Pour afficher les rôles :

```bash
wp user list --fields=ID,user_login,user_email,roles
```

## Étape 3 — MFA

Vérifier si une authentification multifacteur est activée pour les comptes administrateurs.

### Résultat attendu

Aucun compte administrateur inutile et chaque compte privilégié doit être identifié et justifié.

---

# 4. Vérifier HTTPS et les headers de sécurité

Cette étape est importante notamment pour la protection contre le clickjacking.

## Étape 1 — Tester HTTPS

```bash
curl -I https://example.com
```

Vérifier que le site fonctionne en HTTPS.

Tester également la version HTTP :

```bash
curl -I http://example.com
```

La requête HTTP devrait être redirigée vers HTTPS.

## Étape 2 — Examiner les headers

```bash
curl -I https://example.com
```

Rechercher notamment :

```text
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
Content-Security-Policy
Referrer-Policy
Permissions-Policy
```

## Étape 3 — Vérifier le clickjacking

La protection minimale peut être :

```http
X-Frame-Options: DENY
```

ou une CSP contenant :

```http
frame-ancestors 'none'
```

La présence des deux est préférable lorsque la compatibilité le justifie.

## Étape 4 — Utiliser un outil en ligne

Vous pouvez compléter avec :

- Security Headers ;
- Mozilla Observatory ;
- un scanner TLS reconnu.

Ne pas considérer le score automatique comme une preuve suffisante : confirmer les headers manuellement.

---

# 5. Vérifier les fichiers et informations exposés

L’objectif est de détecter des informations qui ne devraient pas être accessibles publiquement.

## Étape 1 — Vérifier les URLs classiques

Tester manuellement :

```text
/wp-admin/
/wp-login.php
/wp-json/
/xmlrpc.php
/readme.html
```

Le fait qu’une URL réponde n’est pas automatiquement une vulnérabilité. Il faut analyser le contenu et le comportement.

## Étape 2 — Vérifier les fichiers sensibles

Rechercher notamment :

```text
.env
*.sql
*.zip
*.tar
*.tar.gz
*.bak
*.old
*.log
```

Exemples de commandes sur une copie locale ou avec accès serveur :

```bash
find . -type f \( -name "*.sql" -o -name "*.zip" -o -name "*.bak" -o -name "*.log" \)
```

Ne pas exposer de sauvegardes ou fichiers de configuration dans le répertoire public.

## Étape 3 — Vérifier le listing de répertoires

Tester par exemple :

```text
/wp-content/uploads/
```

Un listing du contenu d’un répertoire peut révéler des fichiers qui ne devraient pas être facilement découvrables.

---

# 6. Vérifier l’authentification et le brute force

## Étape 1 — Examiner la page de connexion

```text
/wp-login.php
```

Vérifier :

- HTTPS ;
- messages d’erreur ;
- présence d’une MFA ;
- mécanisme de limitation des tentatives ;
- absence d’informations sensibles dans les messages.

## Étape 2 — Vérifier le rate limiting

Ne pas lancer un grand nombre de tentatives sur une production sans autorisation explicite.

Avec une procédure de test contrôlée, vérifier qu’un mécanisme existe pour limiter les tentatives répétées.

Solutions possibles :

- plugin de sécurité WordPress ;
- WAF ;
- reverse proxy ;
- mécanisme de l’hébergeur.

---

# 7. Vérifier les formulaires et la protection CSRF

Identifier les formulaires :

- connexion ;
- contact ;
- inscription ;
- changement de profil ;
- récupération de mot de passe ;
- commentaires ;
- formulaires d’administration.

## Étape 1 — DevTools

Ouvrir :

**DevTools → Network**

Soumettre un formulaire et examiner la requête.

## Étape 2 — Vérifier les protections

Pour les opérations sensibles, vérifier notamment :

- présence d’un mécanisme anti-CSRF ;
- validation côté serveur ;
- contrôles d’autorisation ;
- messages d’erreur génériques ;
- rate limiting pour les opérations sensibles.

Dans WordPress, les formulaires et actions personnalisés doivent notamment utiliser les mécanismes de nonce prévus par WordPress lorsque le contexte l’exige.

---

# 8. Vérifier les cookies

## Étape 1 — Ouvrir DevTools

Dans Chrome/Firefox :

**DevTools → Application/Storage → Cookies**

Examiner les cookies liés à l’authentification et à la session.

## Étape 2 — Vérifier les attributs

Rechercher :

```text
Secure
HttpOnly
SameSite
```

Un cookie d’authentification doit notamment être protégé contre l’accès JavaScript lorsque son usage le permet.

## Étape 3 — Contrôle via curl

Les cookies envoyés par le serveur peuvent également être observés avec :

```bash
curl -I https://example.com
```

Rechercher les lignes :

```http
Set-Cookie:
```

---

# 9. Vérifier la REST API et XML-RPC

## REST API

Tester :

```bash
curl -i https://example.com/wp-json/
```

La REST API peut être parfaitement légitime. L’objectif est de vérifier qu’elle ne divulgue pas de données sensibles ou privées.

## XML-RPC

Tester :

```bash
curl -i https://example.com/xmlrpc.php
```

Ne pas désactiver automatiquement XML-RPC : certains sites ou plugins en dépendent.

Si XML-RPC est inutile, envisager sa désactivation après vérification des dépendances.

---

# 10. Vérifier les sauvegardes et l’hébergement

## Sauvegardes

Vérifier :

- fréquence ;
- emplacement ;
- rétention ;
- chiffrement si nécessaire ;
- séparation du serveur web ;
- restauration testée.

Une sauvegarde doit être considérée comme réellement fiable seulement si une restauration a été testée.

## Hébergement

Vérifier :

- PHP à jour ;
- accès SSH/SFTP sécurisé ;
- MFA sur le compte d’hébergement ;
- base de données non accessible directement depuis Internet ;
- permissions de fichiers raisonnables ;
- accès administrateur limité.

---

# 11. Lancer un scan WordPress autorisé

## WPScan

Avec une autorisation explicite :

```bash
wpscan --url https://example.com
```

Pour une analyse des plugins vulnérables, utiliser les options adaptées à votre licence/API et à votre périmètre.

Le résultat doit être interprété : une détection de version ou d’extension n’est pas nécessairement une vulnérabilité exploitable.

## Que rechercher ?

- plugins vulnérables ;
- thèmes vulnérables ;
- versions obsolètes ;
- utilisateurs exposés ;
- configurations faibles ;
- informations inutilement divulguées.

---

# 12. Vérifier TLS

Utiliser un scanner TLS reconnu pour vérifier :

- certificats ;
- protocoles ;
- suites cryptographiques ;
- configuration HTTPS ;
- renouvellement du certificat.

Une vérification complémentaire peut être faite avec OpenSSL :

```bash
openssl s_client -connect example.com:443 -servername example.com
```

---

# 13. Rapport d’audit minimal

Pour chaque constat, noter :

| ID | Contrôle | Résultat | Risque | Preuve | Recommandation |
|---|---|---|---|---|---|
| W-01 | WordPress à jour | OK/KO | Moyen | … | … |
| W-02 | Plugins vulnérables | OK/KO | Critique | … | … |
| W-03 | Comptes admin | OK/KO | Élevé | … | … |
| W-04 | HTTPS | OK/KO | Élevé | … | … |
| W-05 | Headers | OK/KO | Moyen | … | … |
| W-06 | Clickjacking | OK/KO | Moyen | … | … |
| W-07 | Fichiers exposés | OK/KO | Élevé | … | … |
| W-08 | Brute force | OK/KO | Élevé | … | … |
| W-09 | CSRF | OK/KO | Élevé | … | … |
| W-10 | Cookies | OK/KO | Moyen | … | … |
| W-11 | REST API/XML-RPC | OK/KO | Faible/Moyen | … | … |
| W-12 | Sauvegardes | OK/KO | Critique | … | … |

---

# 14. Ordre recommandé pour un audit de 30 à 60 minutes

## Phase 1 — 10 minutes

- [ ] Identifier WordPress, PHP, thème et plugins
- [ ] Vérifier les mises à jour
- [ ] Identifier les plugins vulnérables
- [ ] Identifier les administrateurs

## Phase 2 — 10 minutes

- [ ] Vérifier HTTPS
- [ ] Examiner les headers
- [ ] Vérifier `X-Frame-Options`
- [ ] Vérifier `frame-ancestors`
- [ ] Vérifier les cookies

## Phase 3 — 10 minutes

- [ ] Tester `/wp-login.php`
- [ ] Tester `/wp-json/`
- [ ] Tester `/xmlrpc.php`
- [ ] Vérifier les fichiers exposés
- [ ] Vérifier le directory listing

## Phase 4 — 10 à 30 minutes

- [ ] Scanner avec WPScan
- [ ] Scanner TLS
- [ ] Examiner les résultats
- [ ] Prioriser les vulnérabilités
- [ ] Produire le rapport

---

# 15. Priorisation des corrections

## Critique

À traiter immédiatement :

- plugin avec vulnérabilité critique exploitable ;
- compte administrateur compromis ou inconnu ;
- fichier de sauvegarde contenant des secrets accessible publiquement ;
- exposition de secrets ;
- compromission suspectée.

## Élevé

À corriger rapidement :

- plugin vulnérable ;
- authentification insuffisamment protégée ;
- absence de protection contre le brute force ;
- données sensibles exposées ;
- configuration serveur dangereuse.

## Moyen

À planifier :

- headers manquants ;
- clickjacking insuffisamment protégé ;
- cookies mal configurés ;
- informations techniques inutilement exposées.

## Faible

À améliorer :

- durcissement complémentaire ;
- réduction de la surface d’exposition ;
- amélioration de la journalisation ;
- recommandations de maintenance.

---

# 16. Checklist finale

## WordPress

- [ ] WordPress à jour
- [ ] PHP à jour
- [ ] Plugins à jour
- [ ] Thème à jour
- [ ] Plugins inutilisés supprimés
- [ ] Vulnérabilités connues vérifiées

## Comptes

- [ ] Administrateurs identifiés
- [ ] Aucun compte inutile
- [ ] Rôles vérifiés
- [ ] MFA activée pour les comptes sensibles

## HTTPS / Headers

- [ ] HTTPS actif
- [ ] HTTP redirigé vers HTTPS
- [ ] HSTS
- [ ] X-Content-Type-Options
- [ ] X-Frame-Options
- [ ] CSP
- [ ] frame-ancestors
- [ ] Referrer-Policy
- [ ] Permissions-Policy

## Application

- [ ] Protection brute force
- [ ] Rate limiting
- [ ] CSRF
- [ ] Validation des entrées
- [ ] Cookies Secure
- [ ] Cookies HttpOnly
- [ ] Cookies SameSite

## Exposition

- [ ] Pas de sauvegarde publique
- [ ] Pas de `.env` public
- [ ] Pas de fichiers `.sql`, `.zip`, `.bak` publics
- [ ] Pas de directory listing
- [ ] REST API contrôlée
- [ ] XML-RPC évalué

## Infrastructure

- [ ] Base de données non exposée
- [ ] SSH/SFTP sécurisé
- [ ] MFA hébergeur
- [ ] Sauvegardes disponibles
- [ ] Restauration testée

## Scans

- [ ] WPScan
- [ ] Scanner TLS
- [ ] Scanner de headers
- [ ] Analyse manuelle des résultats

---

# Conclusion

Cet audit constitue une **première passe de sécurité**, et non un pentest complet.

Son objectif est de détecter rapidement les problèmes les plus fréquents : composants vulnérables, comptes excessivement privilégiés, mauvaise configuration HTTPS/headers, exposition de fichiers, authentification insuffisamment protégée, défauts de cookies, API exposées et absence de sauvegardes fiables.

Pour un audit plus poussé, il faudra compléter cette démarche par une analyse du code des plugins/thèmes personnalisés, une revue de configuration serveur, une analyse approfondie des droits WordPress, des tests d’autorisation et des tests d’intrusion contrôlés.
