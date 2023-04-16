import { Hex, HexType, Port, PortOrientation } from "../types/hexes";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import { CatanBoard, Neighbors } from "../types/boards";
import { HexGroups } from "./HexGroups";
import { numberToPipCount } from "../utils/catan";

// structuredClone isn't available on older devices. use this as a polyfill
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

/**
 * An error to be thrown when board shuffling cannot be completed within
 * specified constraints after a set number of tries. Should include a message
 * indicating which stage of shuffling was unabled to be completed
 */
export class ShufflingError extends Error {}
// NOTE: before 34d04a8, there was an IslandShufflingError to distinguish
// terrain shuffling failure cases. this was kind of useful for testing, but in
// the midst of boards being rejected for having too few islands, the final
// rejection could still be because of other constraints, which was causing the
// island failure test case to sometimes fail. the tests do a good enough job
// of distinguishing these cases in other ways, so the extra error type was
// deemed unnecessary
export class TerrainShufflingError extends ShufflingError {}
export class NumberShufflingError extends ShufflingError {}
export class PortShufflingError extends ShufflingError {}

/**
 * In a small test, large, heavily constrained boards were found to occasionally
 * take over 1000 retries to shuffle, although the median is much lower.
 * Multiplying that by a small factor seems like a reasonable proxy for
 * "over-constrained"
 */
const MAX_RETRIES = 10000;

/**
 * Shuffle `board` using the provided constraints and return the result
 *
 * @throws {ShufflingError} If the board is over-constrained, throws
 * `ShufflingError` with a message indicating which stage of shuffling was
 * unable to be completed
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
  // and finally ports, which also depends on terrain
  hexes = getShuffledPorts(board, hexes);

  return hexes;
}

function getShuffledTerrain(
  board: CatanBoard,
  numericConstraints: NumericConstraints
): Hex[] {
  const hexes: Hex[] = structuredClone(board.recommendedLayout);
  const hexGroups = new HexGroups(hexes, "terrain");
  let randomIndex,
    retries = 0,
    // when the min island count constraint is in play, we can reject otherwise
    // valid boards due to a smaller than desired number of islands, but
    // subsequently exceed the maximum number of reshuffle tries for a different
    // reason. the error reported to the user in that case should be about min
    // islands, so we need to track whether we successfully built a board that
    // satisfied all constraints except for the island constraint
    encountered_island_error = false;
  const islandError =
    "Failed to find a board that falls within the specified constraints for" +
    " the minimum number of distinct islands. It's very likely that this" +
    " board is over-constrained. Please lower the minimum acceptable" +
    " island count and try again.";

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
          // depth-first search
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
            for (const neighbor of Object.values(board.neighbors[hex])) {
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
      if (retries++ > MAX_RETRIES)
        throw new TerrainShufflingError(
          encountered_island_error
            ? islandError
            : "Failed to find a board that falls within the specified constraints for" +
              " terrain. It's very likely that this board is over-constrained. For" +
              " example, if there are a large number of pasture hexes and you" +
              " specify that no same type hexes may touch, it might be impossible" +
              " to construct a suitable board. Please relax constraints and try" +
              " again."
        );
      continue topLoop;
    }

    // the last constraint, that a minimum number of distinct islands were
    // created, is a full-board constraint that we can only check in a general
    // way after the full board has been built. however, we don't need to
    // calculate anything if the constraint isn't active, which it isn't for
    // most scenarios (it's not our responsibility here to determine when this
    // is true, however, just to evaluate the situation when we're told it is)
    if (
      numericConstraints.minIslandCount.active &&
      countIslands(hexes, board) < numericConstraints.minIslandCount.value
    ) {
      encountered_island_error = true;
      if (retries++ > MAX_RETRIES) throw new TerrainShufflingError(islandError);
      // eslint-disable-next-line no-extra-label
      continue topLoop;
    }

    // we managed to create a valid board. time to move on!
    break;
  }

  return hexes;
}

/**
 * Count and return the number of distinct islands (groups of connected terrain
 * hexes surrounded complete by water) formed by `hexes` in the context of
 * `board`. This function is separated out from {@link getShuffledTerrain} for the
 * purpose of testing only and should not be used in any other context
 */
