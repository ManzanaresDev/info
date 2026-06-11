// domain.test.mjs
import test from "node:test";
import { domain } from "../fonction/domain.js";
import assert from "assert";

const badInputs = [
  {
    input: 6,
    message: "bad input type",
  },
  {
    input: {},
    message: "bad input type",
  },
  {
    input: [],
    message: "bad input type",
  },
];

const goodInputs = [
  {
    input: "http://google.com",
    output: "google",
  },
  {
    input: "https://google.com",
    output: "google",
  },
  {
    input: "http://www.google.com",
    output: "google",
  },
  {
    input: "www.google.com",
    output: "google",
  },
  {
    input: "google.com",
    output: "google",
  },
  {
    input: "https://www.google.com",
    output: "google",
  },
];

test("Entrées invalides", () => {
  for (let { input, message } of badInputs) {
    assert.throws(
      () => domain(input),
      (err) => {
        assert.strictEqual(err instanceof Error, true);
        assert.strictEqual(err.message, message);
        return true;
      }
    );
  }
});

test("Entrées valides", () => {
  for (let { input, output } of goodInputs) {
    assert.strictEqual(domain(input), output);
  }
});
