# Tutoriel : Réaliser un audit de sécurité web

> **⚠️ Cadre légal obligatoire**
> Ne jamais auditer un site sans mandat écrit du propriétaire. Ce document doit préciser : périmètre testé, dates, types de tests autorisés, contacts d'urgence. Tester sans accord est une infraction pénale dans la plupart des juridictions.

---

## Étape 1 — Reconnaissance

**Objectif :** comprendre l'architecture du site avant tout test actif.

- Identifier les technologies utilisées (CMS, framework, serveur) via `whatweb`, Wappalyzer, ou en inspectant les headers HTTP (`Server`, `X-Powered-By`).
- Lister les sous-domaines via `subfinder`, `amass`, ou en consultant les certificats SSL sur [crt.sh](https://crt.sh).
- Vérifier les enregistrements DNS et les ports ouverts avec `nmap` — uniquement si autorisé dans le mandat.
- Consulter `robots.txt` pour découvrir des chemins cachés, et vérifier si des fichiers sensibles sont exposés (`.env`, `.git`, sauvegardes).

**Outils :** `whatweb`, `wappalyzer`, `subfinder`, `amass`, `nmap`, `crt.sh`

> 💡 À ce stade, on observe sans toucher. Toute requête active doit être couverte par le mandat.

---

## Étape 2 — Cartographie

**Objectif :** lister toutes les surfaces d'attaque possibles.

- Parcourir le site manuellement : noter chaque page, formulaire, paramètre d'URL, méthode HTTP utilisée.
- Configurer un proxy d'interception (Burp Suite ou OWASP ZAP) pour capturer toutes les requêtes pendant la navigation.
- Identifier en priorité les zones sensibles : authentification, gestion de compte, paiement, upload de fichiers, API.
- Documenter chaque endpoint découvert dans un tableau (URL, méthode, paramètres, rôle requis).

**Outils :** Burp Suite, OWASP ZAP

> 💡 Plus la cartographie est complète, moins on risque de rater une vulnérabilité critique en phase de test.

---

## Étape 3 — Analyse des configurations

**Objectif :** vérifier que le serveur est correctement sécurisé.

- **Headers HTTP** : vérifier la présence de `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Cookies** : s'assurer que les attributs `Secure`, `HttpOnly` et `SameSite` sont présents sur les cookies sensibles.
- **TLS/SSL** : analyser la version du protocole, la validité du certificat et les algorithmes de chiffrement via `testssl.sh` ou SSL Labs.
- **CORS** : vérifier la configuration `Access-Control-Allow-Origin` — une valeur `*` sur des endpoints sensibles est une faille courante.

**Outils :** `securityheaders.com`, `testssl.sh`, SSL Labs

> 💡 Ces vérifications peuvent se faire sans interagir avec l'application — elles sont rapides et révèlent souvent des problèmes majeurs.

---

## Étape 4 — Tests de vulnérabilités

**Objectif :** tester les failles les plus courantes sur chaque surface identifiée.

### Injection SQL / commande
Tester les champs de saisie, paramètres d'URL et headers avec des payloads simples. Utiliser `sqlmap` avec prudence et uniquement si autorisé.

### XSS (Cross-Site Scripting)
Injecter des payloads inoffensifs dans tous les champs et observer le rendu :
- Réfléchi : payload renvoyé dans la réponse immédiate
- Stocké : payload sauvegardé et renvoyé à d'autres utilisateurs
- DOM : manipulation du DOM côté client

### CSRF (Cross-Site Request Forgery)
Vérifier la présence de jetons anti-CSRF sur chaque action sensible (modification de compte, suppression, paiement).

### Contrôle d'accès (IDOR)
Tenter d'accéder aux ressources d'un autre utilisateur en modifiant des identifiants dans les requêtes (ex : `?user_id=123` → `?user_id=124`).

### Authentification
Tester la politique de mots de passe, le verrouillage après échecs, la réinitialisation de mot de passe et la gestion des sessions.

### Upload de fichiers
Vérifier les restrictions de type et de taille, et si un fichier uploadé peut être exécuté côté serveur.

**Outils :** Burp Suite, OWASP ZAP, Nuclei, `sqlmap`

> 💡 Chaque vulnérabilité identifiée par un scanner doit être vérifiée manuellement avant d'être signalée — les faux positifs sont très fréquents.

---

## Étape 5 — Vérification manuelle et cotation

**Objectif :** confirmer chaque constat et évaluer son niveau de risque.

- Reproduire chaque vulnérabilité étape par étape pour confirmer qu'elle est réelle.
- Évaluer l'impact réel : accès aux données ? Compromission du serveur ? Usurpation d'identité ?
- Attribuer un niveau de criticité selon l'échelle ci-dessous.
- Capturer la preuve immédiatement : ne pas attendre la rédaction du rapport.

### Échelle de criticité

| Niveau | Description | Exemple |
|---|---|---|
| **Critique** | Exploitation triviale, impact majeur | Injection SQL sur authentification |
| **Élevé** | Impact significatif, conditions modérées | XSS stocké sur page utilisateur |
| **Moyen** | Impact limité ou conditions complexes | Absence de `SameSite` sur cookies non sensibles |
| **Faible** | Impact mineur, principalement informatif | Bannière de version de serveur visible |
| **Informationnel** | Pas de risque direct, bonne pratique | En-tête `Referrer-Policy` absent |

---

## Étape 6 — Documentation

**Objectif :** consigner chaque constat avec sa preuve et sa correction.

Pour chaque vulnérabilité, rédiger une fiche standardisée :

```
ID         : [ID-001]
Titre      : Nom de la vulnérabilité
Criticité  : Critique / Élevé / Moyen / Faible / Informationnel
Catégorie  : ex. Contrôle d'accès, Injection, Configuration...
URL        : https://exemple.com/endpoint
Description: Explication claire de la vulnérabilité et de son fonctionnement.
Impact     : Ce qu'un attaquant pourrait faire en exploitant cette faille.
PoC        : Requête HTTP, captures d'écran, étapes de reproduction.
Correction : Recommandation technique précise (avec exemple si pertinent).
Références : OWASP, CWE, CVE le cas échéant.
```

Construire également le tableau de plan de remédiation :

| ID | Vulnérabilité | Criticité | Action recommandée | Responsable | Délai |
|---|---|---|---|---|---|
| ID-001 | | | | | |

> 💡 Documenter au fur et à mesure évite de devoir tout retester lors de la rédaction.

---

## Étape 7 — Restitution

**Objectif :** présenter les résultats et accompagner la remédiation.

- Commencer par le **résumé exécutif** : contexte, nombre de vulnérabilités par niveau, évaluation globale, recommandations prioritaires — sans jargon technique.
- Proposer une réunion de restitution pour répondre aux questions de l'équipe technique et de la direction.
- Remettre le rapport complet : résumé exécutif, périmètre, méthodologie, constats détaillés, plan de remédiation, annexes.
- Proposer un **re-test** après correction pour valider officiellement la remédiation.

> 💡 Le résumé exécutif est souvent la seule partie lue par la direction. Il doit être clair, sans jargon, et mettre en avant les risques métier.

---

## Outils recommandés (récapitulatif)

| Outil | Usage |
|---|---|
| Burp Suite Community/Pro | Proxy d'interception, tests manuels |
| OWASP ZAP | Proxy + scanner automatique (open source) |
| `whatweb` / Wappalyzer | Détection de technologies |
| `subfinder` / `amass` | Énumération de sous-domaines |
| `nmap` | Scan de ports (si autorisé) |
| `testssl.sh` / SSL Labs | Analyse TLS/SSL |
| `securityheaders.com` | Vérification rapide des headers HTTP |
| Nuclei | Scanner de vulnérabilités par templates |
| `sqlmap` | Test d'injection SQL (si autorisé) |

---

## Pour s'entraîner légalement

Avant de réaliser de vrais audits, pratiquer sur des environnements de test dédiés :

- [DVWA](https://dvwa.co.uk/) — Damn Vulnerable Web Application (à installer en local)
- [HackTheBox](https://hackthebox.com/) — Labs en ligne avec machines vulnérables
- [TryHackMe](https://tryhackme.com/) — Parcours guidés pour débutants
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — Labs Burp Suite gratuits, très complets

---

*Basé sur le guide d'audit de sécurité web — Procédure et modèle de rapport*
