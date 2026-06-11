# RGPD (Règlement Général sur la Protection des Données)

Le **RGPD** signifie **Règlement Général sur la Protection des Données**.  
C’est une loi européenne entrée en vigueur en 2018 pour protéger les données personnelles des utilisateurs sur internet et dans les applications.

En anglais : **GDPR** (_General Data Protection Regulation_).

---

# Ce que le RGPD protège

Une donnée personnelle = toute information permettant d’identifier une personne :

- nom
- email
- adresse IP
- numéro de téléphone
- localisation
- cookies
- photo
- données bancaires
- etc.

---

# Concrètement, pour un site web

Si tu as un site, une API ou une app qui collecte des données utilisateurs, tu dois respecter certaines règles.

## 1. Informer l’utilisateur

Tu dois expliquer clairement :

- quelles données sont collectées
- pourquoi
- combien de temps elles sont conservées
- qui y a accès

➡️ généralement via une **politique de confidentialité**.

---

## 2. Demander le consentement

Exemple :

- cookies analytics
- newsletter
- tracking publicitaire

L’utilisateur doit pouvoir :

- accepter
- refuser
- modifier son choix

➡️ d’où les bannières cookies.

---

## 3. Sécuriser les données

Tu dois protéger les informations :

- hash des mots de passe (`bcrypt`)
- HTTPS
- tokens sécurisés
- protections contre les fuites

---

## 4. Permettre les droits utilisateurs

L’utilisateur peut demander :

- accès à ses données
- suppression du compte
- modification des données
- export des données

➡️ le fameux “droit à l’oubli”.

---

# Pour un développeur web

Sur une stack MERN par exemple :

## Tu dois faire attention à :

- stockage sécurisé des mots de passe
- cookies `httpOnly`
- JWT sécurisés
- validation des données
- suppression des comptes
- formulaires avec consentement
- politique de confidentialité
- gestion des cookies

---

# Exemple concret

Si ton site de formation collecte :

- email
- prénom
- progression des cours

Alors tu dois :

✅ expliquer pourquoi  
✅ sécuriser MongoDB/API  
✅ permettre la suppression du compte  
✅ éviter de revendre les données  
✅ demander le consentement pour les cookies non essentiels

---

# Sanctions

Les entreprises peuvent recevoir de très grosses amendes si elles ne respectent pas le RGPD.

En France, c’est la **CNIL** (_Commission nationale de l'informatique et des libertés_) qui contrôle cela.

---

# Ce qu’on voit souvent sur les sites RGPD

- bannière cookies
- case “J’accepte les conditions”
- politique de confidentialité
- bouton supprimer mon compte
- email de consentement newsletter

---

# Outils souvent utilisés

- Cookiebot
- Axeptio
- OneTrust

---

# Pour un projet MERN

Tu peux facilement être “minimum RGPD compliant” avec :

- page Politique de confidentialité
- bannière cookies
- mots de passe hashés
- HTTPS
- suppression de compte
- cookies sécurisés
- consentement newsletter

Ça suffit déjà pour un projet portfolio / formation sérieux.
