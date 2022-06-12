type HexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "desert"
  | "sea";

type NumberChitValue = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;

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
};

type HexTemplateType = HexType | "empty";
type HexTemplate = Omit<Hex, "type"> & { type: HexTemplateType };

export type { HexType, Hex, NumberChitValue, HexTemplate };
