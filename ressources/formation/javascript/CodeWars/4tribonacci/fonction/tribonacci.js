// tribonacci.mjs
export function tribonacci(tableau, n) {
  if (!Array.isArray(tableau) || tableau.length < 3 || n <= 0) {
    throw new Error("Entrées invalides");
  }
  const newTable = [...tableau];
  for (let valuesNumber = 0; valuesNumber < n; valuesNumber++) {
    const threeLast = newTable.slice(-3);
    const nextValue = threeLast.reduce((a, b) => a + b, 0);
    newTable.push(nextValue);
  }
  return newTable;
}
