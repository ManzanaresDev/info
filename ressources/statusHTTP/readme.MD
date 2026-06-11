# Manuel des codes de statut HTTP

---

## 1xx — Informations (transitoires)

| Code | Nom                 | Description courte                              |
| ---- | ------------------- | ----------------------------------------------- |
| 100  | Continue            | Le client peut continuer sa requête             |
| 101  | Switching Protocols | Le serveur change de protocole selon la demande |
| 102  | Processing (WebDAV) | Traitement en cours (WebDAV)                    |

---

## 2xx — Succès

| Code | Nom        | Description courte                      |
| ---- | ---------- | --------------------------------------- |
| 200  | OK         | La requête a réussi                     |
| 201  | Created    | Ressource créée avec succès             |
| 202  | Accepted   | Requête acceptée, traitement asynchrone |
| 204  | No Content | Pas de contenu à renvoyer               |

---

## 3xx — Redirections

| Code | Nom                | Description courte                     |
| ---- | ------------------ | -------------------------------------- |
| 301  | Moved Permanently  | Ressource déplacée définitivement      |
| 302  | Found              | Ressource temporairement déplacée      |
| 303  | See Other          | Voir une autre URL (après POST)        |
| 304  | Not Modified       | Ressource non modifiée, utiliser cache |
| 307  | Temporary Redirect | Redirection temporaire (même méthode)  |
| 308  | Permanent Redirect | Redirection permanente (même méthode)  |

---

## 4xx — Erreurs client

| Code | Nom                  | Description courte                  |
| ---- | -------------------- | ----------------------------------- |
| 400  | Bad Request          | Requête mal formée                  |
| 401  | Unauthorized         | Authentification requise            |
| 403  | Forbidden            | Accès refusé                        |
| 404  | Not Found            | Ressource non trouvée               |
| 405  | Method Not Allowed   | Méthode HTTP non autorisée          |
| 409  | Conflict             | Conflit avec l’état actuel          |
| 422  | Unprocessable Entity | Données non traitables (validation) |
| 429  | Too Many Requests    | Trop de requêtes en peu de temps    |

---

## 5xx — Erreurs serveur

| Code | Nom                   | Description courte                       |
| ---- | --------------------- | ---------------------------------------- |
| 500  | Internal Server Error | Erreur serveur interne                   |
| 501  | Not Implemented       | Fonctionnalité non prise en charge       |
| 502  | Bad Gateway           | Mauvaise passerelle                      |
| 503  | Service Unavailable   | Service indisponible temporairement      |
| 504  | Gateway Timeout       | Temps d’attente de la passerelle dépassé |

---
