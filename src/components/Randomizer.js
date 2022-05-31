// TODO: convert this to typescript

const numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
const terrain = [
  "fields",
  "fields",
  "fields",
  "fields",
  "hills",
  "hills",
  "hills",
  "forest",
  "forest",
  "forest",
  "forest",
  "mountains",
  "mountains",
  "mountains",
  "pasture",
  "pasture",
  "pasture",
  "pasture",
  "desert",
];

function shuffle(setHexes) {
  let currentIndex = terrain.length,
    randomIndex;

  // shuffle terrain first
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [terrain[currentIndex], terrain[randomIndex]] = [
      terrain[randomIndex],
      terrain[currentIndex],
    ];
  }

  // and then numbers
  currentIndex = numbers.length;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [numbers[currentIndex], numbers[randomIndex]] = [
      numbers[randomIndex],
      numbers[currentIndex],
    ];
  }

  const hexes = [];
  // TODO: enforce constraints
  for (let i = 0, j = 0; i < terrain.length; i++, j++) {
    if (terrain[i] === "desert") {
      hexes.push({ type: terrain[i], number: null });
      j--;
    } else {
      hexes.push({ type: terrain[i], number: numbers[j] });
    }
  }

  setHexes(hexes);
}

const neighbors = [
  [1, 3, 4],
  [0, 2, 4, 5],
  [1, 5, 6],
  [0, 4, 7, 8],
  [0, 1, 3, 5, 8, 9],
  [1, 2, 4, 6, 9, 10],
  [2, 5, 10, 11],
  [3, 8, 12],
  [3, 4, 7, 9, 12, 13],
  [4, 5, 8, 10, 13, 14],
  [5, 6, 9, 11, 14, 15],
  [6, 10, 15],
  [7, 8, 13, 16],
  [8, 9, 12, 14, 16, 17],
  [9, 10, 13, 15, 17, 18],
  [10, 11, 14, 18],
  [12, 13, 17],
  [13, 14, 16, 18],
  [14, 15, 17],
];

/**
 * This is a button component for producing a random board within certain
 * contraints. Initial contraints will just be no adjacent 6's and 8's, but
 * options will be added later
 */
export default function Randomizer({ setHexes }) {
  // TODO: add an interface to toggle the enforcement of constraints
  // TODO: add a board history

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        style={{ margin: 5, padding: 10 }}
        onClick={() => shuffle(setHexes)}
      >
        Randomize!
      </button>
    </div>
  );
}
