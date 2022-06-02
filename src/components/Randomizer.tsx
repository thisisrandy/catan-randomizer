import "../css/randomizer.css";
import React, { useState } from "react";
import { HexRecord } from "../types/hexes";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import BinaryConstraintControl from "./BinaryConstraintControl";
import NumericConstraintControl from "./NumericConstraintControl";
import { CatanBoard } from "../types/boards";

function shuffle(
  setHexes: HexSetter,
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints,
  board: CatanBoard
) {
  const terrain = board.recommendedLayout.map((hex) => hex.type);
  const numbers = board.recommendedLayout.map((hex) => hex.number);

  let randomIndex;

  // shuffle terrain first
  terrainTopLoop: while (true) {
    let currentIndex = terrain.length - 1;

    shuffleLoop: while (currentIndex >= 0) {
      // check constraints. we may have gotten ourself into a state from which
      // we can't meet the constraints without backtracking. so after a few
      // tries, we bail and start over. there are obviously more disciplined
      // ways to do this, but a succeed or bail loop works
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle
        randomIndex = Math.floor(Math.random() * currentIndex);
        [terrain[currentIndex], terrain[randomIndex]] = [
          terrain[randomIndex],
          terrain[currentIndex],
        ];

        // then check each constraint
        if (numericConstraints.maxConnectedTerrainPairs < 7) {
          // accumulate all same type connected hexes using standard
          // breath-first search
          let chainSize = 0,
            seen = new Set(),
            stack = [currentIndex],
            hex: number;
          while (stack.length > 0) {
            hex = stack.pop()!;
            if (seen.has(hex)) continue;
            seen.add(hex);
            chainSize += 1;
            if (chainSize > numericConstraints.maxConnectedTerrainPairs)
              continue tryLoop;
            for (let neighbor of board.neighbors[hex]) {
              // consider only neighbors greater than this hex, as those lower
              // will still be shuffled
              if (
                neighbor > currentIndex &&
                terrain[currentIndex] === terrain[neighbor]
              )
                stack.push(neighbor);
            }
          }
        }

        // no constraints were violated, so move to the next hex
        currentIndex--;
        continue shuffleLoop;
      }

      // we failed to find a valid board after exhausing all tries. start over
      continue terrainTopLoop;
    }

    // we managed to create a valid board. time to move on!
    break;
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
        hexes.push({ type: terrain[i], number: 0 });
        [numbers[0], numbers[j]] = [numbers[j], numbers[0]];
        sawDesert = true;
        continue;
      }

      // check constraints. as with terrain, we don't attempt to backtrack and
      // start over if too many tries fail
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
          for (const neighbor of board.neighbors[j]) {
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
          for (const neighbor of board.neighbors[j]) {
            if (neighbor < j) continue;
            if ([2, 12].includes(numbers[neighbor])) {
              continue tryLoop;
            }
          }
        }

        // no same number neighbors
        if (binaryConstraints.noAdjacentPairs) {
          for (const neighbor of board.neighbors[j]) {
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

type HexSetter = React.Dispatch<React.SetStateAction<HexRecord>>;

interface Props {
  setHexes: HexSetter;
  board: CatanBoard;
}

/**
 * This is a button component for producing a random board within certain
 * contraints. Initial contraints will just be no adjacent 6's and 8's, but
 * options will be added later
 */
export default function Randomizer({ setHexes, board }: Props) {
  // TODO: add a board history

  const [binaryConstraints, setBinaryConstraints] = useState<BinaryConstraints>(
    {
      noAdjacentSixEight: true,
      noAdjacentTwoTwelve: true,
      noAdjacentPairs: true,
    }
  );

  const [numericConstraints, setNumericConstraints] =
    useState<NumericConstraints>({
      maxConnectedTerrainPairs: 1,
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
          constraint="noAdjacentSixEight"
          text={"Allow adjacent 6 & 8"}
          constraints={binaryConstraints}
          setConstraints={setBinaryConstraints}
        />
        <BinaryConstraintControl
          constraint="noAdjacentTwoTwelve"
          text={"Allow adjacent 2 & 12"}
          constraints={binaryConstraints}
          setConstraints={setBinaryConstraints}
        />
        <BinaryConstraintControl
          constraint="noAdjacentPairs"
          text="Allow adjacent number pairs"
          constraints={binaryConstraints}
          setConstraints={setBinaryConstraints}
        />
        <NumericConstraintControl
          constraint="maxConnectedTerrainPairs"
          min={1}
          max={7}
          text="Maximum connected terrain pairs"
          constraints={numericConstraints}
          setConstraints={setNumericConstraints}
        />
      </div>
      <button
        style={{ margin: 5, padding: 10 }}
        onClick={() =>
          shuffle(setHexes, binaryConstraints, numericConstraints, board)
        }
      >
        Randomize!
      </button>
    </div>
  );
}
