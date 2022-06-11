import { CatanBoard, ExpansionName, Expansions } from "../types/boards";

/** Hex height, in pixels */
export const HEX_HEIGHT = 215;
/** Hex width, in pixels */
export const HEX_WIDTH = 187;
const SIDE_LENGTH = 107;
const TRIANGLE_ALTITUDE = (HEX_HEIGHT - SIDE_LENGTH) / 2;
/**
 * If we split each hex into a top triangle, a middle rectangle, and a bottom
 * triangle, the ratio of of the height of one of the triangles to that of the
 * rectangle, in pixels, is 54/107. This number will be helpful when
 * constructing grid templates
 */
const SMALL_ROW_SIZE = TRIANGLE_ALTITUDE / SIDE_LENGTH;

// TODO: add seafarers and anything else that makes sense
// this won't be properly type checked if we feed it directly to the Map
// constructor. see https://github.com/microsoft/TypeScript/issues/49500
const expansions: [ExpansionName, CatanBoard][] = [
  [
    "Catan",
    {
      recommendedLayout: [
        { type: "mountains", number: 10 },
        { type: "pasture", number: 2 },
        { type: "forest", number: 9 },
        { type: "fields", number: 12 },
        { type: "hills", number: 6 },
        { type: "pasture", number: 4 },
        { type: "hills", number: 10 },
        { type: "fields", number: 9 },
        { type: "forest", number: 11 },
        { type: "desert", number: 0 },
        { type: "forest", number: 3 },
        { type: "mountains", number: 8 },
        { type: "forest", number: 8 },
        { type: "mountains", number: 3 },
        { type: "fields", number: 4 },
        { type: "pasture", number: 5 },
        { type: "hills", number: 5 },
        { type: "fields", number: 6 },
        { type: "pasture", number: 11 },
      ],
      neighbors: [
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
      ],
      cssGridTemplateColumns: "repeat(10, 1fr)",
      cssGridTemplateRows: `${SMALL_ROW_SIZE}fr 1fr `
        .repeat(5)
        .concat(`${SMALL_ROW_SIZE}fr`),
      cssGridAreas: [
        "1 / 3 / 4 / 5",
        "1 / 5 / 4 / 7",
        "1 / 7 / 4 / 9",
        "3 / 2 / 6 / 4",
        "3 / 4 / 6 / 6",
        "3 / 6 / 6 / 8",
        "3 / 8 / 6 / 10",
        "5 / 1 / 8 / 3",
        "5 / 3 / 8 / 5",
        "5 / 5 / 8 / 7",
        "5 / 7 / 8 / 9",
        "5 / 9 / 8 / 11",
        "7 / 2 / 10 / 4",
        "7 / 4 / 10 / 6",
        "7 / 6 / 10 / 8",
        "7 / 8 / 10 / 10",
        "9 / 3 / 12 / 5",
        "9 / 5 / 12 / 7",
        "9 / 7 / 12 / 9",
      ],
      boardHeightPercentage: `${
        ((TRIANGLE_ALTITUDE + (HEX_HEIGHT - TRIANGLE_ALTITUDE) * 5) /
          (HEX_WIDTH * 5)) *
        100
      }%`,
    },
  ],
  [
    "Catan: 5-6 Player Extension",
    {
      recommendedLayout: [
        { type: "forest", number: 4 },
        { type: "pasture", number: 5 },
        { type: "fields", number: 2 },
        { type: "hills", number: 6 },
        { type: "mountains", number: 11 },
        { type: "hills", number: 10 },
        { type: "pasture", number: 8 },
        { type: "desert", number: 0 },
        { type: "forest", number: 12 },
        { type: "fields", number: 12 },
        { type: "forest", number: 9 },
        { type: "fields", number: 4 },
        { type: "fields", number: 3 },
        { type: "forest", number: 10 },
        { type: "mountains", number: 3 },
        { type: "hills", number: 6 },
        { type: "hills", number: 5 },
        { type: "forest", number: 8 },
        { type: "pasture", number: 9 },
        { type: "mountains", number: 5 },
        { type: "fields", number: 2 },
        { type: "desert", number: 0 },
        { type: "pasture", number: 3 },
        { type: "hills", number: 8 },
        { type: "pasture", number: 4 },
        { type: "pasture", number: 9 },
        { type: "mountains", number: 6 },
        { type: "mountains", number: 11 },
        { type: "fields", number: 11 },
        { type: "forest", number: 10 },
      ],
      neighbors: [
        [1, 3, 4],
        [0, 2, 4, 5],
        [1, 5, 6],
        [0, 4, 7, 8],
        [0, 1, 3, 5, 8, 9], // 4
        [1, 2, 4, 6, 9, 10],
        [2, 5, 10, 11],
        [3, 8, 12, 13],
        [3, 4, 7, 9, 13, 14], // 8
        [4, 5, 8, 10, 14, 15],
        [5, 6, 9, 11, 15, 16],
        [6, 10, 16, 17],
        [7, 13, 18], // 12
        [7, 8, 12, 14, 18, 19],
        [8, 9, 13, 15, 19, 20],
        [9, 10, 14, 16, 20, 21],
        [10, 11, 15, 17, 21, 22], // 16
        [11, 16, 22],
        [12, 13, 19, 23],
        [13, 14, 18, 20, 23, 24],
        [14, 15, 19, 21, 24, 25], // 20
        [15, 16, 20, 22, 25, 26],
        [17, 17, 21, 26],
        [18, 19, 24, 27],
        [19, 20, 23, 25, 27, 28], // 24
        [20, 21, 24, 26, 28, 29],
        [21, 22, 25, 29],
        [23, 24, 28],
        [24, 25, 27, 29], // 28
        [25, 26, 28],
      ],
      cssGridTemplateColumns: "repeat(12, 1fr)",
      cssGridTemplateRows: `${SMALL_ROW_SIZE}fr 1fr `
        .repeat(7)
        .concat(`${SMALL_ROW_SIZE}fr`),
      cssGridAreas: [
        "1 / 4 / 4 / 6",
        "1 / 6 / 4 / 8",
        "1 / 8 / 4 / 10",
        "3 / 3 / 6 / 5",
        "3 / 5 / 6 / 7",
        "3 / 7 / 6 / 9",
        "3 / 9 / 6 / 11",
        "5 / 2 / 8 / 4",
        "5 / 4 / 8 / 6",
        "5 / 6 / 8 / 8",
        "5 / 8 / 8 / 10",
        "5 / 10 / 8 / 12",
        "7 / 1 / 10 / 3",
        "7 / 3 / 10 / 5",
        "7 / 5 / 10 / 7",
        "7 / 7 / 10 / 9",
        "7 / 9 / 10 / 11",
        "7 / 11 / 10 / 13",
        "9 / 2 / 12 / 4",
        "9 / 4 / 12 / 6",
        "9 / 6 / 12 / 8",
        "9 / 8 / 12 / 10",
        "9 / 10 / 12 / 12",
        "11 / 3 / 14 / 5",
        "11 / 5 / 14 / 7",
        "11 / 7 / 14 / 9",
        "11 / 9 / 14 / 11",
        "13 / 4 / 16 / 6",
        "13 / 6 / 16 / 8",
        "13 / 8 / 16 / 10",
      ],
      boardWidthPercentage: `${
        ((HEX_WIDTH * 6) /
          (TRIANGLE_ALTITUDE + (HEX_HEIGHT - TRIANGLE_ALTITUDE) * 7)) *
        100
      }%`,
    },
  ],
  [
    "Explorers & Pirates",
    {
      recommendedLayout: [
        { type: "mountains", number: 11 },
        { type: "forest", number: 9 },
        { type: "fields", number: 3 },
        { type: "pasture", number: 8 },
        { type: "hills", number: 4 },
        { type: "pasture", number: 10 },
        { type: "pasture", number: 6, fixed: true },
        { type: "mountains", number: 12 },
        { type: "forest", number: 8 },
        { type: "fields", number: 10 },
        { type: "pasture", number: 4 },
        { type: "forest", number: 11 },
        { type: "hills", number: 6 },
        { type: "mountains", number: 3 },
        { type: "forest", number: 5 },
      ],
      neighbors: [
        [1, 2, 3],
        [0, 3],
        [0, 3, 4, 5],
        [0, 1, 2, 5],
        [2, 5, 6, 7],
        [2, 3, 4, 7, 8],
        [4, 7, 9],
        [4, 5, 6, 8, 9, 10],
        [5, 7, 10],
        [6, 7, 10, 11],
        [7, 8, 9, 11, 12],
        [9, 10, 12, 13],
        [10, 11, 13, 14],
        [11, 12, 14],
        [12, 13],
      ],
      cssGridTemplateColumns: "repeat(7, 1fr)",
      cssGridTemplateRows: `${SMALL_ROW_SIZE}fr 1fr `
        .repeat(7)
        .concat(`${SMALL_ROW_SIZE}fr`),
      cssGridAreas: [
        "1 / 4 / 4 / 6",
        "1 / 6 / 4 / 8",
        "3 / 3 / 6 / 5",
        "3 / 5 / 6 / 7",
        "5 / 2 / 8 / 4",
        "5 / 4 / 8 / 6",
        "7 / 1 / 10 / 3",
        "7 / 3 / 10 / 5",
        "7 / 5 / 10 / 7",
        "9 / 2 / 12 / 4",
        "9 / 4 / 12 / 6",
        "11 / 3 / 14 / 5",
        "11 / 5 / 14 / 7",
        "13 / 4 / 16 / 6",
        "13 / 6 / 16 / 8",
      ],
      boardWidthPercentage: `${
        ((HEX_WIDTH * 3.5) /
          (TRIANGLE_ALTITUDE + (HEX_HEIGHT - TRIANGLE_ALTITUDE) * 7)) *
        100
      }%`,
    },
  ],
];
export const EXPANSIONS: Expansions = new Map(expansions);