export function countIslands(hexes: Hex[], board: CatanBoard): number {
  let numIslands = 0;
  const seen = Array(hexes.length).fill(false);
  for (let i = 0; i < hexes.length; i++) {
    const stack = [i];
    let size = 0,
      hex: number;
    while (stack.length > 0) {
      hex = stack.pop()!;
      if (seen[hex] || hexes[hex].type === "sea") continue;
      seen[hex] = true;
      size++;
      stack.push(...Object.values(board.neighbors[hex]));
    }
    if (size) numIslands++;
  }
  return numIslands;
}

/**
 * Do vanilla Fisher-Yates in-place on `array`
 */
function fisherYates(array: any[]) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function getShuffledPorts(board: CatanBoard, hexes: Hex[]): Hex[] {
  // FIXME: this function completely ignores hex groups, and for good reason:
  // there are no known scenarios that impose group constraints on ports. that
  // said, if such a board were proposed, it would not be properly shuffled by
  // the existing logic. this serves as a note that the logic would need to be
  // refined for such a scenario

  // the first task is to reset all fixed ports
  for (let i = 0; i < board.recommendedLayout.length; i++) {
    if (board.recommendedLayout[i].port?.fixed) {
      hexes[i].port = board.recommendedLayout[i].port;
    }
  }

  // next, gather the remaining (non-fixed) ports
  const ports = board.recommendedLayout
    .filter(({ port }) => typeof port !== "undefined" && !port.fixed)
    .map(({ port }) => port as Port);
  // on some boards, all ports are fixed, so we can return now
  if (!ports.length) return hexes;
  // otherwise, shuffle what remains
  fisherYates(ports);

  // fill in (non-fixed) ports on fixed hexes, being careful not to change their
  // orientations
  for (const hex of hexes) {
    if (hex.fixed && hex.port && !hex.port.fixed) {
      hex.port.type = ports.pop()!.type;
    }
  }
  // on most boards, all port hexes are fixed, so check again if we're ready to
  // return
  if (!ports.length) return hexes;

  // finally, it's time to place the rest of ports on valid sea hexes in valid
  // orientations. start by clearing ports on non-fixed hexes
  for (const hex of hexes) {
    if (hex.port && !hex.fixed) delete hex.port;
  }
  // then, gather unassigned sea hexes. retain their indices so we can look up
  // their neighbors. note that we aren't excluding fixed hexes. there's no
  // issue with shuffling a free port onto a fixed hex, e.g. one representing
  // the border
  const seaHexes = hexes
    .map((hex, i) => [hex, i] as [Hex, number])
    .filter(
      ([hex, _]) =>
        hex.type === "sea" && !hex.port && hex.portsAllowed !== false
    );
  // shuffle them
  fisherYates(seaHexes);
  // and test to see if there are any valid port orientations on each.
  for (const [seaHex, index] of seaHexes) {
    const validOrientations: PortOrientation[] = getValidPortOrientations(
      index,
      hexes,
      board
    );
    // if there weren't any valid orientations, keep going
    if (!validOrientations.length) continue;
    // otherwise, choose a random one
    const orientation =
      validOrientations[Math.floor(Math.random() * validOrientations.length)];
    // and assign a port to this hex
    seaHex.port = { type: ports.pop()!.type, orientation };
    // if we've run out of ports, it's time to stop
    if (!ports.length) break;
  }

  // if we still have unassigned ports, blow up. technically, we should probably
  // retry a few times. it's possible, for example, that different orientations
  // might fit within constraints. in practice, though, I don't think a board
  // crowded enough for this to happen should exist, so it's probably moot
  if (ports.length)
    throw new PortShufflingError(
      "Unable to assign all ports to sea hexes. This might happen if your board" +
        " is specified with a large number of ports and relatively few sea hexes." +
        " Since any given intersection can't have more than one dock pointed at it," +
        " it's possible to specify a board that can't be randomized within that" +
        " constraint. Please check your board specification and try again."
    );

  return hexes;
}

const directions: (keyof Neighbors)[] = ["w", "nw", "ne", "e", "se", "sw"];
const dirToOrientation: Record<keyof Neighbors, PortOrientation> = {
  w: 0,
  nw: 60,
  ne: 120,
  e: 180,
  se: 240,
  sw: 300,
};

