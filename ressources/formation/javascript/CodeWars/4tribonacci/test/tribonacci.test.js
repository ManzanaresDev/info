// maskify.test.mjs
import test from "node:test";
import { tribonacci } from "../fonction/tribonacci.js";
import assert from "assert";

const badInputs = [
  { input: [], n: -10 },
  { input: [1], n: 0 },
  { input: [1, 2], n: 2 },
  { input: [1, 2, 3], n: 0 },
  { input: [1, 2, 3], n: -3 },
];

test("Test entrées invalides", () => {
  for (const { input, n } of badInputs) {
    assert.throws(() => tribonacci(input, n), {
      message: "Entrées invalides",
    });
  }
});

test("Entrées valides", () => {
  const originalTable = [1, 2, 3]; // starting table
  const testCount = 10; // number of tests

  for (let test = 1; test <= testCount; test++) {
    const result = tribonacci(originalTable, test);
    for (let tableIndex = 3; tableIndex < result.length; tableIndex++) {
      assert.strictEqual(
        result[tableIndex],
        result[tableIndex - 1] + result[tableIndex - 2] + result[tableIndex - 3]
      );
    }
  }
});
