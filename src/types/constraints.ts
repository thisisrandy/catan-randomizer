export interface BinaryConstraints {
  noAdjacentSixEight: boolean;
  noAdjacentTwoTwelve: boolean;
  noAdjacentPairs: boolean;
}

interface NumericConstraint {
  // NOTE: while each individual constraint has a finite range of values, these
  // are specified by the user at runtime, so it isn't useful to encode them in
  // the type
  value: number;
  valid: boolean;
  active: boolean;
}

export interface NumericConstraints {
  maxConnectedLikeTerrain: NumericConstraint;
  maxIntersectionPipCount: NumericConstraint;
  minIslandCount: NumericConstraint;
}

export type Constraints = BinaryConstraints | NumericConstraints;
