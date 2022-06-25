import { Hex, Port, PortType } from "../types/hexes";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import { CatanBoard } from "../types/boards";
import { HexGroups } from "./HexGroups";

/**
 * Shuffle `board` using the provided constraints and return the result
 */
export function shuffle(
  board: CatanBoard,
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints
): Hex[] {
  // shuffle terrain first
  let hexes = getShuffledTerrain(board, numericConstraints);
  // and then numbers, which depends on terrain
  hexes = getShuffledNumbers(
    board,
    hexes,
    binaryConstraints,
    numericConstraints
  );

  // ports don't get shuffled in place, so we need to assign them back to
  // hexes after shuffling. it's convenient to pop from ports, so reverse it
  // first to maintain the order of fixed ports
  const ports = getShuffledPorts(board).reverse();
  for (const hex of hexes) {
    if (hex.port !== undefined) {
      hex.port.type = ports.pop()!;
    }
  }

  return hexes;
}

function getShuffledTerrain(
  board: CatanBoard,
  numericConstraints: NumericConstraints
): Hex[] {
  const hexes: Hex[] = structuredClone(board.recommendedLayout);
  const hexGroups = new HexGroups(hexes, "terrain");
  let randomIndex;

  topLoop: while (true) {
    hexGroups.reset();

    shuffleLoop: for (
      let currentIndex = hexes.length - 1;
      currentIndex >= 0;
      currentIndex--
    ) {
      // if this hex is fixed, skip it
      if (hexes[currentIndex].fixed) continue;

      // check constraints. we may have gotten ourself into a state from which
      // we can't meet the constraints without backtracking, so after a few
      // tries, we bail and start over. there are obviously more disciplined
      // ways to do this (our procedure isn't necessarily comprehesive, and we
      // may test the same state multiple times), but even an aged device can
      // blow through this very quickly, so there's no compelling reason to
      // improve it
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle
        randomIndex = hexGroups.getRandomIndex();
        [hexes[currentIndex], hexes[randomIndex]] = [
          hexes[randomIndex],
          hexes[currentIndex],
        ];

        // then check each constraint. note that max connected like terrain
        // doesn't apply to sea hexes
        if (
          numericConstraints.maxConnectedLikeTerrain.value < 7 &&
          hexes[currentIndex].type !== "sea"
        ) {
          // accumulate all same type connected hexes using standard
          // breath-first search
          let chainSize = 0,
            hex: number;
          const seen = new Set(),
            stack = [currentIndex];
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
                (neighbor > currentIndex || hexes[neighbor].fixed) &&
                hexes[currentIndex].type === hexes[neighbor].type
              )
                stack.push(neighbor);
            }
          }
        }

        // no constraints were violated, so move to the next hex
        hexGroups.advanceCurrentIndex();
        continue shuffleLoop;
      }

      // we failed to find a valid board after exhausing all tries. start over
      continue topLoop;
    }

    // we managed to create a valid board. time to move on!
    break;
  }

  return hexes;
}

function getShuffledPorts(board: CatanBoard): PortType[] {
  // IMPORTANT NOTE: here and elsewhere, there is an assumption that sea hexes
  // with ports are fixed. this isn't necessarily true in Seafarers and will
  // need to be appropriately handled if support for that expansion is added

  const ports = board.recommendedLayout
    .filter(({ port }) => typeof port !== "undefined")
    .map(({ port }) => port as Port)
    .map(({ type, fixed }) => ({ type, fixed }));

  // we need logic to skip fixed ports, but otherwise there are no port
  // constraints, so this is just Fisher-Yates
  let currentIndex = ports.length,
    randomIndex;
  while (currentIndex > 0) {
    if (ports[currentIndex - 1].fixed) {
      currentIndex--;
      continue;
    }
    while (
      ports[(randomIndex = Math.floor(Math.random() * currentIndex))].fixed
    );
    currentIndex--;
    [ports[currentIndex], ports[randomIndex]] = [
      ports[randomIndex],
      ports[currentIndex],
    ];
  }

  return ports.map(({ type }) => type);
}

function getShuffledNumbers(
  board: CatanBoard,
  hexes: Hex[],
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints
): Hex[] {
  const minPipsOnHexTypes = board.minPipsOnHexTypes || {};
  const hexGroups = new HexGroups(hexes, "numbers");
  let randomIndex;

  topLoop: while (true) {
    hexGroups.reset();

    shuffleLoop: for (
      let currentIndex = hexes.length - 1;
      currentIndex >= 0;
      currentIndex--
    ) {
      // skip hexes without number chits
      if (hexes[currentIndex].number === undefined) continue;

      // check constraints. as with terrain, we don't attempt to backtrack and
      // simply start over if too many tries fail
      tryLoop: for (let tries = 0; tries < 10; tries++) {
        // shuffle
        randomIndex = hexGroups.getRandomIndex();
        [hexes[currentIndex].number, hexes[randomIndex].number] = [
          hexes[randomIndex].number,
          hexes[currentIndex].number,
        ];

        // then check each constraint

        // min/max pip count
        const pipCount =
          6 - Math.abs(7 - (hexes[currentIndex].number as number));
        if (
          pipCount < (minPipsOnHexTypes[hexes[currentIndex].type] || 1) ||
          pipCount > board.maxPipsOnChits[currentIndex]
        ) {
          // eslint-disable-next-line no-extra-label
          continue tryLoop;
        }

        // no 6/8 neighbors
        if (
          binaryConstraints.noAdjacentSixEight &&
          [6, 8].includes(hexes[currentIndex].number as number)
        ) {
          for (const neighbor of board.neighbors[currentIndex]) {
            if (neighbor < currentIndex) continue;
            if ([6, 8].includes(hexes[neighbor].number as number)) {
              continue tryLoop;
            }
          }
        }

        // no 2/12 neighbors
        if (
          binaryConstraints.noAdjacentTwoTwelve &&
          [2, 12].includes(hexes[currentIndex].number as number)
        ) {
          for (const neighbor of board.neighbors[currentIndex]) {
            if (neighbor < currentIndex) continue;
            if ([2, 12].includes(hexes[neighbor].number as number)) {
              continue tryLoop;
            }
          }
        }

        // no same number neighbors
        if (binaryConstraints.noAdjacentPairs) {
          for (const neighbor of board.neighbors[currentIndex]) {
            if (neighbor < currentIndex) continue;
            if (hexes[currentIndex].number === hexes[neighbor].number) {
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
        const processedNeighbors = board.neighbors[currentIndex]
            .filter((n) => n > currentIndex)
            // note that javascript sorts lexicographically by default, even for
            // numbers. per
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description,
            // this is the preferred way to sort numbers
            .sort((a, b) => a - b),
          intersections: number[][] = [];
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
          const pipCount = intersection
            .map((i) => 6 - Math.abs(7 - (hexes[i].number as number)))
            .reduce((acc, n) => acc + n, 0 as number);
          if (pipCount > numericConstraints.maxIntersectionPipCount.value) {
            continue tryLoop;
          }
        }

        // no constraints were violated. continue shuffling
        hexGroups.advanceCurrentIndex();
        continue shuffleLoop;
      }

      // we failed to find a valid board after exhausting all tries. time to
      // start over from the beginning
      continue topLoop;
    }

    // we managed to create a valid board. time to break out of the loop!
    break;
  }

  return hexes;
}
