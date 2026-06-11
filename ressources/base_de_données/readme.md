
# 🗃️ Manuel : Conception, Normalisation et Implémentation d'une Base de Données

Ce guide t'explique comment créer une base de données de manière structurée, depuis l'idée jusqu'à l'implémentation technique.

---

## 1️⃣ Analyse des besoins

### Objectif :
Comprendre ce que la base doit contenir et gérer.

### Étapes :
- Identifier les **acteurs** (utilisateurs, admins, etc.)
- Lister les **informations à stocker**
- Repérer les **interactions** entre entités (ex: un utilisateur achète plusieurs produits)

---

## 2️⃣ Conception conceptuelle (Modèle Entité-Association - MCD)

Le **MCD** permet de représenter graphiquement les entités, attributs et relations.

### Exemple de MCD :

```
[Utilisateur] --- (Passe) ---< [Commande] >--- (Contient) ---< [Produit]

Utilisateur:
- id (PK)
- nom
- email

Commande:
- id (PK)
- date_commande
- utilisateur_id (FK)

Produit:
- id (PK)
- nom
- prix
```

---

## 3️⃣ Conception logique (Modèle relationnel)

Transforme le MCD en **modèle relationnel**, sous forme de tables SQL.

### Exemple de Modèle relationnel :

```
Table Utilisateur (
  id INT PRIMARY KEY,
  nom VARCHAR(50),
  email VARCHAR(100)
)

Table Commande (
  id INT PRIMARY KEY,
  date_commande DATE,
  utilisateur_id INT,
  FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
)

Table Produit (
  id INT PRIMARY KEY,
  nom VARCHAR(100),
  prix DECIMAL(10,2)
)

Table Contient (
  commande_id INT,
  produit_id INT,
  quantite INT,
  PRIMARY KEY (commande_id, produit_id),
  FOREIGN KEY (commande_id) REFERENCES Commande(id),
  FOREIGN KEY (produit_id) REFERENCES Produit(id)
)
```

---

## 4️⃣ Normalisation

La normalisation réduit les redondances et les anomalies.

### Principales formes normales :
- **1NF** : éliminer les valeurs multiples dans une colonne
- **2NF** : dépendances fonctionnelles partielles supprimées
- **3NF** : aucune dépendance transitive

### Exemple :
Si une table contient `ville_client` et `code_postal_client`, on extrait une table `Ville` :
```sql
Table Ville (
  code_postal VARCHAR(10) PRIMARY KEY,
  nom_ville VARCHAR(100)
)

Table Client (
  id INT PRIMARY KEY,
  nom VARCHAR(50),
  code_postal VARCHAR(10),
  FOREIGN KEY (code_postal) REFERENCES Ville(code_postal)
)
```

---

## 5️⃣ Implémentation physique

Traduire les tables en SQL dans un SGBD (MySQL, PostgreSQL, etc.)

```sql
CREATE TABLE Utilisateur (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50),
  email VARCHAR(100) UNIQUE
);

CREATE TABLE Produit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100),
  prix DECIMAL(10,2)
);

CREATE TABLE Commande (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date_commande DATE,
  utilisateur_id INT,
  FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
);

CREATE TABLE Contient (
  commande_id INT,
  produit_id INT,
  quantite INT,
  PRIMARY KEY (commande_id, produit_id),
  FOREIGN KEY (commande_id) REFERENCES Commande(id),
  FOREIGN KEY (produit_id) REFERENCES Produit(id)
);
```

---

## 6️⃣ Remplissage (jeux d’essai)

```sql
INSERT INTO Utilisateur (nom, email) VALUES
('Alice', 'alice@mail.com'),
('Bob', 'bob@mail.com');

INSERT INTO Produit (nom, prix) VALUES
('Clavier', 29.99),
('Souris', 15.49);
```

---

## 7️⃣ Requêtes SQL de base

```sql
-- Lire les utilisateurs
SELECT * FROM Utilisateur;

-- Mettre à jour un utilisateur
UPDATE Utilisateur SET nom = 'Alice Dupont' WHERE id = 1;

-- Supprimer un utilisateur
DELETE FROM Utilisateur WHERE id = 2;
```

---

## 8️⃣ Bonnes pratiques

- Toujours utiliser des clés primaires
- Nommer les colonnes et tables de manière claire
- Préférer les `FOREIGN KEY` pour maintenir l'intégrité
- Séparer les données récurrentes (ville, catégorie, etc.)
- Sauvegarder régulièrement la base (`mysqldump`, `pg_dump`, etc.)

---

## 📌 Résumé des étapes

1. Analyse des besoins
2. Conception conceptuelle (MCD)
3. Conception logique (modèle relationnel)
4. Normalisation (jusqu’à la 3NF minimum)
5. Implémentation physique (SQL)
6. Jeux d’essai (INSERT)
7. Requêtes CRUD
8. Optimisations et bonnes pratiques

---

> 💡 Astuce : commence toujours avec un crayon et du papier ou un schéma visuel avant d’écrire une seule ligne de SQL.
