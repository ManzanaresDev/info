# 📄 Modèle d'autorisation d'audit de sécurité

> **À faire signer avant toute intervention**

---

# Lettre d'autorisation d'audit de sécurité

## Informations générales

**Client :**

- Nom de l'entreprise :
- Représentant autorisé :
- Fonction :
- Adresse :
- Téléphone :
- E-mail :

**Prestataire / Auditeur :**

- Nom :
- Société :
- Adresse :
- Téléphone :
- E-mail :

---

# Objet

La présente lettre autorise le prestataire à réaliser un audit de sécurité informatique sur les systèmes définis dans le périmètre ci-dessous.

L'objectif est d'identifier les vulnérabilités pouvant affecter la confidentialité, l'intégrité et la disponibilité des systèmes audités.

---

# Périmètre autorisé

## Sites web

- https://example.com
- https://admin.example.com

## Sous-domaines

- api.example.com
- blog.example.com

## Adresses IP

- 203.0.113.15
- 203.0.113.16

## Applications

- Site WordPress
- API REST
- Espace d'administration

## Environnement

- Production
- Préproduction
- Développement

(cocher les environnements concernés)

---

# Types de tests autorisés

☐ Reconnaissance passive

☐ Énumération

☐ Scan de ports

☐ Analyse des headers HTTP

☐ Analyse TLS/SSL

☐ Audit WordPress

☐ Audit des plugins

☐ Audit des thèmes

☐ Test d'authentification

☐ Test de contrôle d'accès

☐ Tests XSS

☐ Tests CSRF

☐ Tests SQL Injection

☐ Tests Upload de fichiers

☐ Tests API

☐ Vérification des permissions

☐ Analyse des configurations serveur

☐ Analyse des cookies

☐ Analyse CSP

☐ Autres :

---

---

# Tests interdits

Les actions suivantes sont interdites sauf autorisation expresse :

- Déni de service (DoS / DDoS)
- Suppression de données
- Modification volontaire des données
- Création de comptes administrateurs
- Installation de portes dérobées
- Exploitation persistante après validation d'une vulnérabilité
- Attaques contre des systèmes hors périmètre

---

# Fenêtre d'intervention

Début :

\_**\_ / \_\_** / **\_\_**

Heure :

\_**\_ h \_\_**

Fin :

\_**\_ / \_\_** / **\_\_**

Heure :

\_**\_ h \_\_**

Fuseau horaire :

---

---

# Contacts d'urgence

## Client

Nom :

Téléphone :

E-mail :

---

## Prestataire

Nom :

Téléphone :

E-mail :

---

# Gestion des incidents

En cas d'incident susceptible d'impacter la disponibilité ou l'intégrité des systèmes, le prestataire s'engage à :

- interrompre immédiatement les tests concernés ;
- informer le contact désigné ;
- fournir les informations techniques nécessaires à l'analyse de l'incident.

---

# Confidentialité

Toutes les informations obtenues durant l'audit sont considérées comme confidentielles.

Le prestataire s'engage à :

- ne pas divulguer les informations collectées ;
- ne pas conserver de copie des données au-delà de la durée nécessaire à la mission ;
- remettre ou détruire les données selon les modalités convenues avec le client.

---

# Livrables

Le prestataire remettra :

- un rapport d'audit détaillé ;
- une liste des vulnérabilités identifiées ;
- une évaluation de la criticité ;
- des recommandations de correction ;
- un plan de remédiation.

---

# Responsabilités

Le client :

- déclare être propriétaire ou dûment autorisé à faire auditer les systèmes mentionnés ;
- accepte les risques inhérents aux tests autorisés ;
- s'engage à informer les équipes concernées si nécessaire.

Le prestataire :

- réalisera uniquement les tests autorisés ;
- respectera le périmètre défini ;
- interrompra immédiatement tout test présentant un risque imprévu.

---

# Validité de l'autorisation

Cette autorisation est valable uniquement pour la période indiquée et le périmètre défini dans ce document.

Toute modification du périmètre nécessite un accord écrit complémentaire.

---

# Acceptation

En signant ce document, les parties reconnaissent avoir pris connaissance des conditions ci-dessus.

| Client      | Prestataire |
| ----------- | ----------- |
| Nom :       | Nom :       |
| Fonction :  | Fonction :  |
| Date :      | Date :      |
| Signature : | Signature : |

---

# Annexe (facultative)

## Outils susceptibles d'être utilisés

- Burp Suite
- OWASP ZAP
- WPScan
- Nmap
- WhatWeb
- Nikto
- Nuclei
- SQLMap (si autorisé)
- testssl.sh
- SecurityHeaders
- Wappalyzer

---

## Références

- OWASP Web Security Testing Guide (WSTG)
- OWASP ASVS
- OWASP Top 10
- MITRE CWE
- NIST SP 800-115 (Technical Guide to Information Security Testing and Assessment)
