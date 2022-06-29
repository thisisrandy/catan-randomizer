import {
  HEX_WIDTH,
  SIDE_LENGTH,
  TRIANGLE_ALTITUDE,
  TRIANGLE_TO_SIDE_RATIO,
} from "../constants/imageProperties";
import {
  CatanBoard,
  CatanBoardTemplate,
  FixNumbersInGroupStrict,
} from "../types/boards";
import { Hex } from "../types/hexes";

/**
 * Given `template`, compute all of the properties of a `CatanBoard`
 */
export default function catanBoardFactory(
  template: CatanBoardTemplate
): CatanBoard {
  // flattening and filtering out empties will be useful for several operations
  const flatNoEmpties = template.board
    .flat()
    .filter((ht) => ht.type !== "empty");

  // first, pull maxPipsOnChits out into a separate array so the shuffling code
  // doesn't need to remember to fix it to hex positions
  const maxPipsOnChits = flatNoEmpties.map((ht) =>
    ht.maxPipsOnChit === undefined ? 5 : ht.maxPipsOnChit
  );

  // then, delete the maxPipsOnChit property from all templates. since we also
  // filtered empties, we can safely cast HexTemplate to Hex
  flatNoEmpties.forEach((ht) => delete ht.maxPipsOnChit);
  const recommendedLayout = flatNoEmpties.map((ht) => ht as Hex);

  // a small and large row for each hex followed by a final small at the end
  const cssGridTemplateRows = `${TRIANGLE_TO_SIDE_RATIO}fr 1fr `
    .repeat(template.board.length)
    .concat(`${TRIANGLE_TO_SIDE_RATIO}fr`);

  // for rows, starting at one, we skip two grid rows for every hex row. row
  // span is 3.
  //
  // column span is 2, and empty span is 1. thus, starting at 1, we advance the
  // column by 2 for every hex encountered, and 1 for every empty value.
  //
  // it's useful to do this before setting the column template since we can
  // track the max column seen. additionally, we can assemble a matrix of column
  // to CatanBoard indices for subsequent neighbor computation
  const boardIndices: (number | undefined)[][] = [];
  const cssGridAreas: string[] = [];
  let maxColumn = 0,
    boardIndex = 0;
  for (let row = 0; row < template.board.length; row++) {
    boardIndices.push([]);
    const cssRow = 1 + row * 2;
    let cssCol = 1;
    for (let col = 0; col < template.board[row].length; col++) {
      if (template.board[row][col].type === "empty") {
        cssCol++;
        boardIndices[boardIndices.length - 1].push(undefined);
        continue;
      }
      cssGridAreas.push(
        `${cssRow} / ${cssCol} / ${cssRow + 3} / ${cssCol + 2}`
      );
      cssCol += 2;
      // grid-(row|column)-end are exclusive, so subtract 1
      maxColumn = Math.max(maxColumn, cssCol - 1);
      boardIndices[boardIndices.length - 1].push(boardIndex);
      boardIndices[boardIndices.length - 1].push(boardIndex);
      boardIndex++;
    }
  }

  // we computed the number of columns in the previous step, so specify that
  // many here
  const cssGridTemplateColumns = `repeat(${maxColumn}, 1fr)`;

  // now use boardIndices (computed above) to determine neighbor indices
  const neighbors: number[][] = [];
  for (let row = 0; row < boardIndices.length; row++) {
    for (let col = 0; col < boardIndices[row].length; col++) {
      if (boardIndices[row][col] === undefined) continue;

      neighbors.push([]);
      for (const [nrow, ncol] of [
        [row, col - 1],
        [row - 1, col - 1],
        [row - 1, col + 1],
        [row, col + 2],
        [row + 1, col - 1],
        [row + 1, col + 1],
      ]) {
        // NOTE: javascript will return undefined for out of bounds indices, so
        // we only need check up to the last level
        if (nrow < 0 || nrow === boardIndices.length) continue;
        const neighbor = boardIndices[nrow][ncol];
        if (neighbor !== undefined)
          neighbors[neighbors.length - 1].push(neighbor);
      }

      // hex col span is 2, so skip the next column
      col++;
    }
  }

  // figure out if we need to adjust width or height by determining which is
  // greater and then assigning a lower percentage to the other
  let boardHeightPercentage, boardWidthPercentage;
  const width = (HEX_WIDTH * maxColumn) / 2;
  const height =
    TRIANGLE_ALTITUDE +
    (SIDE_LENGTH + TRIANGLE_ALTITUDE) * template.board.length;
  if (width > height) boardHeightPercentage = `${(height / width) * 100}%`;
  else if (height > width) boardWidthPercentage = `${(width / height) * 100}%`;

  // we also need to translate FixNumbersInGroup items into
  // FixNumbersInGroupStrict, which means interpreting "all"
  let fixNumbersInGroups: FixNumbersInGroupStrict[];
  if (template.fixNumbersInGroups?.includes("all")) {
    fixNumbersInGroups = Array.from(
      new Set(flatNoEmpties.map((ht) => ht.group)).values()
    );
  } else {
    fixNumbersInGroups =
      template.fixNumbersInGroups as FixNumbersInGroupStrict[];
  }

  return {
    recommendedLayout,
    neighbors,
    cssGridTemplateColumns,
    cssGridTemplateRows,
    cssGridAreas,
    boardHeightPercentage,
    boardWidthPercentage,
    horizontal: template.horizontal,
    minPipsOnHexTypes: template.minPipsOnHexTypes,
    maxPipsOnHexTypes: template.maxPipsOnHexTypes,
    maxPipsOnChits,
    fixNumbersInGroups,
  };
}
