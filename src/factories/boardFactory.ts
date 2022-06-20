import {
  HEX_WIDTH,
  SIDE_LENGTH,
  TRIANGLE_ALTITUDE,
  TRIANGLE_TO_SIDE_RATIO,
} from "../constants/imageProperties";
import {
  CatanBoard,
  CatanBoardTemplate,
  UseHorizonalLayout,
} from "../types/boards";
import { Hex } from "../types/hexes";

/**
 * Given `template` and optionally `horizontal`, compute all of the properties
 * of a `CatanBoard` for use elsewhere
 */
export default function catanBoardFactory(
  template: CatanBoardTemplate,
  horizontal?: UseHorizonalLayout
): CatanBoard {
  // generating recommendedLayout is as simple as filtering out empties and
  // casting the templates to Hex
  const recommendedLayout = template
    .flat()
    .filter((ht) => ht.type !== "empty")
    .map((ht) => ht as Hex);

  // for neighbors, we need to know the template's correspondence to CatanBoard
  // indices
  const indices: (number | undefined)[][] = [];
  let i = 0;
  for (let row = 0; row < template.length; row++) {
    indices.push([]);
    for (let col = 0; col < template[row].length; col++) {
      indices[row].push(template[row][col].type === "empty" ? undefined : i++);
    }
  }
  // now, we can compute neighbors easily using the hex coordinate system
  // defined for CatanBoardTemplate
  const neighbors: number[][] = [];
  for (let row = 0; row < indices.length; row++) {
    for (let col = 0; col < indices[row].length; col++) {
      if (typeof indices[row][col] === "undefined") continue;

      neighbors.push([]);
      for (const [nrow, ncol] of [
        [row - 1, col],
        [row - 1, col + 1],
        [row, col + 1],
        [row + 1, col],
        [row + 1, col - 1],
        [row, col - 1],
      ]) {
        // NOTE: javascript will return undefined for out of bounds indices, so
        // we only need check up to the last level
        if (nrow < 0 || nrow === indices.length) continue;
        let neighbor = indices[nrow][ncol];
        if (typeof neighbor !== "undefined")
          neighbors[neighbors.length - 1].push(neighbor);
      }
    }
  }

  // a small and large row for each hex followed by a final small at the end
  const cssGridTemplateRows = `${TRIANGLE_TO_SIDE_RATIO}fr 1fr `
    .repeat(template.length)
    .concat(`${TRIANGLE_TO_SIDE_RATIO}fr`);

  // for rows, starting at one, we skip two grid rows for every hex row. row
  // span is 3.
  //
  // column span is 2, and empty span is 1. thus, starting at 1, we advance the
  // column by 2 for every hex encountered, and 1 for every empty value.
  //
  // it's useful to do this before setting the column template since we can
  // track the max column seen
  const cssGridAreas: string[] = [];
  let maxColumn = 0;
  for (let row = 0; row < template.length; row++) {
    const cssRow = 1 + row * 2;
    let cssCol = 1;
    for (let col = 0; col < template[row].length; col++) {
      if (template[row][col].type === "empty") {
        cssCol++;
        continue;
      }
      cssGridAreas.push(
        `${cssRow} / ${cssCol} / ${cssRow + 3} / ${cssCol + 2}`
      );
      cssCol += 2;
      // grid-(row|column)-end are exclusive, so subtract 1
      maxColumn = Math.max(maxColumn, cssCol - 1);
    }
  }

  // we computed the number of columns in the previous step, so specify that
  // many here
  const cssGridTemplateColumns = `repeat(${maxColumn}, 1fr)`;

  // finally, figure out if we need to adjust width or height by figuring out
  // which is greater and then assigning a lower percentage to the other
  let boardHeightPercentage, boardWidthPercentage;
  const width = (HEX_WIDTH * maxColumn) / 2;
  const height =
    TRIANGLE_ALTITUDE + (SIDE_LENGTH + TRIANGLE_ALTITUDE) * template.length;
  if (width > height) boardHeightPercentage = `${(height / width) * 100}%`;
  else if (height > width) boardWidthPercentage = `${(width / height) * 100}%`;

  return {
    recommendedLayout,
    neighbors,
    cssGridTemplateColumns,
    cssGridTemplateRows,
    cssGridAreas,
    boardHeightPercentage,
    boardWidthPercentage,
    horizontal,
  };
}
