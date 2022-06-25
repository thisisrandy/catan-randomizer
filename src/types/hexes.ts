type HexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "desert"
  | "sea"
  | "gold";

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

type Hex = {
  type: HexType;
  /**
   * The number chit assigned to this hex, if any
   */
  number?: NumberChitValue;
  /**
   * If this hex cannot be moved, e.g. as is true of the center-left pasture hex
   * on the Explorers & Pirates map, it can be marked as such using this
   * property
   */
  fixed?: boolean;
  /**
   * If this is a sea hex, it can contain a `Port`
   */
  port?: Port;
  /**
   * Some setups, e.g. Seafarers scenarios, specify multiple groups of
   * terrain/chits to shuffle. Hexes belonging to anything other than the "main"
   * group (which is just the one group which hasn't been explicitly labeled),
   * should specify their group number here
   */
  group?: number;
  /**
   * The maximum number of pips which may appear on this number chit after
   * shuffling. Initial values are not checked for sanity. This is to be used
   * when the instructions specify e.g. to "make sure the 3 terrain hexes at the
   * bottom of the main island don't receiver numbers that are too favorable".
   * During shuffling, this value is *fixed* to its initial position on the
   * board.
   */
  maxPipsOnChit?: 1 | 2 | 3 | 4;
};

type HexTemplateType = HexType | "empty";
type HexTemplate = Omit<Hex, "type"> & { type: HexTemplateType };

export type {
  HexType,
  Hex,
  NumberChitValue,
  PortType,
  PortOrientation,
  Port,
  HexTemplate,
};
