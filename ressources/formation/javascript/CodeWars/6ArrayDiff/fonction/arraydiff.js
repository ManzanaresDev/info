// arraydiff.js

export function arrayDiff(a, b) {
  if (!Array.isArray(a)) {
    throw new Error(`${a} not an array`);
  }

  if (!Array.isArray(b)) {
    throw new Error(`${b} not an array`);
  }

  if (a.length === 0) return b;
  if (b.length === 0) return a;

  const tablauDiffAB = a.filter((x) => !b.includes(x));
  const tablauDiffBA = b.filter((x) => !a.includes(x));

  return [...tablauDiffAB, ...tablauDiffBA];
}
