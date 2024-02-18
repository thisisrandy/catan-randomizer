import { NumberChitValue, Hex, HexType } from "../types/hexes";

/**
 * Given a valid `NumberChitValue` `num`, return the number of pips that appear
 * on said chit. For example, if `num` is `6`, return `5`, and if `num` is `3`,
 * return `2`
 */
export function numberToPipCount(num: NumberChitValue): number {
  return 6 - Math.abs(7 - num);
}

/**
 * Return the number of pips that appear on `hex`, including the case where
 * `hex` has a second number chit on it. If `hex` contains no number chits,
 * return `0`
 */
export function hexToPipCount(hex: Hex): number {
  if (hex.number === undefined) return 0;
  let res = numberToPipCount(hex.number!);
  if (hex.secondNumber !== undefined)
    res += numberToPipCount(hex.secondNumber!);
  return res;
}

/**
 * Return `true` if `h1` and `h2` are the same terrain type and `false`
 * otherwise. With the introduction of river hexes and the oasis from Traders &
 * Barbarians, it is no longer sufficient to compare `Hex.type` directly
 */
export function compareHexType(h1: Hex, h2: Hex): boolean {
  const mapping: Partial<Record<HexType, HexType>> = {
    riverHills: "hills",
    riverMountains: "mountains",
    riverPasture: "pasture",
    oasis: "desert",
  };
  let [t1, t2] = [h1.type, h2.type];
  if (t1 in mapping) t1 = mapping[t1]!;
  if (t2 in mapping) t2 = mapping[t2]!;
  return t1 === t2;
}
