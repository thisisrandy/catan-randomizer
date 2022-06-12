type HexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "desert";

type Hex = {
  type: HexType;
  /**
   * The number chit assigned to this hex. Note that 0 represents the desert
   */
  number: 0 | 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;
  /**
   * If this hex cannot be moved, e.g. as is true of the center-left pasture hex
   * on the Explorers & Pirates map, it can be marked as such using this
   * property
   */
  fixed?: boolean;
};

export type { HexType, Hex };
