import { Expansions } from "../types/boards";

/**
 * If we split each hex into a top triangle, a middle rectangle, and a bottom
 * triangle, this weird number is the ratio of of the height of one of the
 * triangles to that of the rectangle. more or less. It will be helpful when
 * constructing grid templates
 */
const SMALL_ROW_SIZE = 5 / 11;

export const EXPANSIONS: Expansions = new Map([
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
    },
  ],
]);
