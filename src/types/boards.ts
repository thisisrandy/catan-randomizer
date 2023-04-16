import {
  Hex,
  HexTemplate,
  MaxPipsOnChit,
  ResourceProducingHexType,
} from "./hexes";

/**
 * A template to simplify the specification of a `CatanBoard`
 *
 */
export type CatanBoardTemplate = {
  /**
   * Board shape and initial layout. Each hex spans two CSS grid columns. A
   * special `HexTemplate` type `"empty"` is provided to specify *single* empty
   * columns. Thus, where `s` is sea and `t` is terrain, we can specify a board
   * that looks like this:
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
  board: HexTemplate[][];
  /**
   * See {@link UseHorizonalLayout}
   */
  horizontal?: UseHorizonalLayout;
  /**
   * See {@link MinPipsOnHexTypes}
   */
  minPipsOnHexTypes?: MinPipsOnHexTypes;
  /**
   * See {@link MaxPipsOnHexTypes}
   */
  maxPipsOnHexTypes?: MaxPipsOnHexTypes;
  /**
   * See {@link FixNumbersInGroup}
   */
  fixNumbersInGroups?: FixNumbersInGroup[];
};

/**
 * If true, number chits are rotated -90°, then the entire board 90°. As such, a
 * horizontal board must be specified top to bottom (cols) right to left (rows)
 * instead of the usual left to right (cols) top to bottom (rows). Useful e.g.
 * for Seafarers
 */
export type UseHorizonalLayout = boolean;

/**
 * The minimum number of pips which must appear on chits assigned to specified
 * hex types after shuffling. This is to be used when the instructions specify
 * e.g. to "make sure forest terrains and pasture terrains don't get number
 * tokens that are too unfavorable".
 */
export type MinPipsOnHexTypes = {
  [type in ResourceProducingHexType]?: 2 | 3 | 4 | 5;
};

/**
 * The maxiumum number of pips which may appear on chits assigned to specified
 * hex types after shuffling. This is to be used when the instructions specify
 * e.g. to "not place... 6s & 8s... on gold fields".
 */
export type MaxPipsOnHexTypes = {
  [type in ResourceProducingHexType]?: 1 | 2 | 3 | 4;
};

/**
 * The number chits assigned to the hexes in the specified group(s) should not
 * be shuffled. The Seafarers: The Pirate Islands scenario, for example,
 * specifies that no number chits should be shuffled, and The Wonders of Catan
 * scenario only allows shuffling on the main island. Several notes:
 *
 * 1. The default group (see {@link Hex[group]}) when none is specified is
 *    `undefined`, so in order to indicate the default group specifically, one
 *    must specify `undefined`. However, when the meaning is "fix all groups",
 *    the alias `"all"` is also provided.
 * 2. Fixing only some numbers within groups is more complicated due to
 *    the way shuffling proceeds and is not currently supported. In practice,
 *    numbers can always be fixed by creating a new group, but the case of
 *    fixing *some* numbers but allowing *all* terrain to be freely shuffled is
 *    not supported (no known scenario follows this pattern).
 * 3. If this is used for a group where any non-resource-producing hexes are
 *    not fixed, a number may end up on e.g. the desert, which is obviously
 *    not desirable. Correct board specification is not rigorously checked and
 *    left instead to the programmer.
 */
export type FixNumbersInGroup = number | undefined | "all";
/**
 * The explicit version of {@link FixNumbersInGroup} used on {@link CatanBoard}
 */
export type FixNumbersInGroupStrict = Exclude<FixNumbersInGroup, "all">;

/**
 * Container for explicit storage of neighboring hex indices along with their
 * spatial relation to the current hex. Directions are w.r.t. the vertical
 * specification of a board. See {@link UseHorizonalLayout}
 */
export type Neighbors = Partial<
  Record<"nw" | "ne" | "e" | "se" | "sw" | "w", number>
>;

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
   * An array of `Neighbors` for each hex. See {@link Neighbors}
   */
  neighbors: Neighbors[];
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
   * See {@link UseHorizonalLayout}
   */
  horizontal?: UseHorizonalLayout;
  /**
   * See {@link MinPipsOnHexTypes}
   */
  minPipsOnHexTypes?: MinPipsOnHexTypes;
  /**
   * See {@link MaxPipsOnHexTypes}
   */
  maxPipsOnHexTypes?: MaxPipsOnHexTypes;
  /**
   * See {@link MaxPipsOnChit}
   */
  maxPipsOnChits: MaxPipsOnChit[];
  /**
   * See {@link FixNumbersInGroupStrict}
   */
  fixNumbersInGroups?: FixNumbersInGroupStrict[];
}

export type ExpansionName =
  | "Catan"
  | "Catan: 5-6 Player Extension"
  | "Explorers & Pirates"
  | "Cities & Knights"
  | "Explorers & Pirates + Cities & Knights"
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
  | "Seafarers: The Pirate Islands (Shuffled)"
  | "Seafarers: The Wonders of Catan"
  | "Seafarers: New World"
  | "Seafarers: New World Expanded"
  | "Seafarers: New World Islands"
  | "Everything, Everywhere, All at Once"
  | "Seafarers & Pirates";

/**
 * A map of expansion names to their board data. Meant to be the top-level
 * container for board definitions. `Map`s maintain the type of their keys in
 * typescript (as oppposed to `Object`s, which coerce property names to `string`
 * when asked e.g. for `Object.keys(...)`), so they're just a little nicer to
 * use in the particular way we use `Expansions`
 */
export type Expansions = Map<ExpansionName, CatanBoard>;
