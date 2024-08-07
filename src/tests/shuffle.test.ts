import { EXPANSIONS } from "../data/expansions";
import catanBoardFactory, { BoardSpecError } from "../factories/boardFactory";
import {
  countIslands,
  FishShufflingError,
  getIntersectionPipCounts,
  getValidFishTileOrientations,
  getValidPortOrientations,
  NumberShufflingError,
  PortShufflingError,
  shuffle,
  TerrainShufflingError,
} from "../logic/shuffle";
import { CatanBoardTemplate } from "../types/boards";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import { Hex, HexType, NumberChitValue } from "../types/hexes";
import { numberToPipCount } from "../utils/catan";

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
  maxConnectedLikeTerrain: { value: 1, valid: true, active: true },
  maxIntersectionPipCount: { value: 10, valid: true, active: true },
  minIslandCount: { value: 1, valid: true, active: false },
};
const pipConstrainedTemplate: CatanBoardTemplate = {
  board: [
    [
      { type: "forest", number: 10, maxPipsOnChit: 3 },
      { type: "forest", number: 3, maxPipsOnChit: 3 },
      { type: "forest", number: 6 },
      { type: "hills", number: 5 },
      { type: "pasture", number: 2 },
      { type: "pasture", number: 4 },
    ],
  ],
  minPipsOnHexTypes: { pasture: 3 },
  maxPipsOnHexTypes: { hills: 4 },
};
const pipConstrainedBoard = catanBoardFactory(pipConstrainedTemplate);
const mixedPortBoardTemplate: CatanBoardTemplate = {
  board: [
    [
      { type: "empty" },
      {
        type: "sea",
        fixed: true,
        port: { type: "brick", orientation: 300, fixed: true },
      },
      {
        type: "sea",
        fixed: true,
        port: { type: "ore", orientation: 240, fixed: true },
      },
      { type: "sea", fixed: true },
      { type: "sea", fixed: true, port: { type: "grain", orientation: 300 } },
      { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
      { type: "sea", fixed: true },
      {
        type: "sea",
        port: { type: "timber", orientation: 300, moveable: true },
      },
      { type: "sea", port: { type: "wool", orientation: 240, moveable: true } },
    ],
    [
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
    ],
    [
      { type: "sea", fixed: true, portsAllowed: false },
      { type: "sea", portsAllowed: false },
    ],
  ],
};
const mixedPortBoard = catanBoardFactory(mixedPortBoardTemplate);
const fishBoardTemplate: CatanBoardTemplate = {
  board: [
    [
      { type: "empty" },
      { type: "sea", fixed: true, fishTile: { number: 6, orientation: 120 } },
      { type: "sea", fixed: true },
      {
        type: "sea",
        fishTile: { number: 8, orientation: 120, moveable: true },
      },
      { type: "sea" },
      {
        type: "sea",
        fishTile: { number: 9, orientation: 120, moveable: true },
      },
      { type: "sea" },
      { type: "sea", fixed: true, fishTile: { number: 5, orientation: 120 } },
      { type: "sea", fixed: true, fishTile: { number: 4, orientation: 120 } },
    ],
    [
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
      { type: "desert", fixed: true },
    ],
    [
      { type: "empty" },
      { type: "sea", fixed: true },
      { type: "sea", fixed: true },
      {
        type: "sea",
        fishTile: { number: 10, orientation: 300, moveable: true },
      },
      { type: "sea" },
      { type: "sea" },
      { type: "sea" },
      { type: "sea" },
      { type: "sea", fixed: true },
    ],
  ],
};
const fishBoard = catanBoardFactory(fishBoardTemplate);
const multiNumberTemplate: CatanBoardTemplate = {
  board: [
    [
      { type: "empty" },
      { type: "mountains", number: 3, secondNumber: 10 },
      { type: "hills", number: 5 },
    ],
    [
      { type: "pasture", number: 12, secondNumber: 4 },
      { type: "fields", number: 2 },
      { type: "mountains", number: 8 },
    ],
    [
      { type: "empty" },
      { type: "hills", number: 6 },
      { type: "forest", number: 9 },
    ],
  ],
};
const multiNumberBoard = catanBoardFactory(multiNumberTemplate);
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
          for (const neighbor of Object.values(board.neighbors[j]).map(
            (n) => hexes[n]
          )) {
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
          for (const neighbor of Object.values(board.neighbors[j]).map(
            (n) => hexes[n]
          )) {
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
          for (const neighbor of Object.values(board.neighbors[j]).map(
            (n) => hexes[n]
          )) {
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
          for (const neighbor of Object.values(board.neighbors[j]).map(
            (n) => hexes[n]
          )) {
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
          for (const neighbor of Object.values(board.neighbors[j]).map(
            (n) => hexes[n]
          )) {
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
          for (const neighbor of Object.values(board.neighbors[j]).map(
            (n) => hexes[n]
          )) {
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
        for (const neighbor of Object.values(board.neighbors[j])) {
          expect(hex.type).not.toEqual(hexes[neighbor].type);
        }
      }
    }
  });

  it("should allow connected same type hexes when not constrained", () => {
    const likeTerrainOkay: NumericConstraints = {
      ...numericConstraints,
      maxConnectedLikeTerrain: { value: 7, valid: true, active: true },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, likeTerrainOkay);
      for (const [j, hex] of hexes.entries()) {
        if (hex.type === "sea") continue;
        for (const neighbor of Object.values(board.neighbors[j])) {
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
        for (const pipCount of getIntersectionPipCounts({
          board,
          hexes,
          atIndex: j,
        })) {
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
      maxIntersectionPipCount: { value: 15, valid: true, active: true },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, noBinaryConstraints, noPipCountRestriction);
      for (let j = 0; j < hexes.length; j++) {
        for (const pipCount of getIntersectionPipCounts({
          board,
          hexes,
          atIndex: j,
        })) {
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
      maxConnectedLikeTerrain: { value: 7, valid: true, active: true },
    };
    const minPipsOnHexTypes: { [type in HexType]?: number } =
      pipConstrainedBoard.minPipsOnHexTypes || {};
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        pipConstrainedBoard,
        binaryConstraints,
        groupedTerrainOkay
      );
      for (let j = 0; j < hexes.length; j++) {
        expect(hexes[j].number).toBeGreaterThanOrEqual(
          minPipsOnHexTypes![hexes[j].type] || 1
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
      maxConnectedLikeTerrain: { value: 7, valid: true, active: true },
    };
    const maxPipsOnHexTypes: { [type in HexType]?: number } =
      pipConstrainedBoard.maxPipsOnHexTypes || {};
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        pipConstrainedBoard,
        binaryConstraints,
        groupedTerrainOkay
      );
      for (let j = 0; j < hexes.length; j++) {
        const pipCount = numberToPipCount(hexes[j].number!);
        expect(pipCount).toBeLessThanOrEqual(
          pipConstrainedTemplate.board[0][j].maxPipsOnChit || 5
        );
        expect(pipCount).toBeLessThanOrEqual(
          maxPipsOnHexTypes![hexes[j].type] || 5
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
    // samples than the other tests to ensure success. we stop as soon as we
    // succeed, so this can be a large number without making the test overlong
    // every time
    for (let i = 0; i < numSamples * 20; i++) {
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
    const template: CatanBoardTemplate = {
      board: [
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
      ],
    };
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

  it("should shuffle number groups separately but terrain all together", () => {
    // The terrain on this board must be shuffled every time in order to meet
    // the maxConnectedLikeTerrain constraint
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture", number: 10, numberGroup: 1 }],
        [{ type: "pasture", number: 11, numberGroup: 1 }],
        [{ type: "empty" }, { type: "pasture", number: 12, numberGroup: 1 }],
        [{ type: "hills", number: 2, numberGroup: 2 }],
        [{ type: "empty" }, { type: "hills", number: 3, numberGroup: 2 }],
        [{ type: "hills", number: 4, numberGroup: 2 }],
      ],
    };
    const board = catanBoardFactory(template);
    const startingNumbers = board.recommendedLayout.map((h) => h.number!);
    let numbersWereShuffled = false;
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      expect(
        hexes
          .slice(0, 3)
          .map((h) => [10, 11, 12].includes(h.number!))
          .every((v) => v)
      ).toBe(true);
      expect(
        hexes
          .slice(3, -1)
          .map((h) => [2, 3, 4].includes(h.number!))
          .every((v) => v)
      ).toBe(true);
      if (hexes.map((h, i) => h.number! !== startingNumbers[i]))
        numbersWereShuffled = true;
      expect(
        hexes.slice(0, 3).some((h) => h.type === "hills") &&
          hexes.slice(3, -1).some((h) => h.type === "pasture")
      ).toBe(true);
    }
    expect(numbersWereShuffled).toBe(true);
  });

  it("shouldn't allow group and numberGroup to be used on the same board", () => {
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture", number: 10, numberGroup: 1 }],
        [{ type: "pasture", number: 11, group: 2 }],
      ],
    };
    expect(() => catanBoardFactory(template)).toThrowError(BoardSpecError);
  });

  it("shouldn't allow hexes without numbers to be free when numberGroup is used", () => {
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture", number: 10, numberGroup: 1 }],
        [{ type: "desert" }],
      ],
    };
    expect(() => catanBoardFactory(template)).toThrowError(BoardSpecError);
  });

  it("should throw a ShufflingError when the board is over-constrained", () => {
    const template: CatanBoardTemplate = {
      board: [
        [
          { type: "fields", number: 5 },
          { type: "fields", number: 4 },
        ],
        [{ type: "empty" }, { type: "fields", number: 6 }],
      ],
    };
    const board = catanBoardFactory(template);

    expect(() =>
      shuffle(board, binaryConstraints, numericConstraints)
    ).toThrowError(TerrainShufflingError);
    expect(() =>
      shuffle(board, binaryConstraints, {
        ...numericConstraints,
        maxConnectedLikeTerrain: { value: 7, valid: true, active: true },
      })
    ).toThrowError(NumberShufflingError);
  });

  it("shouldn't shuffle numbers in groups in which they are fixed", () => {
    const groupToFix = 2;
    const template: CatanBoardTemplate = {
      board: [
        [
          { type: "fields", number: 5, group: groupToFix },
          { type: "forest", number: 3 },
          { type: "hills", number: 6, group: groupToFix },
          { type: "mountains", number: 9 },
        ],
      ],
      fixNumbersInGroups: [groupToFix],
    };
    const board = catanBoardFactory(template);
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (let i = 0; i < hexes.length; i++) {
        if (hexes[i].group !== groupToFix) continue;
        expect(hexes[i].number).toEqual(template.board[0][i].number);
      }
    }
  });

  it("shouldn't shuffle anything when 'all' is specified", () => {
    const template: CatanBoardTemplate = {
      board: [
        [
          { type: "fields", number: 5 },
          { type: "forest", number: 3 },
          { type: "hills", number: 6 },
          { type: "mountains", number: 9 },
        ],
      ],
      fixNumbersInGroups: ["all"],
    };
    const board = catanBoardFactory(template);
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (let i = 0; i < hexes.length; i++) {
        expect(hexes[i].number).toEqual(template.board[0][i].number);
      }
    }
  });

  it("should shuffle unfixed number groups", () => {
    const groupToFix = 2;
    const template: CatanBoardTemplate = {
      board: [
        [
          { type: "fields", number: 5, group: groupToFix },
          { type: "forest", number: 3 },
          { type: "hills", number: 6, group: groupToFix },
          { type: "mountains", number: 9 },
        ],
      ],
      fixNumbersInGroups: [groupToFix],
    };
    const board = catanBoardFactory(template);
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      for (let i = 0; i < hexes.length; i++) {
        if (
          hexes[i].group !== groupToFix &&
          hexes[i].number !== template.board[0][i].number
        )
          return;
      }
    }
    expect(false).toBe(true);
  });

  it("should not shuffle fixed ports", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        mixedPortBoard,
        binaryConstraints,
        numericConstraints
      );
      for (const [i, shuffledHex] of hexes.entries()) {
        const origHex = mixedPortBoard.recommendedLayout[i];
        if (origHex.port?.fixed) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(shuffledHex.port).toBeDefined();
          const origPort = origHex.port!,
            shuffledPort = shuffledHex.port!;
          // eslint-disable-next-line jest/no-conditional-expect
          expect(origPort.type).toEqual(shuffledPort.type);
          // eslint-disable-next-line jest/no-conditional-expect
          expect(origPort.orientation).toEqual(shuffledPort.orientation);
        }
      }
    }
  });

  it(
    "should shuffle non-fixed ports on fixed hexes without" +
      " changing their position or orientation",
    () => {
      let numDifferent = 0;
      for (let i = 0; i < numSamples; i++) {
        const hexes = shuffle(
          mixedPortBoard,
          binaryConstraints,
          numericConstraints
        );
        for (const [i, shuffledHex] of hexes.entries()) {
          const origHex = mixedPortBoard.recommendedLayout[i];
          if (origHex.fixed && origHex.port && !origHex.port.fixed) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(shuffledHex.port).toBeDefined();
            const origPort = mixedPortBoard.recommendedLayout[i].port!,
              shuffledPort = shuffledHex.port!;
            if (origPort.type !== shuffledPort.type) numDifferent++;
            // eslint-disable-next-line jest/no-conditional-expect
            expect(origPort.orientation).toEqual(shuffledPort.orientation);
          }
        }
      }
      expect(numDifferent).toBeGreaterThan(0);
    }
  );

  it("should not shuffle ports onto hexes marked portsAllowed: false", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        mixedPortBoard,
        binaryConstraints,
        numericConstraints
      );
      for (const [i, shuffledHex] of hexes.entries()) {
        const origHex = mixedPortBoard.recommendedLayout[i];
        // the fixed case
        if (origHex.fixed) {
          if (origHex.portsAllowed === false)
            // eslint-disable-next-line jest/no-conditional-expect
            expect(shuffledHex.port).toBeUndefined();
        }
        // the unfixed case. really, this is the only case that matters.
        // portsAllowed is a property of hexes, so it should move or not move
        // with them. on the other hand, it's kind of weird to be specifying
        // that a moveable hex doesn't allow ports, so best to check both cases
        // in case the machinery changes somehow in the future
        else if (shuffledHex.portsAllowed === false) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(shuffledHex.port).toBeUndefined();
        }
      }
    }
  });

  it("should not shuffle ports onto hexes containing unmoveable fish tiles", () => {
    const fishAndPortzTemplate: CatanBoardTemplate = {
      board: [
        [
          { type: "empty" },
          {
            type: "sea",
            fixed: true,
            fishTile: { number: 6, orientation: 120 },
          },
          { type: "sea", fixed: true },
          { type: "sea", fixed: true, port: { type: "3:1", orientation: 300 } },
        ],
        [
          { type: "mountains", fixed: true },
          { type: "mountains", fixed: true },
          { type: "mountains", fixed: true },
          { type: "mountains", fixed: true },
        ],
      ],
    };
    const fishAndPortz = catanBoardFactory(fishAndPortzTemplate);
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        fishAndPortz,
        binaryConstraints,
        numericConstraints
      );
      expect(hexes[0].fishTile).toBeDefined();
      expect(hexes[0].port).toBeUndefined();
    }
  });

  it("should be able to shuffle ports onto hexes with moveable fish tiles", () => {
    const fishAndPortzTemplate: CatanBoardTemplate = {
      board: [
        [
          { type: "empty" },
          {
            type: "sea",
            fixed: true,
            fishTile: { number: 6, orientation: 120, moveable: true },
          },
          { type: "sea", fixed: true },
          { type: "sea", fixed: true, port: { type: "3:1", orientation: 300 } },
        ],
        [
          { type: "mountains", fixed: true },
          { type: "mountains", fixed: true },
          { type: "mountains", fixed: true },
          { type: "mountains", fixed: true },
        ],
      ],
    };
    const fishAndPortz = catanBoardFactory(fishAndPortzTemplate);
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        fishAndPortz,
        binaryConstraints,
        numericConstraints
      );
      if (hexes[0].port) return;
    }
  });

  it("should shuffle non-fixed ports originating on non-fixed hexes freely", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        mixedPortBoard,
        binaryConstraints,
        numericConstraints
      );
      for (const [i, shuffledHex] of hexes.entries()) {
        if (shuffledHex.port && !mixedPortBoard.recommendedLayout[i].port) {
          return;
        }
      }
    }
    expect(true).toBe(false);
  });

  it("should fail to shuffle ports on a crowded board", () => {
    const badTemplate: CatanBoardTemplate = {
      board: [
        [
          {
            type: "sea",
            port: { type: "ore", orientation: 240, moveable: true },
          },
          {
            type: "sea",
            port: { type: "brick", orientation: 300, moveable: true },
          },
        ],
        [{ type: "empty" }, { type: "desert", fixed: true }],
      ],
    };
    const badBoard = catanBoardFactory(badTemplate);
    expect(() =>
      shuffle(badBoard, binaryConstraints, numericConstraints)
    ).toThrowError(PortShufflingError);
  });

  it(
    "should shuffle fish tiles on fixed hexes without" +
      " changing their position or orientation",
    () => {
      let numDifferent = 0;
      for (let i = 0; i < numSamples; i++) {
        const hexes = shuffle(fishBoard, binaryConstraints, numericConstraints);
        for (const [i, shuffledHex] of hexes.entries()) {
          const origHex = fishBoard.recommendedLayout[i];
          if (origHex.fixed && origHex.fishTile) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(shuffledHex.fishTile).toBeDefined();
            const origTile = fishBoard.recommendedLayout[i].fishTile!,
              shuffledTile = shuffledHex.fishTile!;
            if (origTile.number !== shuffledTile.number) numDifferent++;
            // eslint-disable-next-line jest/no-conditional-expect
            expect(origTile.orientation).toEqual(shuffledTile.orientation);
          }
        }
      }
      expect(numDifferent).toBeGreaterThan(0);
    }
  );

  it("should shuffle fish tiles originating on non-fixed hexes freely", () => {
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(fishBoard, binaryConstraints, numericConstraints);
      for (const [i, shuffledHex] of hexes.entries()) {
        if (shuffledHex.fishTile && !fishBoard.recommendedLayout[i].fishTile) {
          return;
        }
      }
    }
    expect(true).toBe(false);
  });

  it("should fail to shuffle fish tiles on a crowded board", () => {
    const badTemplate: CatanBoardTemplate = {
      board: [
        [
          { type: "empty" },
          {
            type: "sea",
            fishTile: { number: 6, orientation: 120, moveable: true },
          },
          {
            type: "sea",
            fishTile: { number: 6, orientation: 120, moveable: true },
          },
        ],
        [
          { type: "desert", fixed: true },
          { type: "desert", fixed: true },
          { type: "desert", fixed: true },
        ],
      ],
    };
    const badBoard = catanBoardFactory(badTemplate);
    expect(() =>
      shuffle(badBoard, binaryConstraints, numericConstraints)
    ).toThrowError(FishShufflingError);

    // For good measure, orient the tiles in a different way and check again
    const badTemplate2: CatanBoardTemplate = {
      board: [
        [
          { type: "desert", fixed: true },
          { type: "desert", fixed: true },
          { type: "desert", fixed: true },
        ],
        [
          { type: "empty" },
          {
            type: "sea",
            fishTile: { number: 6, orientation: 300, moveable: true },
          },
          {
            type: "sea",
            fishTile: { number: 6, orientation: 300, moveable: true },
          },
        ],
      ],
    };
    const badBoard2 = catanBoardFactory(badTemplate2);
    expect(() =>
      shuffle(badBoard2, binaryConstraints, numericConstraints)
    ).toThrowError(FishShufflingError);
  });

  it("should fail to shuffle fish tiles when there is not any suitable coastline", () => {
    const badTemplate: CatanBoardTemplate = {
      board: [
        [
          {
            type: "sea",
            fishTile: { number: 6, orientation: 120, moveable: true },
          },
        ],
        [{ type: "empty" }, { type: "desert", fixed: true }],
      ],
    };
    const badBoard = catanBoardFactory(badTemplate);
    expect(() =>
      shuffle(badBoard, binaryConstraints, numericConstraints)
    ).toThrowError(FishShufflingError);
  });

  it("should obey the minIslandCount constraint when active", () => {
    const minIslands = 6;
    const active: NumericConstraints = {
      ...numericConstraints,
      minIslandCount: {
        value: minIslands,
        valid: true,
        active: true,
      },
    };
    const board = EXPANSIONS.get("New World")!;
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, active);
      expect(countIslands(hexes, board)).toBeGreaterThanOrEqual(minIslands);
    }
  });

  it("should ignore the minIslandCount constraint when inactive", () => {
    const minIslands = 6;
    const active: NumericConstraints = {
      ...numericConstraints,
      minIslandCount: {
        value: minIslands,
        valid: true,
        active: false,
      },
    };
    // we don't need to sample this repeatedly. we know that the base Catan
    // board can never have more than one island. the point of this test is to
    // make sure that shuffling completes. if it didn't, an
    // IslandShufflingError would be thrown and the test would fail
    const hexes = shuffle(board, binaryConstraints, active);
    expect(countIslands(hexes, board)).toBe(1);
  });

  it("should fail to shuffle when minIslandCount is infeasible", () => {
    const minIslands = 6;
    const active: NumericConstraints = {
      ...numericConstraints,
      minIslandCount: {
        value: minIslands,
        valid: true,
        active: true,
      },
    };
    expect(() => shuffle(board, binaryConstraints, active)).toThrowError(
      TerrainShufflingError
    );
  });

  it("shouldn't separate paired number chits during shuffling", () => {
    // See multiNumberTemplate. This is index by the number property to value
    // of the secondNumber property
    const firstToSecondNumber = [
      null,
      null,
      undefined,
      10,
      null,
      undefined,
      undefined,
      null,
      undefined,
      undefined,
      null,
      null,
      4,
    ];
    const localNumericConstraints = {
      ...numericConstraints,
      maxIntersectionPipCount: {
        ...numericConstraints.maxIntersectionPipCount,
        value: 15,
      },
    };
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(
        multiNumberBoard,
        binaryConstraints,
        localNumericConstraints
      );
      for (const hex of hexes) {
        expect(firstToSecondNumber[hex.number!]).toBe(hex.secondNumber);
      }
    }
  });

  it("should not shuffle inlandOnly hexes onto the coastline", () => {
    const board = EXPANSIONS.get("The Fishermen of Catan")!;
    // Rather than paste in the shuffling logic that checks this, we can
    // instead check the all the coastal and inland indices and assert that
    // they do not and do contain the lake, respectively
    const coastalIndices = [5, 6, 7, 10, 13, 16, 20, 23, 26, 29, 30, 31];
    const inlandIndices = [11, 12, 17, 18, 19, 24, 25];
    for (let i = 0; i < numSamples; i++) {
      const hexes = shuffle(board, binaryConstraints, numericConstraints);
      expect(
        coastalIndices
          .map((i) => hexes[i].type !== "lake")
          .reduce((acc, n) => acc && n)
      ).toBe(true);
      expect(
        inlandIndices
          .map((i) => hexes[i].type === "lake")
          .reduce((acc, n) => acc || n)
      ).toBe(true);
    }
  });

  it("should fail to shuffle inlandOnly hexes only islands with only coastline", () => {
    const template: CatanBoardTemplate = {
      board: [
        [
          { type: "empty" },
          { type: "sea", fixed: true },
          { type: "sea", fixed: true },
          { type: "sea", fixed: true },
          { type: "sea", fixed: true },
        ],
        [
          { type: "sea", fixed: true },
          { type: "mountains", number: 8 },
          { type: "pasture", number: 3 },
          { type: "lake", inlandOnly: true },
          { type: "sea", fixed: true },
        ],
        [
          { type: "empty" },
          { type: "sea", fixed: true },
          { type: "hills", number: 4 },
          { type: "fields", number: 11 },
          { type: "sea", fixed: true },
        ],
        [
          { type: "empty" },
          { type: "empty" },
          { type: "sea", fixed: true },
          { type: "sea", fixed: true },
        ],
      ],
    };
    const board = catanBoardFactory(template);
    expect(() =>
      shuffle(board, binaryConstraints, numericConstraints)
    ).toThrowError(TerrainShufflingError);
  });

  it("should spin the oasis to all valid orientations", () => {
    const template: CatanBoardTemplate = {
      board: [[{ type: "oasis", spinFreely: true }]],
    };
    const board = catanBoardFactory(template);
    const seen = {
      0: false,
      60: false,
      120: false,
      180: false,
      240: false,
      300: false,
    };
    for (let i = 0; i < numSamples; i++) {
      seen[
        shuffle(board, binaryConstraints, numericConstraints)[0].orientation!
      ] = true;
    }
    expect(Object.values(seen).reduce((acc, v) => acc && v)).toBe(true);
  });

  it("shouldn't spin hexes for which spinFreely is not specified", () => {
    const template: CatanBoardTemplate = {
      board: [[{ type: "mountains" }]],
    };
    const board = catanBoardFactory(template);
    for (let i = 0; i < numSamples; i++) {
      expect(
        shuffle(board, binaryConstraints, numericConstraints)[0].orientation
      ).toBeUndefined();
    }
  });
});

