import { StrictUnion } from "./StrictUnion";
import { Range } from "./Range";

type ResourceProducingHexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "gold"
  | "riverMountains"
  | "riverHills"
  | "riverPasture";
type NonResourceProducingHexType =
  | "desert"
  | "sea"
  | "fog"
  | "riverSwamplandTop"
  | "riverSwamplandBottom"
  | "lake"
  | "oasis"
  | "castleKnights"
  | "castleRestoration"
  | "quarry"
  | "glassworks";
type HexType = ResourceProducingHexType | NonResourceProducingHexType;

type NumberChitValue = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;

type Orientation = 0 | 60 | 120 | 180 | 240 | 300;

type PortType = "3:1" | "ore" | "wool" | "timber" | "brick" | "grain";
type PortOrientation = Orientation;
type Port = {
  type: PortType;
  /** Measured in degrees from west-facing */
  orientation: PortOrientation;
} & StrictUnion<
  | {
      /**
       * Ports can be fixed in some scenarios. Use this property to indicate that
       * this port should not be shuffled. Note that fixed ports may not appear on
       * non-fixed hexes. The type system allows such a board to be specified, but
       * there is a runtime check in place that will abort board creation when the
       * board template is processed
       */
      fixed?: boolean;
    }
  | {
      /**
       * Ports can be placed on any sea hex or border piece in some scenarios,
       * e.g. New World, provided both docks point at land and no two docks
       * point at the same intersection. Use this flag to indicate as much.
       * Note that non-moveable ports may not appear on non-fixed hexes. The
       * type system allows such a board to be specified, but there is a
       * runtime check in place that will abort board creation when the board
       * template is processed
       */
      moveable?: boolean;
    }
>;

type FishTileValue = 4 | 5 | 6 | 8 | 9 | 10;
/**
 * Where 0 means "covering the NE and E sides of the hex" and orientation is in
 * degrees clockwise from 0.
 *
 * Technically, we should probably say that fish tiles point at 30, 90, etc.
 * degrees, but it might be simpler to write the shuffling code if it's as
 * close as possible to the port shuffling code. Maybe revisit later if things
 * are different enough that port code can't be modularized and reused. Also
 * note that 0 is in degrees clockwise from west-facing for ports
 */
type FishTileOrientation = Orientation;
type FishTile = {
  number: FishTileValue;
  orientation: FishTileOrientation;
  /**
   * As with ports, fishing ground tiles may be placed on arbitrary sea hexes
   * or border pieces in some scenarios, provided conditions are met. Use this
   * flag to indicate as much. The same caveat as with ports about appearing
   * only on fixed hexes applies
   */
  moveable?: boolean;
};

/**
 * There's a problem with using `0` as a group number because some logic checks
 * its truthiness. We can avoid fixing this by restricting valid group numbers
 * to a small range
 */
type GroupNumber = Range<1, 20>;

/**
 * Container for hex information. In order to be able to inject additional
 * values into the union for {@link HexTemplate}, we make `Hex` generic as
 * discussed [here](https://stackoverflow.com/a/72822682/12162258). Because the
 * values injected there overlap with the values used in `Hex` (specifically, `{
 * type: ResourceProducingHexType, ... }` is reused), {@link StrictUnion} is
 * required to ensure that the type checking we want actually happens
 */
