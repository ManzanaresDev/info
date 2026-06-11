// arraydiff.test.mjs
import test from "node:test";
import { arrayDiff } from "../fonction/arraydiff.js";
import assert from "assert";

const goodInputs = [
  {
    input1: [],
    input2: [],
    output: [],
  },
  {
    input1: [1, 2],
    input2: [1],
    output: [2],
  },
  {
    input1: [1, 2, 3],
    input2: [2, 3],
    output: [1],
  },
  {
    input1: [1, 2, 3],
    input2: [4, 5],
    output: [1, 2, 3],
  },
  {
    input1: [1, 2, 3],
    input2: [],
    output: [1, 2, 3],
  },
];

test("Entrées valides", () => {
  for (let { input1, input2, output } of goodInputs) {
    assert.StrictDeepEqual(arrayDiff(input1, input2), output, {
      message: `la fonction a échouée [ input1: ${input1} - input2: ${input2} - output: ${output}]`,
    });
  }
});
