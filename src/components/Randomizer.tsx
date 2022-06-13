import React, { useEffect, useState } from "react";
import { Hex, NumberChitValue, Port } from "../types/hexes";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import BinaryConstraintControl from "./BinaryConstraintControl";
import NumericConstraintControl from "./NumericConstraintControl";
import { CatanBoard } from "../types/boards";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  FormGroup,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useStateWithLocalStorage } from "../hooks/useStateWithLocalStorage";

/**
 * Shuffle `board` using the provided constraints and set the result using
 * `setHexes`
 */
function shuffle(
  setHexes: HexSetter,
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints,
  board: CatanBoard
) {
  const terrain = board.recommendedLayout.map((hex) => ({
    type: hex.type,
    fixed: typeof hex.fixed !== "undefined",
    port: hex.port,
  }));
  // for some reason the type needs to be forced here. I asked about it at
  // https://stackoverflow.com/q/72589209/12162258
  const numbers = board.recommendedLayout.map((hex) =>
    typeof hex.number === "undefined" ? 0 : hex.number
  ) as (0 | NumberChitValue)[];
  const ports = board.recommendedLayout
    .filter(({ port }) => typeof port !== "undefined")
    .map(({ port }) => (port as Port).type);

  let randomIndex;

  // shuffle terrain first
  terrainTopLoop: while (true) {
    let currentIndex = terrain.length - 1;

    shuffleLoop: while (currentIndex >= 0) {
      // if this hex is fixed, skip it
      if (terrain[currentIndex].fixed) {
        currentIndex--;
        continue;
      }

      // check constraints. we may have gotten ourself into a state from which
      // we can't meet the constraints without backtracking, so after a few
      // tries, we bail and start over. there are obviously more disciplined
      // ways to do this (our procedure isn't necessarily comprehesive, and we
      // may test the same state multiple times), but even an aged device can
      // blow through this very quickly, so there's no compelling reason to
      // improve it
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle. we can't shuffle fixed hexes, so keep rolling the dice until
        // we select a free hex (which might be ourself)
        while (
          terrain[
            (randomIndex = Math.floor(Math.random() * (currentIndex + 1)))
          ].fixed
        );
        [terrain[currentIndex], terrain[randomIndex]] = [
          terrain[randomIndex],
          terrain[currentIndex],
        ];

        // then check each constraint. note that max connected like terrain
        // doesn't apply to sea hexes
        if (
          numericConstraints.maxConnectedLikeTerrain.value < 7 &&
          terrain[currentIndex].type !== "sea"
        ) {
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
            if (chainSize > numericConstraints.maxConnectedLikeTerrain.value)
              continue tryLoop;
            for (let neighbor of board.neighbors[hex]) {
              // consider only neighbors greater than this hex, as those lower
              // will still be shuffled, unless the lower neighbor is fixed
              if (
                (neighbor > currentIndex || terrain[neighbor].fixed) &&
                terrain[currentIndex].type === terrain[neighbor].type
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

  // then ports. we don't have any port constraints (yet?) so the shuffle is
  // purely Fisher-Yates
  let currentIndex = ports.length;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [ports[currentIndex], ports[randomIndex]] = [
      ports[randomIndex],
      ports[currentIndex],
    ];
  }

  // and then numbers
  let hexes: Hex[];
  let numNonResourceProducingHexes: number = numbers.reduce(
    (acc, v) => Number(v === 0) + acc,
    0 as number
  );
  numbersTopLoop: while (true) {
    hexes = [];
    let nonResourceProducingHexesSeen = 0;
    // we need to begin by finding any 0 values and putting them at the
    // beginning of the loop. then, we can avoid accidentally shuffling them
    // onto a resource-producing hex by making our random index choices below at
    // an offset of the number of non-resource-producing hexes not yet
    // encountered
    let zeroSearchOffset = 0,
      zeroIndex;
    while (
      (zeroIndex = numbers.indexOf(0, zeroSearchOffset)) >= zeroSearchOffset
    ) {
      [numbers[zeroSearchOffset], numbers[zeroIndex]] = [
        numbers[zeroIndex],
        numbers[zeroSearchOffset],
      ];
      zeroSearchOffset++;
    }

    // we are popping from ports below, so in case we bail out of shuffleLoop,
    // make a copy
    // IMPORTANT NOTE: here and in several other places, there is an assumption
    // that sea hexes with ports are fixed. this isn't necessarily true in
    // Seafarers and will need to be appropriately handled if support for that
    // expansion is added
    let portsCopy = ports.slice();

    shuffleLoop: for (
      let currentIndex = numbers.length - 1;
      currentIndex >= 0;
      currentIndex--
    ) {
      if (["desert", "sea"].includes(terrain[currentIndex].type)) {
        nonResourceProducingHexesSeen++;
        // shuffle in the outermost 0 value. e.g. if we have 2
        // non-resource-producing hexes and this is the first, shuffle in the
        // one at index 1. then, when we encounter the second
        // non-resource-producing hex, we shuffle in index 0
        [
          numbers[numNonResourceProducingHexes - nonResourceProducingHexesSeen],
          numbers[currentIndex],
        ] = [
          numbers[currentIndex],
          numbers[numNonResourceProducingHexes - nonResourceProducingHexesSeen],
        ];

        // we also need to check if this is a hex with a port. if so, reassign
        // its type from portsCopy
        let port = terrain[currentIndex].port;
        if (typeof port !== "undefined") port.type = portsCopy.pop()!;

        hexes.push({ type: terrain[currentIndex].type, port });

        continue;
      }

      // check constraints. as with terrain, we don't attempt to backtrack and
      // simply start over if too many tries fail
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle. we need to make sure to skip lefthand indices equal to the
        // number of deserts we haven't yet encountered
        const offset =
          numNonResourceProducingHexes - nonResourceProducingHexesSeen;
        randomIndex =
          Math.floor(Math.random() * (currentIndex + 1 - offset)) + offset;
        [numbers[currentIndex], numbers[randomIndex]] = [
          numbers[randomIndex],
          numbers[currentIndex],
        ];

        // then check each constraint

        // no 6/8 neighbors
        if (
          binaryConstraints.noAdjacentSixEight &&
          [6, 8].includes(numbers[currentIndex])
        ) {
          for (const neighbor of board.neighbors[currentIndex]) {
            if (neighbor < currentIndex) continue;
            if ([6, 8].includes(numbers[neighbor])) {
              continue tryLoop;
            }
          }
        }

        // no 2/12 neighbors
        if (
          binaryConstraints.noAdjacentTwoTwelve &&
          [2, 12].includes(numbers[currentIndex])
        ) {
          for (const neighbor of board.neighbors[currentIndex]) {
            if (neighbor < currentIndex) continue;
            if ([2, 12].includes(numbers[neighbor])) {
              continue tryLoop;
            }
          }
        }

        // no same number neighbors
        if (binaryConstraints.noAdjacentPairs) {
          for (const neighbor of board.neighbors[currentIndex]) {
            if (neighbor < currentIndex) continue;
            if (numbers[currentIndex] === numbers[neighbor]) {
              continue tryLoop;
            }
          }
        }

        // constrain pip count. we don't have a concept of "intersections", but
        // we can exploit something about the way we process numbers, i.e. last
        // to first hex. there will be a max of 3 neighbors which have already
        // been processed. we can call their indices min, middle, and max. the
        // intersections formed are then (i, min, max) and (i, middle, max). for
        // example, if we are processing index 1, we consider the intersections
        // formed by (1, 2, 5) and (1, 4, 5). if there are only two neighbors,
        // we simply consider them both, and the one neighbor case is not
        // considered
        let processedNeighbors = board.neighbors[currentIndex]
          .filter((n) => n > currentIndex)
          // note that javascript sorts lexicographically by default, even for
          // numbers. per
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description,
          // this is the preferred way to sort numbers
          .sort((a, b) => a - b);
        let intersections: number[][] = [];
        if (processedNeighbors.length === 3) {
          intersections.push([
            currentIndex,
            processedNeighbors[0],
            processedNeighbors[2],
          ]);
          intersections.push([
            currentIndex,
            processedNeighbors[1],
            processedNeighbors[2],
          ]);
        } else {
          intersections.push(processedNeighbors.concat(currentIndex));
        }
        for (const intersection of intersections) {
          let pipCount = intersection
            .map((i) => 6 - Math.abs(7 - numbers[i]))
            .reduce((acc, n) => acc + n, 0 as number);
          if (pipCount > numericConstraints.maxIntersectionPipCount.value) {
            // eslint-disable-next-line no-extra-label
            continue tryLoop;
          }
        }

        // no constraints were violated. make an entry in hexes continue
        // shuffling
        hexes.push({
          type: terrain[currentIndex].type,
          // NOTE: we know this is a NumberChitValue because we already checked
          // that it's a resource-producing hex above
          number: numbers[currentIndex] as NumberChitValue,
        });
        continue shuffleLoop;
      }

      // we failed to find a valid board after exhausting all tries. time to
      // start over from the beginning
      continue numbersTopLoop;
    }

    // we managed to create a valid board. time to break out of the loop!
    break;
  }

  // we built hexes in reverse, so make sure to reverse it before committing it
  // to state. while this doesn't really make a difference in the base Catan
  // board due to its symmetry, e.g. Explorers & Pirates neighbors are not the
  // same in reverse order, so all of our careful constraint checking could be
  // for naught
  setHexes(hexes.reverse());
}

type HexSetter = React.Dispatch<React.SetStateAction<Hex[]>>;

interface Props {
  setHexes: HexSetter;
  board: CatanBoard;
}

/**
 * Component for producing random arrangements of hexes and number chits within
 * certain constraints. Provides a dialog to manage constraint settings and two
 * buttons, one to randomize the board, and the other to open the settings
 * dialog. These can be arranged in whatever manner the parent component chooses
 */
export default function Randomizer({ setHexes, board }: Props) {
  const [binaryConstraints, setBinaryConstraints] =
    useStateWithLocalStorage<BinaryConstraints>("binaryConstraints", {
      noAdjacentSixEight: true,
      noAdjacentTwoTwelve: true,
      noAdjacentPairs: true,
    });

  const [numericConstraints, setNumericConstraints] =
    useStateWithLocalStorage<NumericConstraints>("numericConstraints", {
      maxConnectedLikeTerrain: { value: 2, valid: true },
      maxIntersectionPipCount: { value: 10, valid: true },
    });

  // we want to remember this state in case the user set invalid constraints
  // and then closed the page. it would be confusing to have the randomize
  // button greyed out without any explanation
  const [dialogOpen, setDialogOpen] = useStateWithLocalStorage(
    "randomizerDialogOpen",
    false
  );
  const [invalidConstraints, setInvalidConstraints] = useState(false);

  useEffect(
    () =>
      setInvalidConstraints(
        !Object.values(numericConstraints)
          .map((c) => c.valid)
          .reduce((acc, v) => acc && v)
      ),
    [numericConstraints, setInvalidConstraints]
  );

  const handleClose = () => {
    if (!invalidConstraints) setDialogOpen(false);
  };

  return (
    <>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingBottom: 0,
          }}
        >
          <FormGroup>
            <BinaryConstraintControl
              constraint="noAdjacentSixEight"
              label={"Allow adjacent 6 & 8"}
              toolTip={
                "When this box is checked, the numbers 6 & 8 are allowed" +
                " to appear next to each other."
              }
              constraints={binaryConstraints}
              setConstraints={setBinaryConstraints}
            />
            <BinaryConstraintControl
              constraint="noAdjacentTwoTwelve"
              label={"Allow adjacent 2 & 12"}
              toolTip={
                "When this box is checked, the numbers 2 & 12 are allowed" +
                " to appear next to each other."
              }
              constraints={binaryConstraints}
              setConstraints={setBinaryConstraints}
            />
            <BinaryConstraintControl
              constraint="noAdjacentPairs"
              label="Allow adjacent number pairs"
              toolTip={
                "When this box is checked, pairs of the same number are allowed" +
                " to appear next to each other."
              }
              constraints={binaryConstraints}
              setConstraints={setBinaryConstraints}
            />
          </FormGroup>
          <NumericConstraintControl
            constraint="maxConnectedLikeTerrain"
            min={1}
            max={7}
            label="Max connected like terrain"
            toolTip={
              "Control how many terrain hexes of the same type can appear" +
              " connected. Note that connected can mean in any shape, including a line."
            }
            constraints={numericConstraints}
            setConstraints={setNumericConstraints}
          />
          <NumericConstraintControl
            constraint="maxIntersectionPipCount"
            min={10}
            max={15}
            label="Max intersection pip count"
            toolTip={
              "Control the upper limit on the sum of the pips surrounding each" +
              " intersection. For example, if this is set to 12, an intersection surrounded" +
              " by 6 (5 pips), 5 (4 pips), and 9 (4 pips) would not be allowed."
            }
            constraints={numericConstraints}
            setConstraints={setNumericConstraints}
          />
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            style={{ marginBottom: 10 }}
            variant="contained"
            onClick={handleClose}
            disabled={invalidConstraints}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="contained"
        style={{ margin: 5, padding: 10 }}
        onClick={() =>
          shuffle(setHexes, binaryConstraints, numericConstraints, board)
        }
        disabled={invalidConstraints}
      >
        Randomize!
      </Button>
      <IconButton onClick={() => setDialogOpen(true)}>
        <SettingsIcon style={{ margin: 5 }} />
      </IconButton>
    </>
  );
}
