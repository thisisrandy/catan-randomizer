import "../css/randomizer.css";
import React, { useState } from "react";
import { HexRecord, HexType } from "../types/hexes";
import { BinaryConstraints } from "../types/constraints";
import BinaryConstraintControl from "./BinaryConstraintControl";

// note that 0 represents the desert
const numbers = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
const terrain: HexType[] = [
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

function shuffle(setHexes: HexSetter, binaryConstraints: BinaryConstraints) {
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
  let hexes: HexRecord;
  numbersTopLoop: while (true) {
    hexes = [];
    let sawDesert = false;
    // we need to begin by finding the 0 value and putting it at the beginning
    // of the loop
    const zeroIndex = numbers.indexOf(0);
    if (zeroIndex > 0) {
      [numbers[0], numbers[zeroIndex]] = [numbers[zeroIndex], numbers[0]];
    }

    shuffleLoop: for (
      let i = 0, j = numbers.length - 1;
      i < terrain.length;
      i++, j--
    ) {
      if (terrain[i] === "desert") {
        hexes.push({ type: terrain[i], number: null });
        [numbers[0], numbers[j]] = [numbers[j], numbers[0]];
        sawDesert = true;
        continue;
      }

      // check constraints. we may have gotten ourself into a state from which
      // we can't meet the constraints without backtracking. so after a few
      // tries, we bail and start over. there are obviously more disciplined
      // ways to do this, but a succeed or bail loop works
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle. if we haven't seen the desert yet, we need to make sure we
        // don't select index 0
        const offset = Number(!sawDesert);
        randomIndex = Math.floor(Math.random() * (j - offset)) + offset;
        [numbers[j], numbers[randomIndex]] = [numbers[randomIndex], numbers[j]];

        // then check each constraint

        // no 6/8 neighbors
        if (
          binaryConstraints.noAdjacentSixEight &&
          [6, 8].includes(numbers[j])
        ) {
          for (const neighbor of neighbors[j]) {
            // consider only neighbors greater than this hex, as those lower
            // will still be shuffled
            if (neighbor < j) continue;
            if ([6, 8].includes(numbers[neighbor])) {
              continue tryLoop;
            }
          }
        }

        // no 2/12 neighbors
        if (
          binaryConstraints.noAdjacentTwoTwelve &&
          [2, 12].includes(numbers[j])
        ) {
          for (const neighbor of neighbors[j]) {
            if (neighbor < j) continue;
            if ([2, 12].includes(numbers[neighbor])) {
              continue tryLoop;
            }
          }
        }

        // no same number neighbors
        if (binaryConstraints.noAdjacentPairs) {
          for (const neighbor of neighbors[j]) {
            if (neighbor < j) continue;
            if (numbers[j] === numbers[neighbor]) {
              continue tryLoop;
            }
          }
        }

        // no constraints were violated. make an entry in hexes continue
        // shuffling
        hexes.push({ type: terrain[i], number: numbers[j] });
        continue shuffleLoop;
      }

      // we failed to find a valid board after exhausting all tries. time to
      // start over from the beginning
      continue numbersTopLoop;
    }

    // we managed to create a valid board. time to break out of the loop!
    break;
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

type HexSetter = React.Dispatch<React.SetStateAction<HexRecord>>;

interface Props {
  setHexes: HexSetter;
}

/**
 * This is a button component for producing a random board within certain
 * contraints. Initial contraints will just be no adjacent 6's and 8's, but
 * options will be added later
 */
export default function Randomizer({ setHexes }: Props) {
  // TODO: add a board history

  const [constraints, setConstraints] = useState<BinaryConstraints>({
    noAdjacentSixEight: true,
    noAdjacentTwoTwelve: true,
    noAdjacentPairs: true,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        id="constraints"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          margin: 5,
        }}
      >
        <BinaryConstraintControl
          constraint={"noAdjacentSixEight"}
          text={"Allow adjacent 6 & 8"}
          constraints={constraints}
          setConstraints={setConstraints}
        />
        <BinaryConstraintControl
          constraint={"noAdjacentTwoTwelve"}
          text={"Allow adjacent 2 & 12"}
          constraints={constraints}
          setConstraints={setConstraints}
        />
        <BinaryConstraintControl
          constraint={"noAdjacentPairs"}
          text={"Allow adjacent number pairs"}
          constraints={constraints}
          setConstraints={setConstraints}
        />
      </div>
      <button
        style={{ margin: 5, padding: 10 }}
        onClick={() => shuffle(setHexes, constraints)}
      >
        Randomize!
      </button>
    </div>
  );
}
