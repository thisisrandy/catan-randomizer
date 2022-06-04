export interface BinaryConstraints {
  noAdjacentSixEight: boolean;
  noAdjacentTwoTwelve: boolean;
  noAdjacentPairs: boolean;
}

export interface NumericConstraints {
  maxConnectedLikeTerrain: {
    value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    valid: boolean;
  };
  maxIntersectionPipCount: {
    value: 10 | 11 | 12 | 13 | 14 | 15;
    valid: boolean;
  };
}

export type Constraints = BinaryConstraints | NumericConstraints;
