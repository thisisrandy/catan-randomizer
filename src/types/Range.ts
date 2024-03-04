type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

/**
 * Specify a range of numbers as a type. The first value is inclusive and the
 * second is exclusive. Copied shamelessly from
 * https://stackoverflow.com/a/70307091/12162258
 */
export type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;
