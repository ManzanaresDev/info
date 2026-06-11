// romanDecoder.test.mjs
import test from "node:test";
import { romanDecoder } from "../fonction/romanDecoder.js";
import assert from "assert";

/*-----  cas invalides -----*/
test("fonction romanDecoder renvoie une erreur pour les entrées invalides", () => {
  const invalidCases = [10, NaN, [], {}, () => {}, true];

  for (const invalidCase of invalidCases) {
    assert.throws(() => romanDecoder(invalidCase), {
      message: "input type error",
    });
  }
});

/*----- nombres romains pas valides -----*/
test("fonction romanDecoder renvoie une erreur pour les nombres romains pas valides", () => {
  const casInvalides = ["O", "9", "IIII", "VV", "XIIII", "MMMM"];

  for (const casInvalide of casInvalides) {
    assert.throws(() => romanDecoder(casInvalide), {
      message: "nombre romain invalide",
    });
  }
});

/*-----  cas valides -----*/
test("fonction romanDecoder renvoie le bon résultat", () => {
  const validCases = [
    { name: "I => 1", input: "I", expected: 1 },
    { name: "II => 2", input: "II", expected: 2 },
    { name: "III => 3", input: "III", expected: 3 },
    { name: "IV => 4", input: "IV", expected: 4 },
    { name: "V => 5", input: "V", expected: 5 },
    { name: "VI => 6", input: "VI", expected: 6 },
    { name: "VII => 7", input: "VII", expected: 7 },
    { name: "VIII => 8", input: "VIII", expected: 8 },
    { name: "IX => 9", input: "IX", expected: 9 },
    { name: "X => 10", input: "X", expected: 10 },
  ];

  for (const { name, input, expected } of validCases) {
    assert.strictEqual(
      romanDecoder(input),
      expected,
      `échec sur le cas: ${name}`
    );
  }
});
