# Guide d'audit de sécurité web — Procédure et modèle de rapport

## Avant de commencer : cadre légal

Un audit de sécurité ne doit **jamais** être réalisé sans autorisation écrite explicite du propriétaire du site (un mandat ou « lettre d'autorisation »). Tester un site sans accord constitue une infraction dans la plupart des juridictions, même sans intention malveillante. Le mandat doit préciser : périmètre testé, dates, types de tests autorisés, contacts d'urgence.

---

## 1. Méthodologie générale

Un audit type suit ces grandes étapes :

1. **Reconnaissance** — comprendre l'architecture du site (technologies utilisées, sous-domaines, points d'entrée).
2. **Cartographie** — lister toutes les pages, formulaires, API, paramètres.
3. **Analyse des configurations** — headers HTTP, cookies, certificats TLS, CMS/serveurs exposés.
4. **Tests de vulnérabilités** — injection, authentification, contrôle d'accès, clickjacking, XSS, CSRF, etc.
5. **Vérification manuelle** — les scanners automatiques génèrent des faux positifs ; chaque résultat critique doit être confirmé manuellement.
6. **Documentation et rapport** — consigner chaque constat avec preuve, criticité et recommandation.
7. **Restitution** — présenter les résultats au client, proposer un plan de remédiation et un éventuel re-test.

---

## 2. Reconnaissance

- Identifier les technologies : `whatweb`, `wappalyzer`, ou simplement inspecter le code source et les headers (`Server`, `X-Powered-By`).
- Lister les sous-domaines : outils comme `subfinder`, `amass`, ou recherche manuelle via certificats SSL (crt.sh).
- Vérifier les enregistrements DNS et la présence de services exposés (ports ouverts via `nmap` — uniquement si autorisé).

## 3. Cartographie du site

- Parcourir le site manuellement pour lister pages, formulaires, paramètres d'URL.
- Utiliser un proxy d'interception (Burp Suite, OWASP ZAP) pour capturer toutes les requêtes pendant la navigation.
- Identifier les zones sensibles en priorité : authentification, gestion de compte, paiement, upload de fichiers, API.

## 4. Analyse des configurations de sécurité

Points à vérifier systématiquement :

- **Headers de sécurité** : `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Cookies** : attributs `Secure`, `HttpOnly`, `SameSite`.
- **TLS/SSL** : version du protocole, validité du certificat, algorithmes de chiffrement (outil : `testssl.sh` ou SSL Labs).
- **CORS** : vérifier que les configurations `Access-Control-Allow-Origin` ne sont pas trop permissives (`*` sur des endpoints sensibles).
- **Informations divulguées** : messages d'erreur détaillés, fichiers de configuration accessibles (`.env`, `.git`, `robots.txt`, sauvegardes).

## 5. Tests de vulnérabilités courants

Pour chaque page/formulaire identifié, tester (selon le périmètre autorisé) :

- **Injection** (SQL, commande, LDAP) : champs de saisie, paramètres d'URL, en-têtes.
- **XSS** (réfléchi, stocké, DOM) : injecter des payloads inoffensifs dans les champs et observer le rendu.
- **CSRF** : vérifier la présence de jetons anti-CSRF sur les actions sensibles.
- **Clickjacking** : test d'intégration en iframe (voir section précédente de la conversation).
- **Contrôle d'accès** : tenter d'accéder à des ressources d'un autre utilisateur (IDOR), tester les rôles/permissions.
- **Authentification** : politique de mots de passe, gestion des sessions, verrouillage après échecs, réinitialisation de mot de passe.
- **Upload de fichiers** : restrictions de type/taille, exécution de fichiers uploadés.
- **Gestion des erreurs** : traces de pile, messages révélant la structure interne.

## 6. Outils recommandés

- **Burp Suite Community/Pro** ou **OWASP ZAP** — proxy d'interception et scanner.
- **Nikto** — scan de configuration serveur.
- **testssl.sh / SSL Labs** — analyse TLS.
- **securityheaders.com** — vérification rapide des headers HTTP.
- **Nuclei** — scanner de vulnérabilités basé sur des templates.

## 7. Documentation pendant l'audit

Pour chaque constat, conserver immédiatement :

- URL exacte et requête HTTP complète (en-têtes, méthode, corps).
- Capture d'écran ou réponse du serveur prouvant la vulnérabilité.
- Étapes de reproduction précises.

Cela évite de devoir tout retester au moment de rédiger le rapport.

---

## 8. Échelle de criticité

| Niveau | Description | Exemple |
|---|---|---|
| **Critique** | Exploitation triviale, impact majeur (accès admin, fuite massive de données) | Injection SQL sur authentification |
| **Élevé** | Impact significatif, conditions d'exploitation modérées | XSS stocké sur page utilisateur |
| **Moyen** | Impact limité ou conditions complexes | Absence de `SameSite` sur cookies non sensibles |
| **Faible** | Impact mineur, principalement informatif | Bannière de version de serveur visible |
| **Informationnel** | Pas de risque direct, bonne pratique recommandée | En-tête `Referrer-Policy` absent |

---

# Modèle de rapport d'audit

## Page de garde

- **Nom du client / projet** :
- **Périmètre audité** (URLs, sous-domaines) :
- **Type d'audit** (boîte noire / grise / blanche) :
- **Dates de réalisation** :
- **Auditeur(s)** :
- **Version du document** :

## 1. Résumé exécutif

Synthèse en quelques paragraphes, destinée à un public non technique (direction) :

- Contexte et objectifs de l'audit.
- Nombre de vulnérabilités par niveau de criticité (tableau récapitulatif).
- Évaluation globale du niveau de sécurité.
- Recommandations prioritaires.

| Criticité | Nombre |
|---|---|
| Critique | |
| Élevé | |
| Moyen | |
| Faible | |
| Informationnel | |

## 2. Périmètre et méthodologie

- URLs/applications testées.
- Tests inclus / exclus du périmètre.
- Outils utilisés.
- Limitations (ex : tests de déni de service exclus, environnement de pré-production utilisé).

## 3. Constats détaillés

Pour chaque vulnérabilité, utiliser une fiche standardisée :

---

### [ID-001] Titre de la vulnérabilité

- **Criticité** : Critique / Élevé / Moyen / Faible / Informationnel
- **Catégorie** : (ex : Contrôle d'accès, Injection, Configuration...)
- **URL/Endpoint concerné** :
- **Description** : explication claire de la vulnérabilité et de son fonctionnement.
- **Impact** : ce qu'un attaquant pourrait faire en exploitant cette faille.
- **Preuve de concept (PoC)** : requête HTTP, capture d'écran, étapes de reproduction.
- **Recommandation** : correction technique précise (avec exemple de configuration si pertinent).
- **Références** : liens OWASP, CWE, CVE le cas échéant.

---

*(Répéter cette fiche pour chaque constat, classé par ordre de criticité décroissante)*

## 4. Plan de remédiation

| ID | Vulnérabilité | Criticité | Action recommandée | Responsable suggéré | Délai recommandé |
|---|---|---|---|---|---|
| ID-001 | | | | | |

## 5. Annexes

- Liste complète des requêtes/réponses HTTP.
- Captures d'écran supplémentaires.
- Sorties brutes des outils (logs de scan).
- Glossaire des termes techniques (si rapport destiné à un public mixte).

---

## Bonnes pratiques pour la restitution

- Toujours présenter le résumé exécutif **avant** les détails techniques.
- Éviter le jargon dans le résumé exécutif ; le réserver aux fiches détaillées.
- Proposer un appel ou une réunion de restitution pour répondre aux questions.
- Proposer un re-test après correction pour valider la remédiation.
