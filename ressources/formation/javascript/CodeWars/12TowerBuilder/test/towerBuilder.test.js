// towerBuilder.test.mjs
import test from "node:test";
import { towerBuilder } from "../fonction/towerBuilder.js";
import assert from "assert";

/*-----  cas invalides -----*/
test("fonction towerBuilder renvoie une erreur pour les entrées invalides", () => {
  const invalidCases = ["Hi", NaN, [], {}, () => {}, true];

  for (const invalidCase of invalidCases) {
    assert.throws(() => towerBuilder(invalidCase), {
      message: "input type error",
    });
  }
});

test("towerBuilder renvoi une erreur pour une entrée négative", () => {
  assert.throws(() => towerBuilder(-5), {
    message: "floor number must be a positive number",
  });
});

/*-----  cas valides -----*/
test("fonction towerBuilder renvoie le bon résultat", () => {
  const validCases = [
    { name: "1 floor", input: 1, expected: ["*"] },
    { name: "2 floors", input: 2, expected: [" * ", "***"] },
    { name: "3 floors", input: 3, expected: ["  *  ", " *** ", "*****"] },
  ];

  for (const { name, input, expected } of validCases) {
    assert.deepStrictEqual(
      towerBuilder(input),
      expected,
      `échec sur le cas: ${name}`
    );
  }
});
