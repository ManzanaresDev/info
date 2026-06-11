// pangramme.test.mjs
import test from "node:test";
import { pangram } from "../fonction/pangram.js";
import assert from "assert";

test("pangram détecte bien un texte avec toutes les lettres de l'alphabet français...", () => {
  const pangrammesFr = [
    "Portez ce vieux whisky au juge blond qui fume.",
    "Voix ambiguë d’un cœur qui au zéphyr préfère les jattes de kiwi.",
    "Le vif zéphyr jubile sur les kumquats du clown gracieux.",
    "Monsieur Jack, vous dactylographiez bien mieux que votre ami Wolf.",
    "Ce zéphyr jubile sur les kumquats du clown farceur.",
    "Quel beau zeppelin que ce vaisseau du joyeux explorateur !",
    "Amazone vêtu de lin, fixez ce robot qui marche sur le gazon.",
    "Fuyant l’alcool, ce vieux schnock buvait du jus de kiwi.",
    "L’exquis jazz bondit sur le vieux kimono du fakir.",
    "Blagueur, Max fixa le wagon du clown ivre et joyeux.",
  ];

  pangrammesFr.forEach((phrase, index) =>
    assert.strictEqual(
      pangram(phrase),
      true,
      `Échec  pour le pangramme #${index + 1} : ${phrase}`
    )
  );
});
