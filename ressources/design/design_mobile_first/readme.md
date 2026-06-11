/_ RESET DE BASE _/

- {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  }

body {
font-family: system-ui, sans-serif;
background-color: #111;
color: #eee;
line-height: 1.6;
padding: 1rem;
}

/_ CONTENEUR CENTRAL _/
.container {
max-width: 1200px;
margin: 0 auto;
}

/_ HEADER ET FOOTER _/
header, footer {
text-align: center;
padding: 1rem 0;
}

/_ LAYOUT MOBILE : colonnes empilées _/
.row {
display: flex;
flex-direction: column;
gap: 1rem;
}

.col {
padding: 1rem;
background-color: #222;
border-radius: 8px;
text-align: center;
}

/_ VERSION TABLETTE ET PLUS (>= 768px) _/
@media (min-width: 768px) {
.row {
flex-direction: row;
flex-wrap: wrap;
}

.col {
flex: 1 1 100%;
}
}

/_ VERSION DESKTOP ET PLUS (>= 1024px) _/
@media (min-width: 1024px) {
.col {
flex: 1 1 calc(33.333% - 1rem);
}
}
