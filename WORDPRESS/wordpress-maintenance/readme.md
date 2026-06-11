# Manuel de Maintenance WordPress pour Freelance
> Comment transformer WordPress en revenu récurrent stable

---

## Introduction : le malentendu de la maintenance

Beaucoup de développeurs juniors pensent que si le client peut modifier son site lui-même, ils ne servent plus à rien. C'est une erreur de perspective.

**Ce que le client peut faire seul :** changer du texte, ajouter une photo, publier un article.

**Ce qu'il ne sait pas faire et qui arrive constamment :** tout le reste.

La maintenance WordPress, c'est de la **tranquillité d'esprit vendue en abonnement**. Le client ne paie pas pour que tu travailles des heures — il paie pour ne jamais avoir à penser à son site.

---

## 1. Ce qui casse (et pourquoi c'est ton job)

### 1.1 Les mises à jour

WordPress est un écosystème vivant : le cœur du CMS, les plugins et le thème se mettent à jour en permanence. Ce que le client ne comprend pas :

- Les mises à jour ne sont **pas optionnelles** — elles corrigent des failles de sécurité
- L'ordre des mises à jour compte — mettre à jour un plugin avant WordPress peut casser le site
- Il faut **tester après chaque mise à jour** — une mise à jour peut entrer en conflit avec un autre plugin

**Ce que tu fais :** tu mets à jour dans un environnement de staging (ou avec un backup frais), tu testes, tu valides. Le client, lui, ne voit rien — et c'est exactement ce pour quoi il paie.

---

### 1.2 La sécurité

WordPress est la cible n°1 des bots malveillants sur internet. Pourquoi ? Parce qu'il propulse 43% du web mondial — un script qui vise WordPress peut potentiellement attaquer des millions de sites d'un coup.

**Les menaces réelles :**

- **Brute force** : des bots qui essaient des milliers de combinaisons login/mot de passe sur `/wp-admin`
- **Injections SQL** via des plugins mal codés
- **Malware** injecté dans le code si un plugin abandonné n'est plus maintenu
- **Spam** via les formulaires de contact non protégés

**Ce que tu mets en place :**

- Un plugin de sécurité (Wordfence, Solid Security)
- La double authentification (2FA) sur le compte admin
- Le blocage des tentatives de connexion répétées
- Le masquage de l'URL `/wp-admin` (changement en URL personnalisée)
- La suppression des utilisateurs admin par défaut

---

### 1.3 Les backups

C'est la base absolue, et la plupart des clients n'en ont aucun.

**Scénarios réels où le backup sauve la mise :**

- Le client efface accidentellement sa page d'accueil
- Une mise à jour casse le site (écran blanc ou erreur 500)
- Le site se fait hacker et injecter du contenu malveillant
- L'hébergeur a une panne matérielle

**Ce que tu mets en place :**

- Backup automatique quotidien (plugin : UpdraftPlus, BlogVault)
- Stockage des backups **en dehors de l'hébergeur** (Google Drive, Dropbox, S3)
- Rétention minimale : 30 jours
- Test de restauration au moins une fois par trimestre

> **Règle d'or :** un backup non testé n'est pas un backup.

---

### 1.4 La performance

Un site lent perd des visiteurs et des positions Google. La performance se dégrade avec le temps si personne ne la surveille.

**Ce qui ralentit un site WordPress :**

