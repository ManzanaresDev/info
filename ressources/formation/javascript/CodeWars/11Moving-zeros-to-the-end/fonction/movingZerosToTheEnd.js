// movingZerosToTheEnd.js
export function movingZerosToTheEnd(num) {
  // tout d'abord l'on crée une copie du paramètre...
  let returnArray = Array.isArray(num) && [...num];

  if (!returnArray) {
    throw new Error("type error");
  }

  // le paramètre est une Array

  // Compter la quantité se zeros dans l'erray
  const nombreOfZeros = num.filter((elem) => elem === 0).length;
  // Il n'y a pas de zeros dans l'array, rien à faire en l'on return le paramètre fourni
  if (nombreOfZeros == 0) {
    return returnArray;
  }

  // Il y a des zeros dans le array donc on les switch vers la droite:

  // Eliminer les zeros de l'array (au fait d'une copie du paramètre)
  let arrayWithoutZeros = [...num].filter((elem) => elem !== 0);
  // Créer une array avec la quantité de zeros trouvé das l'array paramètre
  const arrayZeros = Array.from({ length: nombreOfZeros }, () => 0);
  // former une nouvelle array avec l'array arrayWithoutZeros et arrayZeros
  returnArray = [...arrayWithoutZeros, ...arrayZeros];

  return returnArray;
}
