# 🧾 Architecture — Désactiver un client en 1 clic (site vitrine)

Ce document décrit une architecture simple et professionnelle permettant de **désactiver un site client en un clic**, tout en gardant une approche propre, scalable et sécurisée.

---

# 🧠 Principe global

Le site du client n’est pas totalement autonome.

👉 Il dépend d’un **service central (backend)** que tu contrôles.

Ainsi :

- le frontend affiche
- le backend décide
- la base de données contient l’état réel

---

# 🏗️ Architecture globale

```text
Frontend (React / Site vitrine)
        ↓
Backend (API Node.js / Express)
        ↓
Base de données (MongoDB ou autre)
        ↓
CMS (optionnel : Sanity, Strapi, etc.)
```

---

# 🔑 Concept clé : statut du client

Dans ta base de données, chaque client possède un statut :

```js
{
  clientId: "abc123",
  name: "Entreprise X",
  active: true,
  subscriptionEnd: "2026-05-01"
}
```

👉 Champ principal :

```js
active: true | false;
```

---

# ⚙️ Fonctionnement du système

## 1. Chargement du site

Le frontend appelle ton API :

```js
fetch("https://api.tonsite.com/status?client=abc123");
```

Réponse :

```js
{
  active: true;
}
```

---

## 2. Site actif

Si :

```js
active === true;
```

👉 Le site fonctionne normalement.

---

## 3. Site désactivé

Si :

```js
active === false;
```

👉 Le frontend bloque l’affichage :

```jsx
if (!active) {
  return <BlockedPage />;
}
```

---

# 🔥 Page de blocage (UX propre)

```jsx
function BlockedPage() {
  return (
    <div>
      <h1>Service suspendu</h1>
      <p>Veuillez contacter votre prestataire.</p>
    </div>
  );
}
```

✔️ Le site reste accessible
✔️ Image professionnelle conservée
✔️ Message clair

---

# 🧨 Désactivation en 1 clic (admin)

## Route backend

```js
app.post("/admin/toggle-client", (req, res) => {
  const { clientId, active } = req.body;

  // Mettre à jour en base de données
});
```

---

## Interface admin

```text
[ Désactiver le client ]
```

👉 Action = passer :

```js
active: false;
```

---

# 🔐 Sécurisation (obligatoire)

## 1. Ne pas faire confiance au frontend

👉 Toute logique doit être validée côté backend

---

## 2. Protection API

```js
if (!client.active) {
  return res.status(403).json({ error: "Client désactivé" });
}
```

👉 Même si quelqu’un modifie le JS :

- impossible de contourner

---

# ⏳ Désactivation automatique (option)

Tu peux automatiser :

```js
if (subscriptionEnd < today) {
  active = false;
}
```

✔️ gestion des abonnements
✔️ zéro action manuelle

---

# 🔌 Gestion CMS (optionnel)

Si tu utilises un CMS :

- couper l’accès édition
- laisser le site en lecture seule

---

# 💣 Niveau avancé (options supplémentaires)

Tu peux aller plus loin :

- bloquer les requêtes API → site vide
- afficher une page personnalisée
- rediriger vers une page “suspendu”

---

# 🧠 Résumé

👉 Le contrôle ne doit jamais être côté client

Architecture :

```text
Frontend → affiche
Backend → décide
Base de données → source de vérité
```

👉 Désactivation =

```js
active: false;
```

---

# ⚠️ Bonnes pratiques professionnelles

- Mentionner cette logique dans le contrat
- Prévoir un délai avant suspension
- Éviter une coupure brutale sans avertissement

---

# ⚡ Conclusion

Cette architecture permet :

✔️ contrôle total
✔️ désactivation instantanée
✔️ système scalable
✔️ approche professionnelle

👉 C’est la base d’un modèle SaaS pour gérer plusieurs clients efficacement.
