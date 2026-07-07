# Guide des sections légales obligatoires pour un site web (France / UE)

> ⚠️ **Avertissement** : ce guide est une base de travail à usage professionnel (agence web), pas un avis juridique. Les obligations varient selon l'activité du client (e-commerce, SaaS, blog, association...), son statut et ses traitements de données. Pour chaque projet un peu sensible (vente en ligne, données sensibles, gros volume d'utilisateurs), fais valider le contenu final par un avocat ou un juriste. Ce guide te permet surtout de ne rien oublier et de produire un premier jet solide.

---

## Vue d'ensemble : quelle section pour quel site ?

| Section | Obligatoire pour... | Base légale principale |
|---|---|---|
| Mentions légales | **Tous les sites**, sans exception | LCEN (loi n°2004-575, art. 6-III) |
| Politique de confidentialité (RGPD) | Tout site qui collecte des données personnelles (formulaire contact, newsletter, compte, etc.) | RGPD + Loi Informatique et Libertés |
| Politique de gestion des cookies + bandeau | Tout site utilisant des cookies non strictement nécessaires (analytics, pub, réseaux sociaux) | RGPD + directive ePrivacy + recommandations CNIL |
| CGV (Conditions Générales de Vente) | Tout site qui **vend** un produit ou service en ligne | Code de la consommation |
| CGU (Conditions Générales d'Utilisation) | Tout site avec compte utilisateur, espace membre, plateforme, SaaS, forum, avis en ligne | Pas d'obligation légale stricte, mais fortement recommandé + obligatoire de fait dans certains cas (plateformes, avis clients - loi Hamon) |
| Politique de retour / rétractation | Sites e-commerce B2C | Code de la consommation (art. L221-18 et s.) |
| Accessibilité (déclaration RGAA) | Organismes publics, entreprises > certains seuils de CA | Loi n°2005-102, RGAA |

---

## 1. Mentions légales (OBLIGATOIRES pour tout site)

C'est la section non-négociable. Son absence est sanctionnée pénalement (jusqu'à 1 an d'emprisonnement et 75 000 € d'amende pour une personne physique, 375 000 € pour une personne morale — art. 6-VI LCEN).

### Contenu à inclure

**Si le client est une entreprise (personne morale) :**
- Dénomination sociale / raison sociale
- Forme juridique (SARL, SAS, EI, auto-entrepreneur...)
- Montant du capital social (si société)
- Adresse du siège social
- Numéro de téléphone
- Adresse email de contact
- Numéro RCS (Registre du Commerce et des Sociétés) + ville d'immatriculation
- Numéro SIRET / SIREN
- Numéro de TVA intracommunautaire (si applicable)
- Nom du directeur de la publication (souvent le gérant/président)

**Si le client est un particulier / auto-entrepreneur :**
- Nom et prénom
- Adresse (professionnelle si possible)
- Numéro de téléphone
- Adresse email
- Numéro SIRET

**Concernant l'hébergeur (toujours obligatoire) :**
- Nom ou raison sociale de l'hébergeur
- Adresse complète
- Numéro de téléphone

**Si activité réglementée (avocat, médecin, agent immobilier...) :**
- Référence aux règles professionnelles applicables
- Numéro d'inscription à l'ordre professionnel ou au registre concerné

### Modèle de trame

```markdown
## Mentions légales

### Éditeur du site
[Raison sociale] – [Forme juridique] au capital de [montant] €
Siège social : [adresse complète]
RCS [ville] [numéro] – SIRET : [numéro]
N° TVA intracommunautaire : [numéro]
Téléphone : [numéro]
Email : [email]
Directeur de la publication : [Nom Prénom]

### Hébergement
[Nom de l'hébergeur]
[Adresse complète de l'hébergeur]
Téléphone : [numéro]
Site web : [URL]
```

---

## 2. Politique de confidentialité / Protection des données (RGPD)

