// domain.test.mjs
import test from "node:test";
import { multiplesOf3Or5 } from "../fonction/multiplesOf3Or5.js";
import assert from "assert";

/*-----  cas invalides -----*/
test("fonction multiplesOf3Or5 renvoie une erreur pour les entrées invalides", () => {
  const invalidCases = ["string", NaN, [], {}, () => {}, true];

  for (const invalidCase of invalidCases) {
    assert.throws(() => multiplesOf3Or5(invalidCase), {
      message: "parameter type error",
    });
  }
});

/*-----  négatifs et cas limites -----*/
test("La fonction multiplesOf3Or5 return 0 pour les entrées limites (negatif, 0, 1 et 2)", () => {
  const edgeCases = [-5, 0, 1, 2];

  for (const edgeCase of edgeCases) {
    assert.strictEqual(
      multiplesOf3Or5(edgeCase),
      0,
      `fails for value: ${edgeCase}`
    );
  }
});

/*-----  cas valides -----*/
test("fonction multiplesOf3Or5 renvoie le bon résultat", () => {
  const validCases = [
    { name: "0 => 0", input: 0, expected: 0 },
    { name: "1 => 0", input: 1, expected: 0 },
    { name: "2 => 0", input: 2, expected: 0 },
    { name: "4 => 3", input: 4, expected: 3 },
    { name: "6 => 8", input: 6, expected: 8 },
    { name: "10 => 23", input: 10, expected: 23 },
    { name: "16 => 60", input: 16, expected: 60 },
    { name: "20 => 78", input: 20, expected: 78 },
  ];

  for (const { name, input, expected } of validCases) {
    assert.strictEqual(
      multiplesOf3Or5(input),
      expected,
      `échec sur le cas: ${name}`
    );
  }
});
