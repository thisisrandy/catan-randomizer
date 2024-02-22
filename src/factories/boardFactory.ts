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
  Neighbors,
} from "../types/boards";
import { Hex } from "../types/hexes";

export class BoardSpecError extends Error {}

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

  // before we start to assemble the board, do a few sanity checks on the
  // template. most everything else should be covered statically by the type
  // system
  flatNoEmpties.forEach((ht) => {
    if (!ht.fixed && ht.port?.fixed)
      throw new BoardSpecError(
        `Fixed ports can't appear on non-fixed hexes: ${ht}`
      );
  });
  if (template.fixNumbersInGroups) {
    const toCheck = template.fixNumbersInGroups.slice();
    if (toCheck.includes("all")) toCheck.splice(toCheck.indexOf("all"));
    for (const ht of flatNoEmpties) {
      if (!toCheck.length) break;
      if (toCheck.includes(ht.group)) toCheck.splice(toCheck.indexOf(ht.group));
    }
    if (toCheck.length) {
      throw new BoardSpecError(
        "The specified fixNumbersInGroups contains groups to which no hex" +
          ` belongs: ${toCheck}`
      );
    }
  }
  // numberGroup-related checks
  if (
    flatNoEmpties.some((h) => h.group !== undefined) &&
    flatNoEmpties.some((h) => h.numberGroup !== undefined)
  ) {
    throw new BoardSpecError(
      "Using group and numberGroup on the same board is not supported"
    );
  }
  if (
    flatNoEmpties.some((h) => h.numberGroup !== undefined) &&
    flatNoEmpties.some((h) => h.number === undefined && !h.fixed)
  ) {
    throw new BoardSpecError(
      "When using numberGroup, all hexes which don't include a number must be fixed"
    );
  }

  // we're ready to start assembling the board. first, pull maxPipsOnChits out
  // into a separate array so the shuffling code doesn't need to remember to fix
  // it to hex positions
  const maxPipsOnChits = flatNoEmpties.map((ht) =>
    ht.maxPipsOnChit === undefined ? 5 : ht.maxPipsOnChit
  );

  // then, delete the maxPipsOnChit property from all templates. since we also
  // filtered empties, we can safely cast HexTemplate to Hex
  flatNoEmpties.forEach((ht) => delete ht.maxPipsOnChit);
  const recommendedLayout = flatNoEmpties as Hex[];

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
  const neighbors: Neighbors[] = [];
  for (let row = 0; row < boardIndices.length; row++) {
    for (let col = 0; col < boardIndices[row].length; col++) {
      if (boardIndices[row][col] === undefined) continue;

      const myNeighbors: Neighbors = {};
      neighbors.push(myNeighbors);
      for (const [dir, [nrow, ncol]] of Object.entries({
        nw: [row - 1, col - 1],
        ne: [row - 1, col + 1],
        e: [row, col + 2],
        se: [row + 1, col + 1],
        sw: [row + 1, col - 1],
        w: [row, col - 1],
      })) {
        // NOTE: javascript will return undefined for out of bounds indices, so
        // we only need check up to the last level
        if (nrow < 0 || nrow === boardIndices.length) continue;
        const neighbor = boardIndices[nrow][ncol];
        if (neighbor !== undefined)
          myNeighbors[dir as keyof Neighbors] = neighbor;
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
