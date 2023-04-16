import { StrictUnion } from "./StrictUnion";

type ResourceProducingHexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "gold";
type NonResourceProducingHexType = "desert" | "sea" | "fog";
type HexType = ResourceProducingHexType | NonResourceProducingHexType;

type NumberChitValue = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;

type PortType = "3:1" | "ore" | "wool" | "timber" | "brick" | "grain";
type PortOrientation = 0 | 60 | 120 | 180 | 240 | 300;
type Port = {
  type: PortType;
  /** Measured in degrees from west-facing */
  orientation: PortOrientation;
  /** Ports can be fixed in some scenarios. Use this property to indicate that
   * this port should not be shuffled */
  fixed?: boolean;
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
      portsAllowed: false;
    }
  | {
      type: Exclude<NonResourceProducingHexType, "sea">;
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
  group?: number;
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
};
