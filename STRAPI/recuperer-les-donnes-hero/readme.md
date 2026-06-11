# Manuel de syntaxe Markdown

> Référence complète et prête à l'emploi — copiez, adaptez, utilisez.

---

## Table des matières

1. [Titres](#titres)
2. [Mise en forme du texte](#mise-en-forme)
3. [Listes](#listes)
4. [Liens et images](#liens-et-images)
5. [Code](#code)
6. [Citations](#citations)
7. [Tableaux](#tableaux)
8. [Séparateurs](#séparateurs)
9. [Tâches](#tâches)
10. [Notes de bas de page](#notes-de-bas-de-page)
11. [HTML inline](#html-inline)
12. [Échappement](#échappement)

---

## Titres

```
# Titre 1
## Titre 2
### Titre 3
#### Titre 4
##### Titre 5
###### Titre 6
```

> ⚠️ Toujours laisser un espace entre le `#` et le texte.

---

## Mise en forme du texte

```
**Gras**
__Gras aussi__

*Italique*
_Italique aussi_

***Gras et italique***

~~Barré~~

`Code inline`

<u>Souligné</u> (HTML inline)

Texte normal^exposant^

Texte normal~indice~
```

**Rendu :**

- **Gras**
- *Italique*
- ***Gras et italique***
- ~~Barré~~
- `Code inline`

---

## Listes

### Liste non ordonnée

```
- Élément A
- Élément B
  - Sous-élément B1
  - Sous-élément B2
- Élément C
```

> Fonctionne aussi avec `*` ou `+` à la place de `-`.

### Liste ordonnée

```
1. Premier
2. Deuxième
3. Troisième
   1. Sous-élément
   2. Sous-élément
```

> Les numéros n'ont pas besoin d'être dans l'ordre — Markdown les recalcule automatiquement.

---

## Liens et images

### Lien simple

```
[Texte du lien](https://exemple.com)
```

### Lien avec infobulle

```
[Texte du lien](https://exemple.com "Titre au survol")
```

### Lien de référence

```
[Texte du lien][ref]

[ref]: https://exemple.com "Titre optionnel"
```

### URL brute

```
<https://exemple.com>
<email@exemple.com>
```

### Image

```
![Texte alternatif](https://exemple.com/image.png)
![Texte alternatif](./image-locale.png "Titre optionnel")
```

### Image cliquable

```
[![Alt](https://exemple.com/image.png)](https://exemple.com)
```

---

## Code

### Inline

```
Utilisez la fonction `console.log()` pour déboguer.
```

### Bloc sans coloration

````
```
Votre code ici
```
````

### Bloc avec coloration syntaxique

````
```javascript
function saluer(nom) {
  return `Bonjour, ${nom} !`;
}
```

```python
def saluer(nom):
    return f"Bonjour, {nom} !"
```

```bash
npm install && npm run dev
```

```css
body {
  font-family: sans-serif;
  color: #333;
}
```

```json
{
  "nom": "Claude",
  "version": 3
}
```
````

**Langages courants :** `html`, `css`, `js` / `javascript`, `ts` / `typescript`, `python`, `bash`, `shell`, `sql`, `json`, `yaml`, `php`, `java`, `c`, `cpp`, `go`, `rust`, `markdown`

---

## Citations

### Simple

```
> Ceci est une citation.
```

### Multiligne

```
> Première ligne de la citation.
> Deuxième ligne de la citation.
```

### Imbriquée

```
> Citation principale.
>
> > Citation imbriquée.
>
> Retour à la citation principale.
```

### Avec mise en forme

```
> **Note :** Cette information est importante.
> Consultez la [documentation](https://exemple.com) pour en savoir plus.
```

---

## Tableaux

```
| Colonne 1     | Colonne 2     | Colonne 3     |
|---------------|:-------------:|--------------:|
| Aligné gauche | Centré        | Aligné droite |
| Valeur        | Valeur        | Valeur        |
| Valeur        | Valeur        | Valeur        |
```

**Rendu :**

| Colonne 1     | Colonne 2     | Colonne 3     |
|---------------|:-------------:|--------------:|
| Aligné gauche | Centré        | Aligné droite |
| Valeur        | Valeur        | Valeur        |

> 💡 Les cellules n'ont pas besoin d'être parfaitement alignées dans la source.

---

## Séparateurs

```
---
***
___
```

Les trois produisent une ligne horizontale `<hr>`.

---

## Tâches

```
- [x] Tâche complétée
- [ ] Tâche à faire
- [ ] Tâche à faire aussi
```

**Rendu :**

- [x] Tâche complétée
- [ ] Tâche à faire
- [ ] Tâche à faire aussi

---

## Notes de bas de page

```
Voici une affirmation importante.[^1]

Une autre affirmation.[^note]

[^1]: Source de la première affirmation.
[^note]: Explication détaillée de la deuxième affirmation.
```

> ⚠️ Support variable selon les renderers (GitHub ✅, certains éditeurs ❌).

---

## HTML inline

Markdown accepte du HTML brut quand la syntaxe native ne suffit pas :

```html
<details>
  <summary>Cliquez pour développer</summary>

  Contenu masqué par défaut.
  Vous pouvez y mettre du **Markdown** aussi.

</details>

<br> <!-- Saut de ligne forcé -->

<kbd>Ctrl</kbd> + <kbd>C</kbd> <!-- Touches clavier -->

<mark>Texte surligné</mark>

<sub>Indice</sub> et <sup>Exposant</sup>
```

**Rendu :**

<details>
<summary>Cliquez pour développer</summary>

Contenu masqué par défaut.

</details>

Touches : <kbd>Ctrl</kbd> + <kbd>C</kbd>

---

## Échappement

Précédez le caractère spécial d'un antislash `\` pour l'afficher littéralement :

```
\*pas en italique\*
\# pas un titre
\[pas un lien\]
\`pas du code\`
\> pas une citation
```

**Caractères à échapper :** `\ * _ { } [ ] ( ) # + - . ! |`

---

## Récapitulatif rapide

| Syntaxe                  | Résultat              |
|--------------------------|-----------------------|
| `# Titre`                | Titre H1              |
| `**texte**`              | **Gras**              |
| `*texte*`                | *Italique*            |
| `~~texte~~`              | ~~Barré~~             |
| `` `code` ``             | `Code inline`         |
| `[label](url)`           | Lien                  |
| `![alt](url)`            | Image                 |
| `> texte`                | Citation              |
| `- item`                 | Liste à puces         |
| `1. item`                | Liste numérotée       |
| `- [x] tâche`            | Case cochée           |
| `---`                    | Séparateur            |
| `\| col \| col \|`       | Tableau               |

---

*Manuel généré avec ❤️ — compatible GitHub, Obsidian, VS Code, Notion (partiel) et la plupart des renderers Markdown.*
