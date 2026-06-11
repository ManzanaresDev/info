// maskify.test.mjs
import test from "node:test";
import { maskify } from "../fonction/maskify.js";
import assert from "assert";

test("maskify masque correctement...", () => {
  // retour un string
  assert.ok(typeof maskify("string") === "string");
  // paramètre: un string vide
  assert.strictEqual(maskify(""), "");
  // paramètre: un string avec un seule caractère
  assert.strictEqual(maskify("a"), "a");
  // paramètre: un string avec deux caractères
  assert.strictEqual(maskify("aa"), "aa");
  // paramètre: un string avec trois caractères
  assert.strictEqual(maskify("aaa"), "aaa");
  // paramètre: un string avec quatre caractères
  assert.strictEqual(maskify("aaaa"), "aaaa");
  // paramètre: un string avec cinque caractères
  assert.strictEqual(maskify("aaaaa"), "#aaaa");
  // paramètre: un string avec plus que cinque caractères
  assert.strictEqual(maskify("aaaaaa"), "##aaaa");
});
