import { EXPANSIONS } from "../data/expansions";
import catanBoardFactory from "../factories/boardFactory";
import { shuffle } from "../logic/shuffle";
import { CatanBoardTemplate, MinPipsOnHexTypes } from "../types/boards";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import { Hex, HexType, NumberChitValue } from "../types/hexes";

// FIXME: Jest for some reason erases structuredClone, which is used by the
// shuffling code. https://github.com/facebook/jest/issues/12628 was supposed to
// have fixed that, but a) create-react-app hasn't been updated to include that
// version of jest, and b) the fix seems strangely absent from the most recent
// version (v28.1.1), even though it's noted in the changelog. I need to
// re-report the bug, but for now, I can just fake structuredClone
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

const board = EXPANSIONS.get("Catan")!;
const binaryConstraints: BinaryConstraints = {
  noAdjacentPairs: true,
  noAdjacentSixEight: true,
  noAdjacentTwoTwelve: true,
};
const numericConstraints: NumericConstraints = {
  maxConnectedLikeTerrain: { value: 1, valid: true },
  maxIntersectionPipCount: { value: 10, valid: true },
};
const pipConstrainedTemplate: CatanBoardTemplate = [
  [
    { type: "forest", number: 10, maxPipsOnChit: 3 },
    { type: "forest", number: 3, maxPipsOnChit: 3 },
    { type: "forest", number: 6 },
    { type: "hills", number: 5 },
    { type: "pasture", number: 2 },
    { type: "pasture", number: 4 },
  ],
];
const minPipsOnHexTypes: MinPipsOnHexTypes = { pasture: 3 };
const pipConstrainedBoard = catanBoardFactory(
  pipConstrainedTemplate,
  undefined,
  minPipsOnHexTypes
);
/** We're dealing with random shuffling here, so we need many samples to detect
 * certain behavior with high probability */
const numSamples = 50;

