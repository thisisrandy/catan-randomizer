import { NumberChitValue } from "../types/hexes";

/**
 * Given a valid `NumberChitValue` `num`, return the number of pips that appear
 * on said chit. For example, if `num` is `6`, return `5`, and if `num` is `3`,
 * return `2`
 */
export function numberToPipCount(num: NumberChitValue): number {
  return 6 - Math.abs(7 - num);
}
