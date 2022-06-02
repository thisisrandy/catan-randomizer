export interface BinaryConstraints {
  noAdjacentSixEight: boolean;
  noAdjacentTwoTwelve: boolean;
  noAdjacentPairs: boolean;
}

export interface NumericConstraints {
  maxConnectedLikeTerrain: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  // interfaces with only one properties behave differently than those with
  // multiple properties. adding a dummy shores up some issues elsewhere. see
  // https://stackoverflow.com/q/72469427/12162258
  dummyValue?: never;
}

export type Constraints = BinaryConstraints | NumericConstraints;