describe("shuffle", () => {
  it("shouldn't run forever when constraints are at their most restrictive", async () => {
    shuffle(board, binaryConstraints, numericConstraints);
  }, 1000);

  it("shouldn't allow adjacent 6 & 8 when so constrained", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (typeof hex.number !== "undefined" && [6, 8].includes(hex.number)) {
          for (const neighbor of board.neighbors[j].map((n) => hexes[n])) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect([6, 8]).not.toContain(neighbor.number);
          }
        }
      }
    }
  });

  it("shouldn't allow adjacent 2 & 12 when so constrained", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (typeof hex.number !== "undefined" && [2, 12].includes(hex.number)) {
          for (const neighbor of board.neighbors[j].map((n) => hexes[n])) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect([2, 12]).not.toContain(neighbor.number);
          }
        }
      }
    }
  });

  it("shouldn't allow adjacent number pairs when so constrained", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (typeof hex.number !== "undefined") {
          for (const neighbor of board.neighbors[j].map((n) => hexes[n])) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(hex.number).not.toEqual(neighbor.number);
          }
        }
      }
    }
  });

  it("should allow adjacent 6 & 8 when not constrained", () => {
    let sixEightOkay: BinaryConstraints = {
      ...binaryConstraints,
      noAdjacentSixEight: false,
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, sixEightOkay, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (typeof hex.number !== "undefined" && [6, 8].includes(hex.number)) {
          for (const neighbor of board.neighbors[j].map((n) => hexes[n])) {
            if (typeof neighbor.number === "undefined") continue;
            // if we found what we were looking for, immediately finish the test
            if ([6, 8].includes(neighbor.number)) return;
          }
        }
      }
    }
    // if we never found what we were looking for, fail
    expect(false).toBe(true);
  });

  it("should allow adjacent 2 & 12 when not constrained", () => {
    let twoTwelveOkay: BinaryConstraints = {
      ...binaryConstraints,
      noAdjacentTwoTwelve: false,
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, twoTwelveOkay, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (typeof hex.number !== "undefined" && [2, 12].includes(hex.number)) {
          for (const neighbor of board.neighbors[j].map((n) => hexes[n])) {
            if (typeof neighbor.number === "undefined") continue;
            // if we found what we were looking for, immediately finish the test
            if ([2, 12].includes(neighbor.number)) return;
          }
        }
      }
    }
    // if we never found what we were looking for, fail
    expect(false).toBe(true);
  });

  it("should allow adjacent number pairs when not constrained", () => {
    let pairsOkay: BinaryConstraints = {
      ...binaryConstraints,
      noAdjacentPairs: false,
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, pairsOkay, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (typeof hex.number !== "undefined") {
          for (const neighbor of board.neighbors[j].map((n) => hexes[n])) {
            // if we found what we were looking for, immediately finish the test
            if (hex.number === neighbor.number) return;
          }
        }
      }
    }
    // if we never found what we were looking for, fail
    expect(false).toBe(true);
  });

  it("shouldn't allow connected same type hexes when so constrained", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (const [j, hex] of hexes.entries()) {
        if (hex.type === "sea") continue;
        for (const neighbor of board.neighbors[j]) {
          expect(hex.type).not.toEqual(hexes[neighbor].type);
        }
      }
    }
  });

  it("should allow connected same type hexes when not constrained", () => {
    const likeTerrainOkay: NumericConstraints = {
      ...numericConstraints,
      maxConnectedLikeTerrain: { value: 7, valid: true },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, likeTerrainOkay);
      for (const [j, hex] of hexes.entries()) {
        if (hex.type === "sea") continue;
        for (const neighbor of board.neighbors[j]) {
          // if we found what we were looking for, immediately finish the test
          if (hex.type === hexes[neighbor].type) return;
        }
      }
    }
    // if we never found what we were looking for, fail
    expect(false).toBe(true);
  });

  it("shouldn't allow intersection pip counts above the specified maximum", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (let j = 0; j < hexes.length; j++) {
        for (const pipCount of getIntersectionPipCountsAt(hexes, j)) {
          expect(pipCount).toBeLessThanOrEqual(
            numericConstraints.maxIntersectionPipCount.value
          );
        }
      }
    }
  });

  it("should allow high intersection pip counts when unconstrained", () => {
    // we're going to be looking for 15s, so remove all binary constraints
    const noBinaryConstraints: BinaryConstraints = {
      noAdjacentPairs: false,
      noAdjacentSixEight: false,
      noAdjacentTwoTwelve: false,
    };
    const noPipCountRestriction: NumericConstraints = {
      ...numericConstraints,
      maxIntersectionPipCount: { value: 15, valid: true },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, noBinaryConstraints, noPipCountRestriction);
      for (let j = 0; j < hexes.length; j++) {
        for (const pipCount of getIntersectionPipCountsAt(hexes, j)) {
          // if we found what we were looking for, immediately finish the test
          if (pipCount === numericConstraints.maxIntersectionPipCount.value)
            return;
        }
      }
    }
    // if we never found what we were looking for, fail
    expect(false).toBe(true);
  });

  it("shouldn't allow low pip counts on constrained terrain types", () => {
    const groupedTerrainOkay: NumericConstraints = {
      ...numericConstraints,
      maxConnectedLikeTerrain: { value: 7, valid: true },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        pipConstrainedBoard,
        binaryConstraints,
        groupedTerrainOkay
      );
      for (let j = 0; j < hexes.length; j++) {
        expect(hexes[j].number).toBeGreaterThanOrEqual(
          minPipsOnHexTypes[hexes[j].type] || 1
        );
      }
    }
  });

  it("should allow low pip counts on all terrain types when unconstrained", () => {
    const twoOrTwelveSeen: { [type in HexType]?: boolean } = {
      fields: false,
      forest: false,
      hills: false,
      pasture: false,
      mountains: false,
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (let j = 0; j < hexes.length; j++) {
        if (hexes[j].number && [2, 12].includes(hexes[j].number as number)) {
          twoOrTwelveSeen[hexes[j].type] = true;
          if (Object.values(twoOrTwelveSeen).reduce((acc, seen) => acc && seen))
            return;
        }
      }
    }
    expect(false).toBe(true);
  });

  it("shouldn't allow high pip counts on constrained hexes", () => {
    const groupedTerrainOkay: NumericConstraints = {
      ...numericConstraints,
      maxConnectedLikeTerrain: { value: 7, valid: true },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        pipConstrainedBoard,
        binaryConstraints,
        groupedTerrainOkay
      );
      for (let j = 0; j < hexes.length; j++) {
        const pipCount = 6 - Math.abs(7 - (hexes[j].number as number));
        expect(pipCount).toBeLessThanOrEqual(
          pipConstrainedTemplate[0][j].maxPipsOnChit || 5
        );
      }
    }
  });

  it("should allow high pip counts all hexes when unconstrained", () => {
    const sixOrEightSeen = board.recommendedLayout.map(
      (hex) => hex.number === undefined
    );
    let countSixOrEightNotSeen = sixOrEightSeen.reduce(
      (acc, seen) => acc + Number(!seen),
      0
    );
    // seeing 6 or 8 at *every* hex is a pretty tall order, so take many more
    // samples than the other tests to ensure success
    for (let i = 0; i < numSamples * 5; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (let j = 0; j < hexes.length; j++) {
        if (
          hexes[j].number &&
          [6, 8].includes(hexes[j].number as number) &&
          !sixOrEightSeen[j]
        ) {
          sixOrEightSeen[j] = true;
          if (!--countSixOrEightNotSeen) return;
        }
      }
    }
    expect(false).toBe(true);
  });

  it("should shuffle terrain and number chits only within groups", () => {
    const template: CatanBoardTemplate = [
      [
        { type: "desert" },
        { type: "fields", number: 5, group: 2 },
        { type: "fields", number: 4 },
        { type: "forest", number: 3 },
        { type: "hills", number: 3, group: 1 },
        { type: "mountains", number: 6, group: 1 },
        { type: "mountains", number: 8, group: 2 },
        { type: "sea", fixed: true, group: 2 },
        { type: "pasture", number: 2, group: 2 },
      ],
    ];
    const board = catanBoardFactory(template);
    const groupsAndIndices: [number | undefined, number][] =
      board.recommendedLayout.map((h, i) => [h.group, i]);
    const uniqueGroups = Array.from(
      new Set(board.recommendedLayout.map((h) => h.group)).values()
    );
    const getGroups = (hexes: Hex[]) =>
      uniqueGroups.map((groupId) => {
        const indices = groupsAndIndices
          .filter(([g]) => g === groupId)
          .map(([, i]) => i);
        return {
          groupId,
          terrain: indices.map((i) => hexes[i].type).sort(),
          numbers: indices
            .map((i) => hexes[i].number)
            .filter((n) => n !== undefined)
            .sort() as NumberChitValue[],
        };
      });
    const startGroups = getGroups(board.recommendedLayout);

    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      const groups = getGroups(hexes);
      for (const group of groups) {
        for (const startGroup of startGroups) {
          // there aren't ever many groups, so while we could use Maps, scanning
          // is fine
          if (group.groupId !== startGroup.groupId) continue;
          expect(group).toEqual(startGroup);
        }
      }
    }
  });
});

