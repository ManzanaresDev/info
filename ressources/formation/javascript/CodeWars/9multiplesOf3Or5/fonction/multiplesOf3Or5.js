// multiplesOf3Or5.js
export function multiplesOf3Or5(num) {
  if (typeof num !== "number" || !Number.isInteger(num)) {
    throw new Error("parameter type error");
  }

  if (num <= 2) return 0;

  const sumDivisibleBy = (k) => {
    const p = Math.floor((num - 1) / k);
    return (k * (p * (p + 1))) / 2;
  };

  return sumDivisibleBy(3) + sumDivisibleBy(5) - sumDivisibleBy(15);
}
