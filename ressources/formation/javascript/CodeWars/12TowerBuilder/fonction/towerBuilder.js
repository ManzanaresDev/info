// towerBuilder.js

function createTower(n) {
  let tower = [];
  for (let index = 1; index <= n; index++) {
    const espaces = " ".repeat(n - index);
    const stars = "*".repeat(2 * index - 1);
    const floor = espaces + stars + espaces;
    tower.push(floor);
  }

  return tower;
}

export function towerBuilder(nFloors) {
  if (typeof nFloors !== "number") {
    throw new Error("input type error");
  }

  if (nFloors < 0) {
    throw new Error("floor number must be a positive number");
  }

  return nFloors === 0 ? [] : createTower(nFloors);
}