function getIntersectionPipCountsAt(hexes: Hex[], index: number): number[] {
  const hex = hexes[index];
  if (typeof hex.number === "undefined") return [];

  // as in the shuffle code, the easiest way to do this is collect the up
  // to 3 neighbors larger than the current hex. calling them min, mid,
  // and max, there are two intersections at (i, min, max) and (i, mid,
  // max). if there are only two neighbors, consider them both. don't
  // consider only one neighbor, as we only allow the max intersection pip count
  // constraint to go down to 10 (lower isn't possible on most
  // reasonable-looking boards), and the max of a two neighbor intersection is
  // 10
  const largerNeighbors = board.neighbors[index]
      .filter((n) => n > index)
      .sort((a, b) => a - b)
      .map((n) => hexes[n].number)
      .map((num) => (typeof num === "undefined" ? 0 : num)),
    intersections: number[][] = [];

  if (largerNeighbors.length === 3) {
    intersections.push([hex.number, largerNeighbors[0], largerNeighbors[2]]);
    intersections.push([hex.number, largerNeighbors[1], largerNeighbors[2]]);
  } else if (largerNeighbors.length === 2) {
    intersections.push(largerNeighbors.concat(hex.number));
  }

  return intersections.map((intersection) =>
    intersection
      .map((num) => 6 - Math.abs(7 - num))
      .reduce((acc, n) => acc + n, 0)
  );
}
