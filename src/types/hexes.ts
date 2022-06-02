type HexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "desert";

type HexRecord = {
  type: HexType;
  /**
   * The number chit assigned to this hex. Note that 0 represents the desert
   */
  number: 0 | 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12;
}[];

export type { HexType, HexRecord };
