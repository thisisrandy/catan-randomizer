export interface BinaryConstraints {
  noAdjacentSixEight: boolean;
  noAdjacentTwoTwelve: boolean;
  noAdjacentPairs: boolean;
}

// TODO: the value type constraints on the fields of this interface are mostly
// unused outside of testing. I also don't particularly like the repetition of
// internal fields. perhaps this type should be rethunk a bit?
export interface NumericConstraints {
  maxConnectedLikeTerrain: {
    value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    valid: boolean;
    active: boolean;
  };
  maxIntersectionPipCount: {
    value: 10 | 11 | 12 | 13 | 14 | 15;
    valid: boolean;
    active: boolean;
  };
  minIslandCount: {
    value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    valid: boolean;
    active: boolean;
  };
}

export type Constraints = BinaryConstraints | NumericConstraints;
