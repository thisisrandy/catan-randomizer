import { StrictUnion } from "./StrictUnion";

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
  /** Ports can be fixed in some scenarios. Use this property to indicate that
   * this port should not be shuffled. Note that fixed ports may not appear on
   * non-fixed hexes. The type system allows such a board to be specified, but
   * there is a runtime check in place that will abort board creation when the
   * board template is processed */
  fixed?: boolean;
};

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
};

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
      type: Exclude<NonResourceProducingHexType, ["sea", "lake"]>;
    }
> & {
  /**
   * If this hex cannot be moved, e.g. as is true of the center-left pasture hex
   * on the Explorers & Pirates map, it can be marked as such using this
   * property
   */
  // FIXME: this was originally introduced to account for the fixed Explorer's
  // & Pirates hex, but over the course of development, its meaning got a
  // little bit muddled vis-a-vis ports. specifically, a fixed hex which
  // includes a port in a given orientation in the recommended layout is
  // required to always include a port, though not necessarily the same port,
  // in the same orientation in the shuffled output. however, fixed hexes which
  // don't have a port in the recommended layout may be later assigned a free
  // port during shuffling. the practical consequence of this is that boards
  // with free ports have to cram them all onto non-fixed hexes in the
  // recommended layout so that they get shuffled instead of being stuck on a
  // fixed hex. ideally, theses concepts should be more decoupled. I'll
  // probably never get around to this since it hasn't blocked anything, but
  // it's worth noting nonetheless
  fixed?: boolean;
  /**
   * Some setups, e.g. Seafarers scenarios, specify multiple groups of
   * terrain/chits to shuffle. Hexes belonging to anything other than the "main"
   * group (which is just the one group which hasn't been explicitly labeled),
   * should specify their group number here
   */
  group?: number;
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