type Hex<T extends Record<string, unknown> = never> = StrictUnion<
  | T
  | {
      type: ResourceProducingHexType;
      /**
       * The number chit assigned to this hex, if any
       */
      number?: NumberChitValue;
      /**
       * Some scenarios, e.g. Traders & Barbarians Ultimate, need number chits
       * to be shuffled in separate groups, e.g. for the requirement that each
       * number appear exactly once on the coastline, but do not require that
       * terrain be shuffled separately. Use this property to create groups for
       * numbers only.
       *
       * There are two restrictions placed on boards that include hexes with
       * this property:
       *
       * 1. Only one of `group` and `numberGroup` may be used anywhere on the
       *    board. While there are valid boards that might use both, it isn't
       *    currently supported.
       * 2. The board must not contain any non-fixed hexes that don't have
       *    numbers. There are no valid boards that don't follow this
       *    constraint, because in order for number groups to make sense, each
       *    chit from each group must be able to be placed on one of the same
       *    spots from the group definition. If e.g. a desert gets moved from
       *    one group to another, there will be one fewer spot for number chits
       *    in the second group and one extra in the first, therefore we
       *    require that all hexes which don't have a number be fixed.
       *
       *  Both of these are runtime checks not required by the type system. The
       *  app will fail immediately if a bad board is specified.
       */
      numberGroup?: GroupNumber;
    }
  | {
      type: ResourceProducingHexType;
      /**
       * The number chit assigned to this hex
       */
      number: NumberChitValue;
      /**
       * The second number chit assigned to this hex, if any. E.g. some
       * scenarios specify that 2 & 12 should be combined on a single hex. This
       * number will always stay paired with the first number during shuffling.
       * IMPORTANT: This value is *not* currently used when checking adjacent
       * number constraints. It *is* used when checking all pip-based
       * constraints, where the combined pip value of the two numbers is used.
       * The assumption in play is that this is really only used to combine 2 &
       * 12, although general support is provided in terms of display and as
       * mentioned above.
       */
      secondNumber?: NumberChitValue;
      numberGroup?: GroupNumber;
    }
  | {
      type: "sea";
      /**
       * If this is a sea hex, it can contain a `Port`
       */
      port?: Port;
      /**
       * If specified, `portsAllowed` must be true for sea hexes which might
       * contain ports. However, there's no need to specify it explicitly in
       * this case
       */
      portsAllowed?: true;
    }
  | {
      type: "sea";
      /**
       * For sea hexes which may not contain ports, we can use this switch
       */
      // FIXME: this is a stopgap to account for the fact that port shuffling
      // (see getShuffledPorts) doesn't account for hex groups, which was never
      // required until the Everything, Everywhere, All at Once scenario was
      // introduced. it would reduce complexity to consider groups properly and
      // do away with this flag
      portsAllowed: false;
    }
  | {
      type: "sea";
      fishTile?: FishTile;
    }
  | {
      type: "lake";
      /**
       * If true, this hex is not allowed to appear adjacent to any sea hex. As
       * The Fishermen of Catan is the only known scenario which requires this,
       * only the lake currently supports this feature. That said, note that
       * there is nothing in the shuffling logic that imposes any such
       * restriction
       */
      inlandOnly: true;
    }
  | {
      type: Exclude<NonResourceProducingHexType, "sea" | "lake">;
    }
> & {
  /**
   * If this hex cannot be moved, e.g. as is true of the center-left pasture hex
   * on the Explorers & Pirates map, it can be marked as such using this
   * property
   */
  fixed?: boolean;
  /**
   * Some setups, e.g. Seafarers scenarios, specify multiple groups of
   * terrain/chits to shuffle. Hexes belonging to anything other than the "main"
   * group (which is just the one group which hasn't been explicitly labeled),
   * should specify their group number here
   */
  group?: GroupNumber;
  /**
   * Some hexes, namely the river hexes from The Rivers of Catan and the trade
   * hexes from Traders & Barbarians, are directional. The images for these
   * hexes are orientated in the same way those scenarios specify they ought to
   * be, but the Traders & Barbarians Ultimate scenario boards have them in
   * various other orientations. This display property provides the ability to
   * rotate hex images to the correct orientation for any scenario
   */
  orientation?: Orientation;
};

/**
 * The maximum number of pips which may appear on this number chit after
 * shuffling. 5 means "no restriction". This is to be used when the instructions
 * specify e.g. to "make sure the 3 terrain hexes at the bottom of the main
 * island don't receive numbers that are too favorable". During shuffling, this
 * value is *fixed* to its initial position on the board.
 */
type MaxPipsOnChit = 1 | 2 | 3 | 4 | 5;
type HexTemplate = StrictUnion<
  | Hex<{
      type: ResourceProducingHexType;
      number: NumberChitValue;
      /**
       * See {@link MaxPipsOnChit}
       */
      maxPipsOnChit: MaxPipsOnChit;
    }>
  | { type: "empty" }
>;

export type {
  ResourceProducingHexType,
  NonResourceProducingHexType,
  HexType,
  Hex,
  MaxPipsOnChit,
  NumberChitValue,
  PortType,
  PortOrientation,
  Port,
  HexTemplate,
  FishTileValue,
  FishTileOrientation,
  FishTile,
};
