import {
  HEX_HEIGHT,
  HEX_WIDTH,
  TRIANGLE_ALTITUDE,
  TRIANGLE_TO_SIDE_RATIO,
} from "../constants/imageProperties";
import catanBoardFactory from "../factories/boardFactory";
import { CatanBoard, CatanBoardTemplate } from "../types/boards";

describe("boardFactory", () => {
  it("should generate the correct Catan board from a template", () => {
    const template: CatanBoardTemplate = [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 300 } },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "mountains", number: 10 },
        { type: "pasture", number: 2 },
        { type: "forest", number: 9 },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 300 } },
      ],
      [
        { type: "empty" },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 180 },
        },
        { type: "fields", number: 12 },
        { type: "hills", number: 6 },
        { type: "pasture", number: 4 },
        { type: "hills", number: 10 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "fields", number: 9 },
        { type: "forest", number: 11 },
        { type: "desert" },
        { type: "forest", number: 3 },
        { type: "mountains", number: 8 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
      ],
      [
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "brick", orientation: 180 } },
        { type: "forest", number: 8 },
        { type: "mountains", number: 3 },
        { type: "fields", number: 4 },
        { type: "pasture", number: 5 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "hills", number: 5 },
        { type: "fields", number: 6 },
        { type: "pasture", number: 11 },
        { type: "sea", fixed: true, port: { type: "wool", orientation: 60 } },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 60 } },
        { type: "sea", fixed: true },
      ],
    ];

    const expected: CatanBoard = {
      recommendedLayout: [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 300 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "mountains", number: 10 },
        { type: "pasture", number: 2 },
        { type: "forest", number: 9 },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 300 } },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 180 },
        },
        { type: "fields", number: 12 },
        { type: "hills", number: 6 },
        { type: "pasture", number: 4 },
        { type: "hills", number: 10 },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "fields", number: 9 },
        { type: "forest", number: 11 },
        { type: "desert" },
        { type: "forest", number: 3 },
        { type: "mountains", number: 8 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
        { type: "sea", fixed: true, port: { type: "brick", orientation: 180 } },
        { type: "forest", number: 8 },
        { type: "mountains", number: 3 },
        { type: "fields", number: 4 },
        { type: "pasture", number: 5 },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "hills", number: 5 },
        { type: "fields", number: 6 },
        { type: "pasture", number: 11 },
        { type: "sea", fixed: true, port: { type: "wool", orientation: 60 } },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 60 } },
        { type: "sea", fixed: true },
      ],
      neighbors: [
        [1, 5, 4],
        [2, 6, 5, 0],
        [3, 7, 6, 1],
        [8, 7, 2],
        [0, 5, 10, 9],
        [0, 1, 6, 11, 10, 4],
        [1, 2, 7, 12, 11, 5],
        [2, 3, 8, 13, 12, 6],
        [3, 14, 13, 7],
        [4, 10, 16, 15],
        [4, 5, 11, 17, 16, 9],
        [5, 6, 12, 18, 17, 10],
        [6, 7, 13, 19, 18, 11],
        [7, 8, 14, 20, 19, 12],
        [8, 21, 20, 13],
        [9, 16, 22],
        [9, 10, 17, 23, 22, 15],
        [10, 11, 18, 24, 23, 16],
        [11, 12, 19, 25, 24, 17],
        [12, 13, 20, 26, 25, 18],
        [13, 14, 21, 27, 26, 19],
        [14, 27, 20],
        [15, 16, 23, 28],
        [16, 17, 24, 29, 28, 22],
        [17, 18, 25, 30, 29, 23],
        [18, 19, 26, 31, 30, 24],
        [19, 20, 27, 32, 31, 25],
        [20, 21, 32, 26],
        [22, 23, 29, 33],
        [23, 24, 30, 34, 33, 28],
        [24, 25, 31, 35, 34, 29],
        [25, 26, 32, 36, 35, 30],
        [26, 27, 36, 31],
        [28, 29, 34],
        [29, 30, 35, 33],
        [30, 31, 36, 34],
        [31, 32, 35],
      ].map((row) => row.sort()),
      cssGridTemplateColumns: "repeat(14, 1fr)",
      cssGridTemplateRows: `${TRIANGLE_TO_SIDE_RATIO}fr 1fr `
        .repeat(7)
        .concat(`${TRIANGLE_TO_SIDE_RATIO}fr`),
      cssGridAreas: [
        "1 / 4 / 4 / 6",
        "1 / 6 / 4 / 8",
        "1 / 8 / 4 / 10",
        "1 / 10 / 4 / 12",
        "3 / 3 / 6 / 5",
        "3 / 5 / 6 / 7",
        "3 / 7 / 6 / 9",
        "3 / 9 / 6 / 11",
        "3 / 11 / 6 / 13",
        "5 / 2 / 8 / 4",
        "5 / 4 / 8 / 6",
        "5 / 6 / 8 / 8",
        "5 / 8 / 8 / 10",
        "5 / 10 / 8 / 12",
        "5 / 12 / 8 / 14",
        "7 / 1 / 10 / 3",
        "7 / 3 / 10 / 5",
        "7 / 5 / 10 / 7",
        "7 / 7 / 10 / 9",
        "7 / 9 / 10 / 11",
        "7 / 11 / 10 / 13",
        "7 / 13 / 10 / 15",
        "9 / 2 / 12 / 4",
        "9 / 4 / 12 / 6",
        "9 / 6 / 12 / 8",
        "9 / 8 / 12 / 10",
        "9 / 10 / 12 / 12",
        "9 / 12 / 12 / 14",
        "11 / 3 / 14 / 5",
        "11 / 5 / 14 / 7",
        "11 / 7 / 14 / 9",
        "11 / 9 / 14 / 11",
        "11 / 11 / 14 / 13",
        "13 / 4 / 16 / 6",
        "13 / 6 / 16 / 8",
        "13 / 8 / 16 / 10",
        "13 / 10 / 16 / 12",
      ],
      boardHeightPercentage: `${
        ((TRIANGLE_ALTITUDE + (HEX_HEIGHT - TRIANGLE_ALTITUDE) * 7) /
          (HEX_WIDTH * 7)) *
        100
      }%`,
      boardWidthPercentage: undefined,
      horizontal: undefined,
    };

    const generated = catanBoardFactory(template);
    generated.neighbors.forEach((row) => row.sort());
    expect(generated).toEqual(expected);
  });
});