- Des images non compressées uploadées par le client (il met des photos à 5Mo directement depuis son iPhone)
- Le cache mal configuré ou désynchronisé après une mise à jour
- Une base de données qui grossit (révisions d'articles, spams, données orphelines de plugins désinstallés)
- Des plugins inutiles laissés actifs

**Ce que tu surveilles :**

- Score Google PageSpeed (objectif : 80+ sur mobile)
- Temps de chargement via GTmetrix ou Pingdom
- Nettoyage mensuel de la base de données (plugin : WP-Optimize)
- Compression automatique des images (plugin : Imagify, ShortPixel)

---

### 1.5 Le monitoring et les alertes

Le client ne doit jamais apprendre que son site est tombé avant toi.

**Ce que tu mets en place :**

- **Uptime monitoring** : un service qui vérifie toutes les 5 minutes si le site répond et t'envoie un SMS/email si ce n'est pas le cas (UptimeRobot — gratuit jusqu'à 50 sites)
- **Alertes d'erreurs** : notification si une page retourne une erreur 404 ou 500
- **Surveillance SSL** : alerte si le certificat HTTPS arrive à expiration (un certificat expiré = site marqué "non sécurisé" par les navigateurs)

---

## 2. Structurer ton offre

### 2.1 Les formules types

Ne vends pas des "heures de maintenance". Vends des **niveaux de sérénité**.

---

#### 🟢 Formule Essentielle — 49€/mois

Idéale pour un site vitrine simple avec peu de trafic.

- Mises à jour mensuelles (core, plugins, thème)
- Backup hebdomadaire stocké en cloud
- Monitoring uptime 24/7
- Rapport mensuel par email

---

#### 🔵 Formule Sérénité — 99€/mois

La formule la plus vendue. Couvre la grande majorité des besoins.

- Tout ce qui est dans Essentielle
- Backup quotidien
- Audit de sécurité mensuel
- Optimisation de la base de données
- Correction de bugs mineurs incluse (< 1h/mois)
- Support par email sous 48h ouvrées

---

#### 🟣 Formule Premium — 149€/mois

Pour les clients avec un site e-commerce ou à fort enjeu commercial.

- Tout ce qui est dans Sérénité
- Backup en temps réel
- Test de restauration trimestriel
- Rapport de performance mensuel (PageSpeed, temps de chargement)
- Support prioritaire sous 4h ouvrées
- 1h de modification de contenu incluse par mois

---

### 2.2 Ce qu'il ne faut pas inclure

- Des développements ou nouvelles fonctionnalités (c'est facturé en plus, au taux horaire)
- La refonte graphique
- La création de contenu
- Le référencement (SEO peut être une offre séparée)

Définir clairement ce qui n'est **pas** inclus protège ta relation client et ta rentabilité.

---

### 2.3 Contractualiser

Un contrat de maintenance doit préciser :

- La durée d'engagement (recommandé : 6 ou 12 mois)
- Les délais d'intervention
- Ce qui est inclus et ce qui est hors forfait
- Les conditions de résiliation
- La responsabilité en cas d'incident chez l'hébergeur (tu n'es pas responsable d'une panne serveur)

---

## 3. Les outils du mainteneur

### Gestion multi-sites

| Outil | Usage | Prix |
|---|---|---|
| **MainWP** | Dashboard centralisé pour gérer tous tes sites WordPress depuis un seul endroit | Gratuit (self-hosted) |
| **ManageWP** | Alternative SaaS à MainWP | Freemium |
| **InfiniteWP** | Alternative légère | Gratuit |

Avec MainWP ou ManageWP, tu peux mettre à jour 20 sites en 10 minutes depuis un tableau de bord unique.

---

### Sécurité

| Outil | Usage |
|---|---|
| **Wordfence** | Pare-feu, scanner de malware, blocage brute force |
| **Solid Security** (ex iThemes) | Durcissement de la configuration WordPress |
| **WP Activity Log** | Journal de toutes les actions sur le site (qui a fait quoi et quand) |

---

### Performance

| Outil | Usage |
|---|---|
| **WP Rocket** | Plugin de cache premium — le plus efficace du marché (49$/an) |
| **LiteSpeed Cache** | Gratuit, excellent si l'hébergeur utilise LiteSpeed |
| **Imagify / ShortPixel** | Compression d'images automatique |
| **WP-Optimize** | Nettoyage de la base de données |

---

### Backups

| Outil | Usage |
|---|---|
| **UpdraftPlus** | Le plus connu, gratuit pour l'essentiel |
| **BlogVault** | Solution premium orientée agences, restauration en 1 clic |
| **All-in-One WP Migration** | Utile pour les migrations, moins adapté aux backups réguliers |

---

### Monitoring

| Outil | Usage | Prix |
|---|---|---|
| **UptimeRobot** | Monitoring uptime + alertes | Gratuit jusqu'à 50 sites |
| **StatusCake** | Alternative avec plus d'options | Freemium |
| **Oh Dear** | Monitoring uptime + SSL + broken links | Payant (17€/mois pour plusieurs sites) |

---

## 4. Le modèle économique concret

### Combien ça rapporte vraiment ?

Prenons une hypothèse conservatrice :

| Clients | Formule | Revenu mensuel |
|---|---|---|
| 5 clients | Essentielle (49€) | 245€ |
| 5 clients | Sérénité (99€) | 495€ |
| 2 clients | Premium (149€) | 298€ |
| **Total** | | **1 038€/mois** |

Avec **12 clients** en maintenance, tu génères plus de **1 000€/mois de revenu récurrent**, avant même de signer un nouveau projet.

---

### Combien de temps ça prend vraiment ?

Avec les bons outils (MainWP ou ManageWP), voici la réalité pour la formule Sérénité :

| Tâche | Temps réel |
|---|---|
| Mises à jour via dashboard centralisé | 15 min |
| Vérification des backups | 5 min |
| Rapport de sécurité | 5 min |
| Nettoyage BDD | 5 min |
| Rédaction du rapport client | 10 min |
| **Total par client/mois** | **~40 min** |

Pour 10 clients : environ **7 heures par mois** pour **990€ récurrents**.

---

### La vraie valeur : le revenu prévisible

En freelance, le piège classique c'est le "feast or famine" — des mois très chargés suivis de mois sans rien. La maintenance résout ce problème en créant une **base de revenus incompressible** chaque mois, peu importe si tu signes de nouveaux projets ou pas.

---

## 5. Comment vendre la maintenance

### Ne la propose pas à la fin — intègre-la dès le devis

Mauvaise approche :
> *"Et je propose aussi une maintenance si vous voulez..."*

Bonne approche :
> *"La livraison du site inclut 3 mois de maintenance offerte. À l'issue de ces 3 mois, nous passons sur un contrat mensuel à X€. Vous voulez partir sur la formule Essentielle ou Sérénité ?"*

---

### Les arguments qui fonctionnent avec les clients

- **"Votre site est comme une voiture — sans entretien régulier, il finit par tomber en panne au pire moment"**
- **"Un site piraté, c'est en moyenne 3 à 5 jours de panne et une réputation en ligne endommagée"**
- **"Pour le prix d'un déjeuner par semaine, vous avez un expert qui surveille votre vitrine digitale"**

---

### Gérer les objections

**"Mon hébergeur s'occupe déjà de la sécurité"**
> L'hébergeur sécurise le serveur, pas votre site. Ce sont deux choses différentes. Un plugin WordPress vulnérable reste vulnérable même sur le meilleur hébergeur du monde.

**"Je peux faire les mises à jour moi-même"**
> Vous pouvez, oui. La question c'est : savez-vous quoi faire si une mise à jour casse le site un vendredi soir avant un week-end de promotion importante ?

**"C'est trop cher"**
> Un dépannage d'urgence sur un site piraté coûte entre 300€ et 1 000€. La maintenance, c'est l'assurance qui évite ça.

---

## 6. Rapport mensuel client

Envoie systématiquement un rapport mensuel. C'est ce qui **justifie la facture** et **réduit le churn** (les clients qui annulent).

Le rapport doit être simple, visuel, et lisible en 2 minutes :

```
📋 Rapport de maintenance — [Nom du site] — [Mois Année]

✅ Mises à jour effectuées
   - WordPress 6.x → 6.x
   - 8 plugins mis à jour
   - Thème mis à jour

🔒 Sécurité
   - 47 tentatives de connexion bloquées
   - Aucune menace détectée
   - Certificat SSL valide jusqu'au [date]

💾 Sauvegardes
   - Backup quotidien actif
   - Dernier backup vérifié : [date]
   - Stockage : Google Drive

⚡ Performance
   - Score PageSpeed mobile : 84/100
   - Temps de chargement moyen : 1,8s

🟢 Disponibilité
   - Uptime du mois : 99,98%
   - Aucune interruption de service

---
Des questions ? Répondez à cet email.
```

Ce rapport prend 10 minutes à rédiger avec un template. Il vaut de l'or pour la rétention client.

---

## Conclusion

WordPress n'est pas l'ennemi du développeur moderne. C'est une **machine à générer des revenus récurrents** si tu le structures intelligemment.

La maintenance, c'est :
- Du travail **prévisible** (pas de surprise)
- Du travail **automatisable** (bons outils = peu de temps réel)
- Du travail **récurrent** (revenu mensuel garanti)
- De la **valeur réelle** pour le client (même s'il ne la voit pas)

Et pendant que WordPress te paye chaque mois, tu continues à construire tes projets React + Strapi pour des clients qui en ont besoin.

Les deux ne s'opposent pas — ils se **financent mutuellement**.
