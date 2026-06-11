// scramblies.test.mjs
import test from "node:test";
import { scramblies } from "../fonction/scramblies.js";
import assert from "assert";

/*-----  cas invalides -----*/
test("fonction scramblies renvoie une erreur pour les entrées invalides", () => {
  const invalidCases = [10, NaN, [], {}, () => {}, true];

  for (const invalidCase of invalidCases) {
    assert.throws(() => romanDecoder(invalidCase), {
      message: "input type error",
    });
  }
});

/*-----  cas valides -----*/
test("fonction scramblies renvoie le bon résultat", () => {
  const validCases = [
    { name: "a => a", input1: "a", input2; "a", expected: true },
    { name: "ab => abc", input1: "a", input2; "a", expected: true },
  ];

  for (const { name, input, expected } of validCases) {
    assert.strictEqual(
      romanDecoder(input),
      expected,
      `échec sur le cas: ${name}`
    );
  }
});
