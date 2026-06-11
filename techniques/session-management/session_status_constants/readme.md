# Analyse sur `SessionStatus`

## À quoi sert cette fonction

```ts
function setSessionStatus(status: SessionStatus) {
  // ...
}
```

Cette fonction sert à **encadrer la modification ou la définition du statut de session** dans ton application.

Au lieu de manipuler des chaînes de caractères un peu partout dans le code comme :

```ts
status = "registered";
status = "guest";
```

on passe par une fonction qui annonce clairement l’intention métier :

```ts
setSessionStatus(SESSION_STATUS.REGISTERED);
```

Ici, `setSessionStatus` veut dire explicitement :
**"je définis le statut de session"**.

Le paramètre `status: SessionStatus` indique que la fonction **n’accepte que les valeurs prévues par le type**.

Par exemple, avec :

```ts
export const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
```

alors `SessionStatus` vaut en pratique :

```ts
"registered" | "guest"
```

Donc :

```ts
setSessionStatus("registered"); // ok
setSessionStatus("guest"); // ok
setSessionStatus("admin"); // erreur TypeScript
```

L’intérêt principal est donc double :

1. **sécuriser** les valeurs autorisées
2. **centraliser** l’action métier dans une fonction dédiée

---

## Pourquoi c’est utile

### 1. Éviter les valeurs invalides

Sans type strict, n’importe quelle chaîne pourrait être envoyée par erreur :

```ts
setSessionStatus("registredd");
```

Avec `SessionStatus`, TypeScript bloque ce genre d’erreur avant même l’exécution.

### 2. Rendre le code plus lisible

Une ligne comme :

```ts
setSessionStatus(SESSION_STATUS.GUEST);
```

est plus claire que :

```ts
status = "guest";
```

La première exprime une **action métier identifiable**.
La seconde ressemble juste à une affectation brute.

### 3. Centraliser la logique future

Aujourd’hui, la fonction semble simple, mais demain tu peux vouloir ajouter :

- une mise à jour du state React
- une persistance dans le `localStorage`
- un appel API
- un log
- une vérification métier

Exemple :

```ts
function setSessionStatus(status: SessionStatus) {
  localStorage.setItem("sessionStatus", status);
  session.status = status;
}
```

Le fait d’avoir une fonction dédiée évite de disperser cette logique dans tout le projet.

### 4. Créer une API interne propre

Cette fonction devient une petite interface interne claire :

```ts
setSessionStatus(SESSION_STATUS.REGISTERED);
```

Tu poses ainsi une règle d’usage :
le statut de session ne se modifie pas n’importe comment.

---

## Comment on l’utilise

### Cas simple

```ts
export const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

function setSessionStatus(status: SessionStatus) {
  console.log("Nouveau statut :", status);
}

setSessionStatus(SESSION_STATUS.REGISTERED);
setSessionStatus(SESSION_STATUS.GUEST);
```

### Avec une variable typée

```ts
let currentStatus: SessionStatus = SESSION_STATUS.GUEST;

setSessionStatus(currentStatus);
```

### Dans React

```ts
const [sessionStatus, setSessionStatus] = useState<SessionStatus>(
  SESSION_STATUS.GUEST
);
```

Ici, le setter React protège aussi le type :

```ts
setSessionStatus(SESSION_STATUS.REGISTERED); // ok
setSessionStatus("admin"); // erreur
```

---

## Mon avis justifié sur ton approche

Tu compares en gros deux approches.

## 1. Constantes séparées

```ts
const REGISTERED = "registered";
const GUEST = "guest";
```

Cette solution fonctionne, mais elle a plusieurs limites.

### Limites

- les constantes sont dispersées
- elles occupent le scope individuellement
- elles expriment moins bien l’idée d’un groupe cohérent de valeurs
- dans un projet plus gros, elles deviennent moins faciles à retrouver et à maintenir
- elles incitent moins à structurer le domaine métier

Le vrai problème n’est pas seulement la duplication perçue, mais surtout le **manque de regroupement sémantique**.

---

## 2. Objet centralisé

```ts
const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
} as const;
```

Cette approche est meilleure dans la majorité des cas.

### Avantages

#### Une source de vérité centralisée

Toutes les valeurs du domaine `session status` sont au même endroit.

#### Une meilleure lisibilité métier

```ts
SESSION_STATUS.REGISTERED
```

est plus explicite que :

```ts
REGISTERED
```

On comprend immédiatement que cette valeur appartient à l’ensemble des statuts de session.

#### Une meilleure maintenabilité

Si demain tu ajoutes un nouveau statut, tu sais exactement où intervenir.

#### Une meilleure extensibilité

```ts
const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
  EXPIRED: "expired",
} as const;
```

Le modèle reste clair même quand il grandit.

#### Un typage automatique très propre

Tu peux dériver le type directement depuis l’objet :

```ts
export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
```

Cela évite de redéclarer manuellement :

```ts
type SessionStatus = "registered" | "guest";
```

Donc ton type reste toujours aligné avec les valeurs réelles.

---

## Pourquoi cette approche est particulièrement bonne en TypeScript

Le duo suivant est très solide :

```ts
export const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
```

### Ce que fait `as const`

`as const` demande à TypeScript de considérer les valeurs comme des **littéraux immuables précis**.

Sans `as const`, TypeScript voit souvent :

```ts
{
  REGISTERED: string,
  GUEST: string
}
```

Avec `as const`, il comprend :

```ts
{
  readonly REGISTERED: "registered",
  readonly GUEST: "guest"
}
```

C’est ce qui permet ensuite de dériver un vrai type littéral union.

---

## Pourquoi je recommande ce nommage

Je te conseille :

```ts
SESSION_STATUS
```

et non :

```ts
SESSION_STATUS_TYPE
```

### Pourquoi

Parce que l’objet contient des **valeurs métier**, pas un type.

Le type, ce serait plutôt :

```ts
type SessionStatus = ...
```

Donc une bonne séparation serait :

```ts
export const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
```

C’est plus juste sémantiquement.

---

## Recommandation finale

La forme que je te recommande est celle-ci :

```ts
export const SESSION_STATUS = {
  REGISTERED: "registered",
  GUEST: "guest",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

function setSessionStatus(status: SessionStatus) {
  // logique métier ici
}
```

Et son usage :

```ts
setSessionStatus(SESSION_STATUS.REGISTERED);
setSessionStatus(SESSION_STATUS.GUEST);
```

---

## Conclusion

Oui, ton approche avec un objet centralisé est meilleure que deux constantes séparées.

Les raisons les plus solides sont :

- centralisation des valeurs
- meilleure lisibilité métier
- cohérence d’usage dans le projet
- évolution plus simple
- typage dérivé automatiquement
- réduction du risque d’incohérence

Ta bonne intuition n’est pas seulement :
**"je veux éviter de répéter des chaînes"**

mais surtout :
**"je veux modéliser proprement un ensemble fermé de valeurs métier"**

Et ça, en TypeScript, l’objet `as const` + type dérivé est souvent l’une des solutions les plus propres.

