# Analyser le trafic de votre site web
## Guide complet — Google Analytics 4

---

## Sommaire

1. [Pourquoi Google Analytics 4 ?](#pourquoi-ga4)
2. [Créer votre compte GA4](#créer-votre-compte-ga4)
3. [Installer le tag sur votre site](#installer-le-tag-sur-votre-site)
4. [Vérifier que ça fonctionne](#vérifier-que-ça-fonctionne)
5. [Les métriques clés à suivre](#les-métriques-clés-à-suivre)
6. [Naviguer dans les rapports](#naviguer-dans-les-rapports)
7. [Alternatives à GA4](#alternatives-à-ga4) *(dont Microsoft Clarity)*
8. [FAQ et problèmes courants](#faq-et-problèmes-courants)

---

## Pourquoi GA4 ?

Google Analytics 4 est la solution d'analyse la plus utilisée au monde. Elle est **gratuite**, puissante, et couvre l'ensemble des besoins d'un site standard :

- Nombre de visiteurs (uniques, nouveaux, récurrents)
- Temps passé sur chaque page
- Taux d'engagement (anciennement "taux de rebond")
- Sources de trafic (Google, réseaux sociaux, direct…)
- Pages les plus visitées
- Comportement de navigation
- Données géographiques et démographiques

> **Note RGPD** : GA4 transfère des données vers des serveurs américains. Si vous êtes très sensible à la conformité RGPD, consultez la section [Alternatives à GA4](#alternatives-à-ga4).

---

## Créer votre compte GA4

### Étape 1 — Accéder à Google Analytics

Rendez-vous sur [analytics.google.com](https://analytics.google.com) et connectez-vous avec votre compte Google.

### Étape 2 — Créer un compte

1. Cliquez sur **"Commencer à mesurer"**
2. Donnez un **nom de compte** (ex : *Mon Entreprise*)
3. Choisissez vos préférences de partage de données → cliquez **Suivant**

### Étape 3 — Créer une propriété

1. Donnez un **nom à la propriété** (ex : *Site principal*)
2. Choisissez votre **fuseau horaire** (Europe/Paris) et la **devise** (EUR)
3. Cliquez sur **Suivant**

### Étape 4 — Décrire votre activité

Remplissez les informations sur votre secteur et la taille de votre entreprise (optionnel mais utile pour les recommandations de GA4).

### Étape 5 — Choisir un flux de données

1. Sélectionnez **"Web"**
2. Entrez l'**URL de votre site** (ex : `https://monsite.fr`)
3. Donnez un **nom au flux** (ex : *Site web principal*)
4. Cliquez sur **Créer et continuer**

Vous obtenez alors votre **ID de mesure** au format `G-XXXXXXXXXX`. Notez-le, vous en aurez besoin à l'étape suivante.

---

## Installer le tag sur votre site

Choisissez la méthode correspondant à votre situation.

---

### Option A — Installation manuelle (HTML)

Si vous gérez votre site directement en HTML/CSS ou via un framework custom :

1. Copiez le **code de suivi** fourni par GA4 (dans *Administration > Flux de données > votre flux > Balise Google*)

2. Collez ce snippet juste **avant la balise fermante `</head>`** de chaque page :

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

> Remplacez `G-XXXXXXXXXX` par votre vrai ID de mesure.

---

### Option B — WordPress

**Méthode recommandée : plugin Site Kit by Google**

1. Dans votre tableau de bord WordPress, allez dans **Extensions > Ajouter**
2. Recherchez **"Site Kit by Google"** et installez-le
3. Activez le plugin et suivez l'assistant de configuration
4. Connectez votre compte Google et autorisez l'accès à Analytics
5. C'est tout — le tag est automatiquement injecté sur toutes vos pages

**Méthode alternative : plugin Insert Headers and Footers**

1. Installez le plugin **"Insert Headers and Footers"**
2. Allez dans **Réglages > Insert Headers and Footers**
3. Collez le code GA4 dans la section **Header**
4. Sauvegardez

---

### Option C — Shopify

1. Dans votre admin Shopify, allez dans **Boutique en ligne > Préférences**
2. Faites défiler jusqu'à la section **Google Analytics**
3. Collez votre ID de mesure `G-XXXXXXXXXX`
4. Sauvegardez

---

### Option D — Wix

1. Dans l'éditeur Wix, allez dans **Paramètres > Marketing & SEO > Intégrations marketing**
2. Sélectionnez **Google Analytics**
3. Entrez votre ID de mesure et activez l'intégration

---

### Option E — Google Tag Manager (recommandé pour les sites complexes)

Si vous utilisez déjà GTM ou souhaitez gérer plusieurs tags sans toucher au code :

1. Dans GTM, créez une **nouvelle balise** de type *Google Tag*
2. Entrez votre ID de mesure `G-XXXXXXXXXX`
3. Configurez le **déclencheur** sur *All Pages*
4. Publiez le conteneur

---

## Vérifier que ça fonctionne

### Test en temps réel

1. Dans GA4, allez dans **Rapports > Temps réel**
2. Ouvrez votre site dans un autre onglet et naviguez dessus
3. Vous devriez voir **"1 utilisateur actif"** apparaître dans les 30 secondes

### Extension Chrome — GA Debugger

Pour un diagnostic plus précis :

1. Installez l'extension **"Google Analytics Debugger"** sur Chrome
2. Activez-la sur votre site
3. Ouvrez la console du navigateur (F12) : vous verrez les événements GA4 se déclencher en temps réel

> **Les données complètes apparaissent sous 24 à 48h.** Ne vous inquiétez pas si les rapports sont vides le premier jour.

---

## Les métriques clés à suivre

| Métrique | Ce qu'elle mesure | Où la trouver dans GA4 |
|---|---|---|
| **Utilisateurs actifs** | Visiteurs uniques sur une période | Rapports > Aperçu |
| **Sessions** | Nombre de visites (1 utilisateur peut avoir plusieurs sessions) | Rapports > Aperçu |
| **Taux d'engagement** | % de sessions avec interaction > 10s ou 2 pages vues | Rapports > Aperçu |
| **Durée d'engagement** | Temps moyen passé activement sur le site | Rapports > Pages |
| **Pages / session** | Nombre moyen de pages vues par visite | Rapports > Aperçu |
| **Nouveaux utilisateurs** | Visiteurs qui viennent pour la 1ère fois | Rapports > Aperçu |
| **Source / Support** | D'où viennent vos visiteurs (Google, Facebook…) | Rapports > Acquisition |
| **Pages les plus vues** | Contenu le plus consulté | Rapports > Engagement > Pages |

> **Taux de rebond dans GA4** : GA4 utilise désormais le **taux d'engagement** (inverse du rebond). Un taux d'engagement de 60% = 40% de "rebond". Une session est considérée comme engagée si elle dure plus de 10 secondes, visite 2+ pages, ou déclenche un événement de conversion.

---

## Naviguer dans les rapports

### Rapports principaux

**Tableau de bord — Aperçu**
Vue d'ensemble rapide : utilisateurs, sessions, revenus si applicable.

**Acquisition → Vue d'ensemble**
D'où viennent vos visiteurs : organique, direct, social, e-mail, référent.

**Engagement → Pages et écrans**
Quelles pages sont les plus visitées, combien de temps les gens y restent.

**Démographie → Vue d'ensemble**
Pays, ville, langue, âge et genre (si suffisamment de données).

### Plage de dates

En haut à droite, vous pouvez sélectionner n'importe quelle plage de dates et **comparer avec une période précédente** pour mesurer votre progression.

### Explorations (rapports avancés)

Dans le menu de gauche, **Explorations** vous permet de créer des rapports personnalisés : entonnoirs de conversion, parcours utilisateurs, segments personnalisés, etc.

---

## Alternatives à GA4

Si vous recherchez une solution plus respectueuse de la vie privée ou plus simple :

### Matomo — Open source & auto-hébergé

- **Avantages** : 100% RGPD, données chez vous, sans partage avec Google, fonctionnalités avancées
- **Inconvénients** : nécessite un hébergement et une installation serveur
- **Prix** : Gratuit (auto-hébergé) ou à partir de 19€/mois (cloud)
- **Site** : [matomo.org](https://matomo.org)

### Plausible — Simple et RGPD natif

- **Avantages** : script ultra-léger (< 1ko), sans cookies, interface épurée, hébergé en Europe
- **Inconvénients** : moins de métriques avancées que GA4
- **Prix** : à partir de 9$/mois
- **Site** : [plausible.io](https://plausible.io)

### Fathom — Minimaliste

- **Avantages** : même esprit que Plausible, très facile à lire, sans cookies
- **Prix** : à partir de 14$/mois
- **Site** : [usefathom.com](https://usefathom.com)

### Microsoft Clarity — Heatmaps & enregistrements de sessions

- **Avantages** : gratuit et sans limite de trafic, heatmaps de clics et de scroll, enregistrements de sessions utilisateurs (replay), intégration native avec Google Analytics 4, tableau de bord simple et visuel
- **Inconvénients** : métriques d'audience limitées (pas de sources de trafic détaillées), données hébergées par Microsoft (considérations RGPD similaires à GA4)
- **Prix** : Gratuit
- **Site** : [clarity.microsoft.com](https://clarity.microsoft.com)

**Installation :**

1. Créez un compte sur [clarity.microsoft.com](https://clarity.microsoft.com) et ajoutez votre site
2. Copiez le snippet fourni et collez-le **avant la balise fermante `</head>`** de chaque page :

```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "VOTRE_ID_CLARITY");
</script>
```

> Clarity se distingue de GA4 par sa dimension **qualitative** : là où GA4 vous dit *combien* de personnes visitent une page, Clarity vous montre *comment* elles interagissent avec elle (zones de clic, profondeur de scroll, moments de friction, rage clicks).

---

### Cloudflare Analytics — Si vous utilisez Cloudflare

- **Avantages** : intégré à Cloudflare, sans JavaScript, sans cookies, gratuit
- **Inconvénients** : métriques limitées (pas de durée de session, pas de sources détaillées)
- **Prix** : Gratuit

---

## FAQ et problèmes courants

**Je ne vois aucune donnée après 48h**
Vérifiez que le tag est bien présent sur votre site (clic droit > Inspecter > recherchez `gtag` dans le code source). Vérifiez aussi que vous n'avez pas d'ad-blocker actif lors des tests.

**Le taux d'engagement est très bas (< 30%)**
Cela peut indiquer que vos visiteurs ne trouvent pas ce qu'ils cherchent, ou que votre page met trop de temps à charger. Analysez les pages avec le plus faible engagement en priorité.

**Comment exclure mes propres visites ?**
Installez l'extension Chrome **"Google Analytics Opt-out"** pour ne pas vous comptabiliser vous-même dans les statistiques.

**Mes données sont-ées conformes au RGPD ?**
GA4 transfère des données vers les USA. Pour être en conformité stricte, vous devez afficher une bannière de consentement aux cookies et permettre aux utilisateurs de refuser le tracking. Utilisez un CMP (Consent Management Platform) comme Axeptio ou Cookiebot.

**Je veux suivre les clics sur un bouton spécifique**
GA4 traque automatiquement certains clics. Pour des événements personnalisés, utilisez Google Tag Manager et créez un déclencheur sur le sélecteur CSS de votre bouton.

---

*Document généré avec Claude — [analytics.google.com](https://analytics.google.com)*