Obligatoire dès que le site collecte la moindre donnée personnelle (formulaire de contact, adresse email, cookies de mesure d'audience, etc.).

### Contenu à inclure
- Identité du responsable de traitement (souvent l'éditeur du site)
- Finalités des traitements (ex : répondre aux demandes de contact, envoyer une newsletter, gérer un compte client)
- Base légale de chaque traitement (consentement, exécution d'un contrat, intérêt légitime, obligation légale)
- Données collectées (nom, email, IP, données de navigation...)
- Destinataires des données (équipe interne, sous-traitants, prestataires tiers type Mailchimp, Stripe...)
- Durée de conservation des données
- Transferts hors UE (le cas échéant), avec garanties (clauses contractuelles types, etc.)
- Droits des personnes : accès, rectification, effacement, limitation, opposition, portabilité
- Modalités d'exercice de ces droits (email dédié, formulaire)
- Droit de réclamation auprès de la CNIL
- Mention de l'usage ou non de décisions automatisées / profilage
- Coordonnées du DPO si le client en a désigné un

### Modèle de trame

```markdown
## Politique de confidentialité

### 1. Responsable de traitement
[Nom entreprise], [adresse], joignable à [email]

### 2. Données collectées et finalités
- Formulaire de contact : nom, email, message → traitement de la demande
- Newsletter : email → envoi d'actualités (sur consentement)
- Navigation : adresse IP, cookies → mesure d'audience

### 3. Base légale
[Consentement / intérêt légitime / exécution du contrat]

### 4. Durée de conservation
[ex : 3 ans après le dernier contact pour les données commerciales]

### 5. Destinataires
[équipe interne, prestataire d'hébergement, outil d'emailing...]

### 6. Vos droits
Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation,
d'opposition et de portabilité de vos données. Pour l'exercer, contactez-nous à
[email dédié]. Vous pouvez également introduire une réclamation auprès de la CNIL
(www.cnil.fr).
```

---

## 3. Politique de gestion des cookies

Distincte de la politique de confidentialité (même si parfois fusionnée pour les petits sites).

### Contenu à inclure
- Définition de ce qu'est un cookie
- Liste des cookies utilisés, classés par catégorie :
  - Cookies strictement nécessaires (panier, session, sécurité) → pas de consentement requis
  - Cookies de mesure d'audience (Google Analytics, Matomo...) → consentement requis sauf configuration exemptée CNIL
  - Cookies publicitaires / réseaux sociaux → consentement requis
- Finalité de chaque cookie et durée de conservation
- Moyen de gérer/retirer son consentement à tout moment (lien vers le centre de préférences)
- Nom des tiers émetteurs de cookies (Google, Meta, etc.)

### Point technique important
Le bandeau cookies doit permettre un **refus aussi simple que l'acceptation** (un seul clic pour chaque option), avec un bouton "Tout refuser" au même niveau visuel que "Tout accepter". C'est une exigence CNIL fréquemment mal implémentée — à vérifier systématiquement sur tes réalisations.

---

## 4. CGV — Conditions Générales de Vente

Obligatoires dès qu'il y a **vente** (produit physique, produit numérique, prestation de service payante en ligne).

### Contenu à inclure
- Identification du vendeur (reprend les mentions légales)
- Description des produits/services et de leurs caractéristiques essentielles
- Prix (TTC, devise, frais de port éventuels)
- Modalités de commande (étapes du tunnel d'achat)
- Modalités et moyens de paiement acceptés
- Modalités de livraison / délai d'exécution
- Droit de rétractation : délai de 14 jours (B2C), modalités d'exercice, exceptions (produits numériques téléchargés immédiatement, produits personnalisés...)
- Garanties légales (conformité, vices cachés) et modalités de SAV
- Politique de remboursement / retour
- Clause de responsabilité et de force majeure
- Droit applicable et juridiction compétente
- Modalités de règlement des litiges (médiation de la consommation obligatoire pour les professionnels vendant à des particuliers)

### Modèle de trame

```markdown
## Conditions Générales de Vente

### 1. Objet
Les présentes CGV régissent les ventes de [produits/services] par [entreprise]
via le site [URL].

### 2. Prix
Les prix sont indiqués en euros TTC. [Entreprise] se réserve le droit de les
modifier à tout moment, les commandes en cours restant au prix convenu.

### 3. Commande
[Décrire les étapes : sélection, panier, validation, paiement]

### 4. Paiement
Moyens acceptés : [CB, PayPal, virement...]. Le paiement est exigible
[à la commande / à la livraison].

### 5. Droit de rétractation
Conformément à l'article L221-18 du Code de la consommation, vous disposez
d'un délai de 14 jours pour exercer votre droit de rétractation, sauf exceptions
prévues à l'article L221-28 (produits numériques fournis immédiatement avec
accord exprès, biens personnalisés, etc.).

### 6. Garanties
Nos produits/services bénéficient de la garantie légale de conformité
(art. L217-3 et s. du Code de la consommation) et de la garantie des vices
cachés (art. 1641 et s. du Code civil).

### 7. Médiation
En cas de litige, vous pouvez recourir gratuitement au médiateur de la
consommation : [nom et coordonnées du médiateur choisi].

### 8. Droit applicable
Les présentes CGV sont soumises au droit français. Tout litige relève de la
compétence des tribunaux de [ville].
```

---

## 5. CGU — Conditions Générales d'Utilisation

Recommandées (parfois quasi-obligatoires en pratique) dès qu'il y a un compte utilisateur, une plateforme collaborative, un espace membre, un système d'avis, une messagerie, etc.

### Contenu à inclure
- Objet du service et description fonctionnelle
- Conditions d'accès (âge minimum, zone géographique, création de compte)
- Obligations de l'utilisateur (usage loyal, contenu autorisé/interdit)
- Règles de modération et de suppression de contenu
- Propriété intellectuelle (qui possède quoi : contenu du site vs contenu généré par l'utilisateur)
- Responsabilités et limitations de responsabilité de l'éditeur
- Disponibilité du service (pas de garantie de disponibilité continue)
- Modalités de résiliation / suppression de compte
- Modification des CGU (procédure d'information des utilisateurs)
- Droit applicable et juridiction

---

## 6. Autres éléments souvent nécessaires

### Bandeau/lien "Gérer mes cookies" permanent
Accessible à tout moment (souvent en footer), pas seulement au premier chargement.

### Page ou mention sur l'accessibilité
Obligatoire pour les organismes publics et les entreprises dont le chiffre d'affaires dépasse un certain seuil (250 M€ en France actuellement, seuil qui évolue avec la transposition de directives européennes) — à vérifier au cas par cas selon le client.

### Sitemap + robots.txt
Pas une obligation légale mais une bonne pratique technique à inclure systématiquement dans tes livraisons.

---

## Checklist rapide à donner à chaque client

- [ ] Mentions légales complètes et à jour
- [ ] Politique de confidentialité si collecte de données
- [ ] Bandeau cookies conforme (refus aussi facile que l'acceptation)
- [ ] Politique de cookies détaillée et accessible en permanence
- [ ] CGV si vente en ligne
- [ ] CGU si compte utilisateur / plateforme
- [ ] Liens vers ces pages visibles en footer sur toutes les pages
- [ ] Formulaires de contact avec case de consentement RGPD explicite
- [ ] Vérification du médiateur de la consommation si vente B2C

---

## Ressources officielles utiles

- CNIL (Commission Nationale de l'Informatique et des Libertés) : https://www.cnil.fr
- Service Public - mentions légales : https://entreprendre.service-public.fr
- Légifrance (textes de loi) : https://www.legifrance.gouv.fr

---

*Document généré comme base de travail interne. À faire relire par un juriste pour toute mise en production sur un site à fort enjeu (e-commerce, données sensibles, volumétrie importante d'utilisateurs).*
