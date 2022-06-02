type HexType =
  | "mountains"
  | "pasture"
  | "forest"
  | "hills"
  | "fields"
  | "desert";

type HexRecord = { type: HexType; number: number | null }[];

export type { HexType, HexRecord };
