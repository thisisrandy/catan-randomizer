import { HexRecord } from "./hexes";

/**
 * All of the data about a Catan board, including the hexes and number chits
 * used as well as board shape and display styling. Note that by convention,
 * hexes are counted off left to right, top to bottom. For example, in the base
 * game, the following indices are used:
 *
 * ```
 *       0  1  2
 *      3  4  5  6
 *     7  8  9 10 11
 *      12 13 14 15
 *       16 17 18
 * ```
 */
export interface CatanBoard {
  /**
   * A `HexRecord` corresponding to the recommended board layout per the game
   * manual
   */
  recommendedLayout: HexRecord;
  /**
   * An array of the indices of neighboring hexes.
   */
  neighbors: number[][];
  /** The CSS
   * [grid-template-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
   * that will be used for the board grid
   */
  cssGridTemplateColumns: string;
  /** The CSS
   * [grid-template-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
   * that will be used for the board grid
   */
  cssGridTemplateRows: string;
  /**
   * An array of CSS
   * [grid-area](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)
   * strings
   */
  cssGridAreas: string[];
}

export type ExpansionName = "Catan" | "Explorers & Pirates";

/**
 * A map of expansion names to their board data
 */
export type Expansions = Map<ExpansionName, CatanBoard>;
