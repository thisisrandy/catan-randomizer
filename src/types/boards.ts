import { Hex, HexTemplate } from "./hexes";

/**
 * A template to simplify the specification of a `CatanBoard`.
 *
 * Each hex spans two CSS grid columns. A special `HexTemplate` type `"empty"`
 * is provided to specify *single* empty columns. Thus, where `s` is sea and `t`
 * is terrain, we can specify a board that looks like this:
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
 *
 * as follows, where `e` is `"empty"`:
 *
 * ```
 * e e e s s s s
 * e e s t t t s
 * e s t t t t s
 * s t t t t t s
 * e s t t t t s
 * e e s t t t s
 * e e e s s s s
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
  | "Cities & Knights"
  | "Seafarers: Heading for New Shores 3-Player Set-up"
  | "Seafarers: Heading for New Shores 4-Player Set-up"
  | "Seafarers: The Four Islands 3-Player Set-up"
  | "Seafarers: The Four Islands 4-Player Set-up"
  | "Seafarers: The Fog Islands 3-Player Set-up"
  | "Seafarers: The Fog Islands 4-Player Set-up"
  | "Seafarers: Through the Desert 3-Player Set-up"
  | "Seafarers: Through the Desert 4-Player Set-up"
  | "Seafarers: The Forgotten Tribe"
  | "Seafarers: Cloth for Catan"
  | "Seafarers: The Pirate Islands"
  | "Seafarers: The Wonders of Catan"
  | "Seafarers: New World";

/**
 * A map of expansion names to their board data. Meant to be the top-level
 * container for board definitions
 */
export type Expansions = Map<ExpansionName, CatanBoard>;
