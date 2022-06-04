export interface BinaryConstraints {
  noAdjacentSixEight: boolean;
  noAdjacentTwoTwelve: boolean;
  noAdjacentPairs: boolean;
}

export interface NumericConstraints {
  maxConnectedLikeTerrain: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  maxIntersectionPipCount: 10 | 11 | 12 | 13 | 14 | 15;
}

export type Constraints = BinaryConstraints | NumericConstraints;