const pipCountingTemplate: CatanBoardTemplate = {
  board: [
    [
      { type: "empty" },
      { type: "mountains", number: 6, group: 2 },
      { type: "mountains", number: 4 },
    ],
    [
      { type: "mountains", number: 2 },
      { type: "mountains", number: 3 },
      { type: "mountains", number: 8 },
    ],
    [
      { type: "empty" },
      { type: "mountains", number: 12 },
      { type: "mountains", number: 10 },
    ],
  ],
  fixNumbersInGroups: [2],
};
describe("getIntersectionPipCount", () => {
  it("should correctly report the pip counts of all surrounding intersections", () => {
    const board = catanBoardFactory(pipCountingTemplate);
    for (const [atIndex, expected] of [
      [0, [6, 8, 8, 10]],
      [3, [4, 6, 8, 10, 10, 10]],
    ] as const) {
      const pipCounts = getIntersectionPipCounts({
        board,
        hexes: board.recommendedLayout,
        atIndex,
        onlyHigher: false,
      }).sort((a, b) => a - b);
      expect(pipCounts).toEqual(expected);
    }
  });

  it("should correctly report the pip counts of intersections including multiple chits per hex", () => {
    for (const [atIndex, expected] of [
      [0, [10, 10, 9, 9]],
      [3, [10, 10, 10, 10, 10, 10]],
    ] as const) {
      const pipCounts = getIntersectionPipCounts({
        board: multiNumberBoard,
        hexes: multiNumberBoard.recommendedLayout,
        atIndex,
        onlyHigher: false,
      });
      expect(pipCounts).toEqual(expected);
    }
  });

  it("should ignore intersections involving indices lower than the one being checked", () => {
    const board = catanBoardFactory(pipCountingTemplate);
    for (const [atIndex, expected] of [
      [4, [8]],
      [5, [4]],
    ] as const) {
      const pipCounts = getIntersectionPipCounts({
        board,
        hexes: board.recommendedLayout,
        atIndex,
      }).sort((a, b) => a - b);
      expect(pipCounts).toEqual(expected);
    }
  });
  it(
    "should consider intersections involving indices lower than the one being" +
      " checked when they include fixed hexes",
    () => {
      const board = catanBoardFactory(pipCountingTemplate);
      for (const [atIndex, expected] of [
        [2, [2, 4, 6, 8]],
        [1, [8, 8, 10, 10]],
      ] as const) {
        const pipCounts = getIntersectionPipCounts({
          board,
          hexes: board.recommendedLayout,
          atIndex,
        }).sort((a, b) => a - b);
        expect(pipCounts).toEqual(expected);
      }
    }
  );
});

