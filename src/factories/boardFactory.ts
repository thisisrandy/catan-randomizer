import {
  HEX_WIDTH,
  SIDE_LENGTH,
  TRIANGLE_ALTITUDE,
} from "../constants/imageProperties";
import { CatanBoard, CatanBoardTemplate } from "../types/boards";
import { Hex } from "../types/hexes";

/**
 * Given `template` compute all of the properties of a `CatanBoard` for use
 * elsewhere
 */
export default function catanBoardFactory(
  template: CatanBoardTemplate
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
  const smallRowSize = TRIANGLE_ALTITUDE / SIDE_LENGTH;
  const cssGridTemplateRows = `${smallRowSize}fr 1fr `
    .repeat(template.length)
    .concat(`${smallRowSize}fr`);

  // for rows, starting at one, we skip two grid rows for every hex row. row
  // span is 3.
  //
  // for columns, we count the number of leading empties and use that + 1 as our
  // start. once we've encountered a row with no empties (due to the way the
  // coordinate system is specified, this is the [weakly] most left-extending
  // row, and there can be no further empties once it is encountered), we start
  // tracking the offset from that row, which we add to start. column span is 2.
  //
  // it's useful to do this before setting the column template since we can
  // track the max column seen
  const cssGridAreas: string[] = [];
  let mostLeftExtendingRow,
    maxColumn = 0;
  for (let row = 0; row < template.length; row++) {
    const cssRow = 1 + row * 2;
    let cssCol = 1;
    if (typeof mostLeftExtendingRow !== "undefined")
      cssCol += row - mostLeftExtendingRow;
    for (let col = 0; col < template[row].length; col++) {
      if (template[row][col].type === "empty") {
        cssCol++;
        continue;
      }
      // we didn't find any leading empties, so, presuming the template was
      // correctly specified, this is by definition the most left-extending row
      if (cssCol === 1 && typeof mostLeftExtendingRow === "undefined")
        mostLeftExtendingRow = row;
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
    recommendedLayout: recommendedLayout,
    neighbors: neighbors,
    cssGridTemplateColumns: cssGridTemplateColumns,
    cssGridTemplateRows: cssGridTemplateRows,
    cssGridAreas: cssGridAreas,
    boardHeightPercentage: boardHeightPercentage,
    boardWidthPercentage: boardWidthPercentage,
  };
}
