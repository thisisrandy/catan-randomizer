import { NumberChitValue, Hex } from "../types/hexes";

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
