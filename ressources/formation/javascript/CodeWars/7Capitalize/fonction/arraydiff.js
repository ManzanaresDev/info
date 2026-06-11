// capitalize.js

Object.defineProperty(String.prototype, "toJadenCase", {
  value: function () {
    return this.split(" ")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  },
  writable: true,
  configurable: true,
});