describe("getValidPortOrientations", () => {
  it("should not allow multiple docks to point at the same intersection", () => {
    const template: CatanBoardTemplate = {
      board: [
        [
          {
            type: "sea",
            port: { type: "ore", orientation: 240, moveable: true },
          },
          // this is the one we're testing. getValidPortOrientations expects
          // there to *not* be a port at the location being tested, because that
          // would indicate that it had already been assigned a port and
          // therefore that there aren't any valid orientations on that hex
          { type: "sea" },
          { type: "desert", fixed: true },
        ],
        [
          { type: "empty" },
          { type: "desert", fixed: true },
          { type: "desert", fixed: true },
        ],
      ],
    };
    const board = catanBoardFactory(template);
    // sw (300) should not be present in the results
    expect(getValidPortOrientations(1, board.recommendedLayout, board)).toEqual(
      [180, 240]
    );
  });
});

describe("getValidFishTileOrientations", () => {
  it("should not find any valid orientations when none exist", () => {
    const template: CatanBoardTemplate = {
      board: [[{ type: "empty" }, { type: "pasture" }], [{ type: "sea" }]],
    };
    const board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(1, board.recommendedLayout, board)
    ).toEqual([]);
    expect(
      getValidFishTileOrientations(0, board.recommendedLayout, board)
    ).toEqual([]);
  });

  it("should find one valid orientation when one exists", () => {
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture" }],
        [{ type: "sea" }, { type: "pasture" }],
      ],
    };
    const board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(1, board.recommendedLayout, board)
    ).toEqual([0]);
  });

  it("should find many valid orientations when many exist", () => {
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture" }, { type: "pasture" }],
        [{ type: "pasture" }, { type: "sea" }, { type: "pasture" }],
        [{ type: "empty" }, { type: "pasture" }, { type: "pasture" }],
      ],
    };
    const board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(3, board.recommendedLayout, board).sort(
        (a, b) => a - b
      )
    ).toEqual([0, 60, 120, 180, 240, 300]);
  });

  it("should allow placement next to a port", () => {
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture" }],
        [{ type: "sea" }, { type: "pasture" }],
        [
          { type: "empty" },
          {
            type: "sea",
            port: { type: "3:1", orientation: 120, moveable: true },
          },
          { type: "pasture" },
        ],
      ],
    };
    const board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(1, board.recommendedLayout, board)
    ).toEqual([0]);
  });

  it("should not allow placement next to another fish tile", () => {
    const template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture" }],
        [{ type: "sea" }, { type: "pasture" }],
        [
          { type: "empty" },
          {
            type: "sea",
            fishTile: { number: 6, orientation: 0, moveable: true },
          },
          { type: "pasture" },
        ],
      ],
    };
    const board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(1, board.recommendedLayout, board)
    ).toEqual([]);
  });

  it("should not allow placement on the same hex as a port or another fish tile", () => {
    let template: CatanBoardTemplate = {
      board: [
        [{ type: "empty" }, { type: "pasture" }, { type: "pasture" }],
        [
          { type: "pasture" },
          {
            type: "sea",
            port: { type: "3:1", orientation: 0, moveable: true },
          },
          { type: "pasture" },
        ],
        [{ type: "empty" }, { type: "pasture" }, { type: "pasture" }],
      ],
    };
    let board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(3, board.recommendedLayout, board)
    ).toEqual([]);

    delete template.board[1][1].port;
    template.board[1][1].fishTile = {
      number: 6,
      orientation: 0,
      moveable: true,
    };
    board = catanBoardFactory(template);
    expect(
      getValidFishTileOrientations(3, board.recommendedLayout, board)
    ).toEqual([]);
  });
});

describe("countIslands", () => {
  it("should count one island for basic Catan", () => {
    const catan = EXPANSIONS.get("Catan")!;
    expect(countIslands(catan.recommendedLayout, catan)).toEqual(1);
  });

  it("should count four islands for Four Islands", () => {
    const fourIslands = EXPANSIONS.get("The Four Islands 4-Player Set-up")!;
    expect(countIslands(fourIslands.recommendedLayout, fourIslands)).toEqual(4);
  });
});
