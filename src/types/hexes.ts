type HexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "desert"
  | "sea"
  | "goldHorizontal"
  | "goldVertical";

type NumberChitValue = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;

type PortType = "3:1" | "ore" | "wool" | "timber" | "brick" | "grain";
type PortOrientation = 0 | 60 | 120 | 180 | 240 | 300;
type Port = {
  type: PortType;
  /** Measured in degrees from west-facing */
  orientation: PortOrientation;
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