/**
 * Determine the valid `PortOrientation`s at `shuffledHexes[index]`, if any. If
 * `shuffledHexes[index]` is not a sea hex or already has a port assigned to it,
 * the result is an empty list.
 *
 * In order to be valid, an orientation must meet the following criteria:
 *
 * 1. The hex in the same direction as the port must be a known land hex.
 * 2. If directions are listed in order (clockwise or counter, doesn't
 *    matter) and the orientation index is i, then the hex at (i+5)%6 must not
 *    contain a port oriented at (i+1)%6, and the hex at (i+1)%6 must not
 *    contain a port oriented at (i+5)%6
 *
 * NOTE: This logic is pulled out of {@link getShuffledPorts} mostly for the
 * purpose of testing. It shouldn't be used on its own outside of that context.
 */
export function getValidPortOrientations(
  index: number,
  shuffledHexes: Hex[],
  board: CatanBoard
): PortOrientation[] {
  if (shuffledHexes[index].type !== "sea" || shuffledHexes[index].port)
    return [];

  const validOrientations: PortOrientation[] = [];
  const neighbors = board.neighbors[index];
  for (let i = 0; i < directions.length; i++) {
    // establish the directions which will need various sorts of testing
    const heading = directions[i],
      counterClockwise =
        directions[(i + directions.length - 1) % directions.length],
      clockwise = directions[(i + 1) % directions.length];
    if (
      // hex in heading direction must exist and be land
      neighbors[heading] !== undefined &&
      !["sea", "fog"].includes(shuffledHexes[neighbors[heading]!].type) &&
      // counterClockwise hex must either not exist or not have a clockwise port
      (neighbors[counterClockwise] === undefined ||
        shuffledHexes[neighbors[counterClockwise]!].port?.orientation !==
          dirToOrientation[clockwise]) &&
      // clockwise hex must either not exist or not have a counterClockwise port
      (neighbors[clockwise] === undefined ||
        shuffledHexes[neighbors[clockwise]!].port?.orientation !==
          dirToOrientation[counterClockwise])
    ) {
      validOrientations.push(dirToOrientation[heading]);
    }
  }

  return validOrientations;
}

