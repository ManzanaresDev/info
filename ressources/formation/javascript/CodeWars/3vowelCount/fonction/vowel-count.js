// vowel-count.mjs
export function vowelCount(str) {
  const vowelString = "aeiou";
  let vowelCount = 0;
  for (const char of str.toLowerCase()) {
    if (vowelString.includes(char)) {
      vowelCount++;
    }
  }
  return vowelCount;
}

// Versions:
// function getCount(str) {
//   return (str.match(/[aeiou]/gi) || []).length;
// }

// function getCount(str) {
//   return str.split("").filter((c) => "aeiouAEIOU".includes(c)).length;
// }

// function getCount(str) {
//   return str.replace(/[^aeiou]/gi, '').length;
// }
