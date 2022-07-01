type UnionKeys<T> = T extends unknown ? keyof T : never;

type InvalidKeys<K extends string | number | symbol> = { [P in K]?: never };
type StrictUnionHelper<T, TAll> = T extends unknown
  ? T & InvalidKeys<Exclude<UnionKeys<TAll>, keyof T>>
  : never;

/**
 * When unions overlap, they don't perform excess property checking. This is a
 * clever solution for force checking found [on
 * github](https://github.com/microsoft/TypeScript/issues/20863#issuecomment-520551758)
 */
export type StrictUnion<T> = StrictUnionHelper<T, T>;