function getShuffledNumbers(
  board: CatanBoard,
  hexes: Hex[],
  binaryConstraints: BinaryConstraints,
  numericConstraints: NumericConstraints
): Hex[] {
  // it's useful to manually widen these so we don't have to do extra checks
  // below. the narrowness of the board types is useful for restricting board
  // specification, but not beyond that
  const minPipsOnHexTypes: { [type in HexType]?: number } =
    board.minPipsOnHexTypes || {};
  const maxPipsOnHexTypes: { [type in HexType]?: number } =
    board.maxPipsOnHexTypes || {};
  const hexGroups = new HexGroups(hexes, "numbers", board.fixNumbersInGroups);
  let randomIndex,
    retries = 0;

  topLoop: while (true) {
    hexGroups.reset();

    shuffleLoop: for (
      let currentIndex = hexes.length - 1;
      currentIndex >= 0;
      currentIndex--
    ) {
      // if this hex is in a fixed group, reset it to its original number value
      // and move on
      if (
        board.fixNumbersInGroups &&
        board.fixNumbersInGroups.includes(hexes[currentIndex].group)
      ) {
        hexes[currentIndex].number =
          board.recommendedLayout[currentIndex].number;
        continue;
      }
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
        const pipCount = numberToPipCount(hexes[currentIndex].number!);
        if (
          pipCount < (minPipsOnHexTypes[hexes[currentIndex].type] || 1) ||
          pipCount > (maxPipsOnHexTypes[hexes[currentIndex].type] || 5) ||
          pipCount > board.maxPipsOnChits[currentIndex]
        ) {
          // eslint-disable-next-line no-extra-label
          continue tryLoop;
        }

        // as we check neighbor-related constraints, we don't want to consider
        // neighbors which may subsequently be shuffled. since shuffling
        // proceeds from high to low indices, this means that neighbors at
        // lower indices which are not in a fixed number group are excluded
        const neighborIndices = Object.values(
          board.neighbors[currentIndex]
        ).filter(
          (neighbor) =>
            neighbor > currentIndex ||
            (board.fixNumbersInGroups &&
              // for historical reasons, undefined is the default hex group, so
              // we have to lie to typescript here about nullity. the resulting
              // js will work as expected
              board.fixNumbersInGroups.includes(hexes[neighbor].group!))
        );

        // no 6/8 neighbors
        if (
          binaryConstraints.noAdjacentSixEight &&
          [6, 8].includes(hexes[currentIndex].number as number)
        ) {
          for (const neighbor of neighborIndices) {
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
          for (const neighbor of neighborIndices) {
            if ([2, 12].includes(hexes[neighbor].number as number)) {
              continue tryLoop;
            }
          }
        }

        // no same number neighbors
        if (binaryConstraints.noAdjacentPairs) {
          for (const neighbor of neighborIndices) {
            if (hexes[currentIndex].number === hexes[neighbor].number) {
              continue tryLoop;
            }
          }
        }

        // constrain pip count per intersection
        for (const pipCount of getIntersectionPipCounts({
          board,
          hexes,
          atIndex: currentIndex,
        })) {
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
      if (retries++ > MAX_RETRIES)
        throw new NumberShufflingError(
          "Failed to find a board that falls within the specified constraints for" +
            " number chits. It's very likely that this board is over-constrained." +
            " For example, if there aren't very many low pip chits in a given group" +
            " and you specify a small maximum intersection pip count, it might be" +
            " impossible to construct a suitable board. Please relax constraints" +
            " and try again."
        );
      continue topLoop;
    }

    // we managed to create a valid board. time to break out of the loop!
    break;
  }

  return hexes;
}

interface GetIntersectionPipCountProps {
  board: CatanBoard;
  hexes: Hex[];
  atIndex: number;
  /**
   * Shuffling proceeds high to low, so there's usually no point in checking
   * intersections including indices lower than `atIndex` during shuffling (see
   * {@link getIntersectionPipCounts} for the edge case). This isn't necessarily
   * the case during testing, so this switch is provided to include all
   * surrounding intersections when set to `false`.
   */
  onlyHigher?: boolean;
}

/**
 * Get the total pip counts of each intersection including the hex at `atIndex`,
 * subject to `onlyHigher`. See {@link GetIntersectionPipCountProps} for details
 */
export function getIntersectionPipCounts({
  board,
  hexes,
  atIndex,
  onlyHigher = true,
}: GetIntersectionPipCountProps): number[] {
  const neighbors = board.neighbors[atIndex],
    groups: (keyof Neighbors)[][] = [
      ["sw", "se"],
      ["se", "e"],
    ],
    intersections: number[][] = [];
  if (!onlyHigher) {
    groups.push(["e", "ne"], ["ne", "nw"], ["nw", "w"], ["w", "sw"]);
  } else if (board.fixNumbersInGroups) {
    // As noted in {@link GetIntersectionPipCountProps}, shuffling proceeds high
    // to low, so in the vast majority of cases, there's no point in checking
    // intersections including indices lower than `atIndex` during shuffling.
    // However, there is a case where lower neighbors could be part of a fixed
    // number group and should as such be considered even during shuffling. We
    // check for this here
    const potentialGroups: (keyof Neighbors)[][][] = [
      [["ne"], ["e", "ne"]],
      [
        ["ne", "nw"],
        ["ne", "nw"],
      ],
      [
        ["nw", "w"],
        ["nw", "w"],
      ],
      [["w"], ["w", "sw"]],
    ];
    for (const [toCheck, toAdd] of potentialGroups) {
      if (
        toCheck.some((dir) => {
          return (
            board.recommendedLayout[neighbors[dir]!] &&
            // TS can't reason that board.fixNumbersInGroups is not undefined
            // even though we checked at the top level of the condition,
            // because it may have become so intervening. we know this isn't
            // the case, so we can safely assert that it is in fact defined
            board.fixNumbersInGroups!.includes(
              // strictNullChecks prevents us from indexing
              // board.recommendedLayout with unchecked values from neighbors.
              // javascript is totally fine with indexing an array with
              // undefined, however. for brevity, we lie to typescript by
              // asserting that all neighbors lookups are not null
              board.recommendedLayout[neighbors[dir]!]?.group
            )
          );
        })
      ) {
        groups.push(toAdd);
      }
    }
  }

  for (const group of groups) {
    const intersection: number[] = [atIndex];
    for (const dir of group) {
      if (dir in neighbors) intersection.push(neighbors[dir]!);
    }
    if (intersection.length > 1) intersections.push(intersection);
  }
  return intersections.map((intersection) =>
    intersection
      .map((i) => hexes[i].number)
      .filter((num) => num !== undefined)
      .map((num) => numberToPipCount(num!))
      .reduce((acc, n) => acc + n, 0 as number)
  );
}
