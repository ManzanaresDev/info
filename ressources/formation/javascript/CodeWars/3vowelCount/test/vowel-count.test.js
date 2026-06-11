// pangramme.test.mjs
import test from "node:test";
import assert from "assert";
import { vowelCount } from "../fonction/vowel-count.js";

test("vowel-count counts all vowels in a phrase", () => {
  assert.strictEqual(vowelCount(""), 0, "Must retourn 0");
  assert.strictEqual(vowelCount("z"), 0, "Must retourn 0");
  assert.strictEqual(vowelCount("Z"), 0, "Must retourn 0");
  assert.strictEqual(vowelCount("a"), 1, "Must retourn 1");
  assert.strictEqual(vowelCount("A"), 1, "Must retourn 1");
  assert.strictEqual(vowelCount("zsdfgsdfgsdg"), 0, "Must retourn 0");
  assert.strictEqual(vowelCount("ZSDFGSDGGSDG"), 0, "Must retourn 0");
  assert.strictEqual(vowelCount("aeiou"), 5, "Must retourn 5");
  assert.strictEqual(vowelCount("AEIOU"), 5, "Must retourn 5");
  assert.strictEqual(vowelCount("AEIOU"), 5, "Must retourn 5");
  assert.strictEqual(
    vowelCount("ÀÉÎÔÙ"),
    0,
    "Must retourn 0, it doesn't count accent vowels right now"
  );
});
