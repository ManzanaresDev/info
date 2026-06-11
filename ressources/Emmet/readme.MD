# 📘 Manuel Emmet – Cheat Sheet HTML & CSS

Emmet est un outil puissant pour écrire rapidement du HTML et du CSS grâce à des abréviations.

---

## ⚙️ Utilisation

Tape une abréviation dans ton éditeur (ex: VS Code) et appuie sur `Tab` pour la développer.

---

## 🧱 Structure HTML

| Abréviation | Résultat                  |
| ----------- | ------------------------- |
| `!`         | Génère le squelette HTML5 |
| `html:5`    | Pareil que `!`            |

---

## 🧩 Éléments HTML

| Abréviation      | Résultat                               |
| ---------------- | -------------------------------------- |
| `div`            | `<div></div>`                          |
| `p`              | `<p></p>`                              |
| `ul>li*3`        | `<ul><li></li><li></li><li></li></ul>` |
| `a`              | `<a href=""></a>`                      |
| `img`            | `<img src="" alt="">`                  |
| `input:password` | `<input type="password">`              |
| `button:submit`  | `<button type="submit"></button>`      |

---

## 🏷️ Attributs

| Abréviation      | Résultat                  |
| ---------------- | ------------------------- |
| `a:link`         | `<a href="http://"></a>`  |
| `a:mail`         | `<a href="mailto:"></a>`  |
| `input:text`     | `<input type="text">`     |
| `input:checkbox` | `<input type="checkbox">` |

---

## 🧬 ID, Classes, Hiérarchies

| Abréviation     | Résultat                                                                         |
| --------------- | -------------------------------------------------------------------------------- |
| `div#main`      | `<div id="main"></div>`                                                          |
| `div.container` | `<div class="container"></div>`                                                  |
| `.box`          | `<div class="box"></div>`                                                        |
| `#header`       | `<div id="header"></div>`                                                        |
| `ul>li.item$*3` | `<ul><li class="item1"></li><li class="item2"></li><li class="item3"></li></ul>` |
| `section>h1+p`  | `<section><h1></h1><p></p></section>`                                            |

---

## 🪄 Texte & Contenu

| Abréviation         | Résultat                    |
| ------------------- | --------------------------- |
| `p{Salut le monde}` | `<p>Salut le monde</p>`     |
| `a{Clique ici}`     | `<a href="">Clique ici</a>` |

---

## 🎨 CSS (abréviations Emmet)

| Abréviation | Résultat                   |
| ----------- | -------------------------- |
| `m10`       | `margin: 10px;`            |
| `p10-20`    | `padding: 10px 20px;`      |
| `w100`      | `width: 100px;`            |
| `h50p`      | `height: 50%;`             |
| `bgc#333`   | `background-color: #333;`  |
| `pos:r`     | `position: relative;`      |
| `d:f`       | `display: flex;`           |
| `jc:c`      | `justify-content: center;` |

---

## 🛠 Astuces avancées

| Abréviation             | Résultat                       |
| ----------------------- | ------------------------------ |
| `ul>li.item$@-*5`       | `item5`, `item4`, `item3`, ... |
| `table>tr*2>td*3`       | Table 2 lignes × 3 colonnes    |
| `form:get`              | `<form method="get"></form>`   |
| `nav>ul>li*3>a{Lien $}` | Liste de 3 liens numérotés     |

---

## 📎 Liens utiles

- [Documentation Emmet](https://docs.emmet.io/)
- [Emmet dans VS Code](https://code.visualstudio.com/docs/editor/emmet)
