// maskify.mjs
export function pangram(str) {
  // Phases:
  // 1. Créer un tableau vide pour stocker les caractères analysés
  // Parcurir la chaine de texte
  // Extraire un charactèr
  // Vérifier que c'est un caractère (pas un symbole ni un digite) si le caractèr (en minuscule) se trouve dans le tableau
  // -- Si false: insérer le caractèer dans le tableau
  // -- Si true ne rien faire
  // Returner la comparation (longeur du tableau = lettres del alphabet)
  const FrenchAlphabetLentgh = 26;
  const charsFound = new Set();
  const strToLower = str.toLowerCase();
  const lowerCharRegex = /^[a-z]$/;
  for (char of strToLower) {
    if (lowerCharRegex.test(char) && !charStr.includes(char))
      charsFound.add(char);
  }
  return charStr.length === FrenchAlphabetLentgh;
}
