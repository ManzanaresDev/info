// romanDecoder.js
export function romanDecoder(num) {
  // Vérifi que l'entrée est une chaîne de texte
  if (typeof num !== "string") {
    throw new Error("input type error");
  }

  // Vérifie aue l'entrée est bien un nombre romain valide(jusqu'à 3999)
  const romanRegex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  if (!romanRegex.test(num)) {
    throw new Error("nombre romain invalide");
  }

  const romanMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  let prev = 0;
  for (let index = num.length - 1; index >= 0; index--) {
    const curr = romanMap[num.charAt(index)];
    curr < prev ? (total -= curr) : (total += curr);
    prev = curr;
  }

  return total;
}
