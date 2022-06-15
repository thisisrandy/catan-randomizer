import { Hex, HexType, NumberChitValue, Port, PortType } from "../types/hexes";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import { CatanBoard } from "../types/boards";

interface Terrain {
  type: HexType;
  fixed: boolean;
  port: Port | undefined;
}

type Number = NumberChitValue | 0;

/**
 * Shuffle `board` using the provided constraints and set the result using
 * `setHexes`
 */
export function shuffle(
  board: CatanBoard,
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints
): Hex[] {
  // shuffle terrain first
  const terrain = getShuffledTerrain(board, numericConstraints);
  // then ports
  const ports = getShuffledPorts(board);
  // and finally, numbers, which depends on terrain
  const numbers = getShuffledNumbers(
    board,
    terrain,
    binaryConstraints,
    numericConstraints
  );

  // having shuffled everything, it's time to assemble the board
  const hexes: Hex[] = [];
  for (
    let currentIndex = 0;
    currentIndex < board.recommendedLayout.length;
    currentIndex++
  ) {
    const hex: Hex = { type: terrain[currentIndex].type };
    const port = terrain[currentIndex].port;
    if (typeof port !== "undefined") {
      port.type = ports.pop()!;
      hex.port = port;
    }
    if (numbers[currentIndex] > 0) {
      hex.number = numbers[currentIndex] as NumberChitValue;
    }
    hexes.push(hex);
  }

  return hexes;
}

function getShuffledTerrain(
  board: CatanBoard,
  numericConstraints: NumericConstraints
): Terrain[] {
  const terrain: Terrain[] = board.recommendedLayout.map((hex) => ({
    type: hex.type,
    fixed: typeof hex.fixed !== "undefined",
    port: hex.port,
  }));
  let randomIndex;

  topLoop: while (true) {
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
      continue topLoop;
    }

    // we managed to create a valid board. time to move on!
    break;
  }

  return terrain;
}

function getShuffledPorts(board: CatanBoard): PortType[] {
  // IMPORTANT NOTE: here and elsewhere, there is an assumption that sea hexes
  // with ports are fixed. this isn't necessarily true in Seafarers and will
  // need to be appropriately handled if support for that expansion is added

  const ports = board.recommendedLayout
    .filter(({ port }) => typeof port !== "undefined")
    .map(({ port }) => (port as Port).type);

  // we don't have any port constraints (yet?) so the shuffle is purely
  // Fisher-Yates
  let currentIndex = ports.length,
    randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [ports[currentIndex], ports[randomIndex]] = [
      ports[randomIndex],
      ports[currentIndex],
    ];
  }

  return ports;
}

function getShuffledNumbers(
  board: CatanBoard,
  shuffledTerrain: Terrain[],
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints
): Number[] {
  // note the explicit typing of 0 to prevent it from widening to number in
  // places where it can be reassigned. see
  // https://stackoverflow.com/a/72597545/12162258
  const numbers = board.recommendedLayout.map((hex) =>
    typeof hex.number === "undefined" ? (0 as 0) : hex.number
  );
  let randomIndex;

  let numNonResourceProducingHexes: number = numbers.reduce(
    (acc, v) => Number(v === 0) + acc,
    0 as number
  );
  topLoop: while (true) {
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

    shuffleLoop: for (
      let currentIndex = numbers.length - 1;
      currentIndex >= 0;
      currentIndex--
    ) {
      if (["desert", "sea"].includes(shuffledTerrain[currentIndex].type)) {
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

        continue;
      }

      // check constraints. as with terrain, we don't attempt to backtrack and
      // simply start over if too many tries fail
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle. we need to make sure to skip lefthand indices equal to the
        // number of non-resource-producing hexes we haven't yet encountered
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

        // no constraints were violated. continue shuffling
        continue shuffleLoop;
      }

      // we failed to find a valid board after exhausting all tries. time to
      // start over from the beginning
      continue topLoop;
    }

    // we managed to create a valid board. time to break out of the loop!
    break;
  }

  return numbers;
}
