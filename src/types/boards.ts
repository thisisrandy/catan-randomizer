import { Hex, HexTemplate } from "./hexes";

/**
 * A template to simplify the specification of a `CatanBoard`.
 *
 * Imagine that we have a hex coordinate system that behaves as follows. If a
 * given hex has coordinates (r, c), its neighbors are:
 *
 * * NW: (r-1, c)
 * * NE: (r-1, c+1)
 * * E: (r, c+1)
 * * SE: (r+1, c)
 * * SW: (r+1, c-1)
 * * W: (r, c-1)
 *
 * In other words, the row axis is perpendicular to the E/W sides, and the
 * column axis to the NW/SE side.
 *
 * Using empty `HexTemplates` to fill out each row as needed, specify the
 * board here. For example, in the base game, the board would look as follows,
 * where t is terrain, s is sea, and e is empty:
 *
 * ```
 * e e e s s s s
 * e e s t t t s
 * e s t t t t s
 * s t t t t t s
 * s t t t t s
 * s t t t s
 * s s s s
 * ```
 *
 * where the actual spatial arrangement looks like
 *
 * ```
 *    s s s s
 *   s t t t s
 *  s t t t t s
 * s t t t t t s
 *  s t t t t s
 *   s t t t s
 *    s s s s
 * ```
 */
export type CatanBoardTemplate = HexTemplate[][];

export type UseHorizonalLayout = boolean;

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
   * An array of `Hex`s corresponding to the recommended board layout per the
   * game manual
   */
  recommendedLayout: Hex[];
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
  /**
   * If this board grid isn't square, a custom width percentage can be used to
   * fix the aspect ratio. Defaults to 100%
   */
  boardWidthPercentage?: string;
  /**
   * If this board grid isn't square, a custom height percentage can be used to
   * fix the aspect ratio. Defaults to 100%
   */
  boardHeightPercentage?: string;
  /**
   * If true, number chits are rotated -90°, then the entire board 90°. Useful e.g.
   * for Seafarers
   */
  horizontal?: UseHorizonalLayout;
}

export type ExpansionName =
  | "Catan"
  | "Catan: 5-6 Player Extension"
  | "Explorers & Pirates"
  | "Cities & Knights";

/**
 * A map of expansion names to their board data. Meant to be the top-level
 * container for board definitions
 */
export type Expansions = Map<ExpansionName, CatanBoard>;
