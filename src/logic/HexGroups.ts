import { Hex } from "../types/hexes";

export type ShuffleType = "terrain" | "numbers";

/**
 * Manages the generation of random indices within a set of `Hex`es with the
 * same group value. Depending on the `ShuffleType` specified, one of two
 * classes of hexes are ignored and their management delegated to an external
 * shuffling function:
 *
 * 1. `"terrain"`: fixed hexes are removed. a terrain shuffling function should
 *    handle skipping fixed hexes on its own
 *
 * 2. `"numbers"`: non-resource-producing hexes are removed. a number shuffling
 *    function should handle skipping these
 */
class HexGroup {
  currentIndex: number;
  sourceIndices: number[];
  #internalIndex: number;

  constructor(hexes: Hex[], sourceIndices: number[], shuffleType: ShuffleType) {
    switch (shuffleType) {
      case "terrain":
        this.sourceIndices = sourceIndices.filter((_, i) => !hexes[i].fixed);
        break;
      case "numbers":
        this.sourceIndices = sourceIndices.filter(
          (_, i) => hexes[i].number !== undefined
        );
        break;
      default:
        ((_: never): never => {
          throw new Error("never");
        })(shuffleType);
    }

    this.#internalIndex = this.sourceIndices.length - 1;
    this.currentIndex = this.sourceIndices[this.#internalIndex];
  }

  /**
   * Get a random in-group index at or below `this.currentIndex`
   */
  getRandomIndex(): number {
    if (this.#internalIndex < 0)
      throw new Error("Tried to get random index from expended HexGroup");
    return this.sourceIndices[
      Math.floor(Math.random() * (this.#internalIndex + 1))
    ];
  }

  /**
   * Advance the current index, returning the new one, if any
   */
  advanceCurrentIndex(): number | undefined {
    return (this.currentIndex = this.sourceIndices[--this.#internalIndex]);
  }

  /**
   * Reset the internal indices. If shuffling needs to be restarted, use this
   * method first. Returns the new current index
   */
  reset(): number {
    return (this.currentIndex =
      this.sourceIndices[
        (this.#internalIndex = this.sourceIndices.length - 1)
      ]);
  }
}

/**
 * Abstracts the creation and management of a group of `HexGroup`s into a single
 * interface. See {@link HexGroup}.
 *
 * Assuming a shuffling function which iteratively shuffles until all local
 * constraints are met or allotted tries are exceeded, restarting from the top
 * in the latter case, usage is as follows:
 *
 * 1. At the beginning of the top-level loop, call `reset`
 * 2. When a random index is required, call `getRandomIndex`
 * 3. If the random index selected in (2) passes all constraint checks, call
 *    `advanceCurrentIndex` to update internal state
 */
export class HexGroups {
  #hexGroups: HexGroup[] = [];
  #currentHexGroup: number = 0;

  /**
   * Construct a new `HexGroups`. For `shuffleType`, see {@link HexGroup}.
   * `skipGroups` may be specified to indicate group IDs for which a `HexGroup`
   * should not be created, e.g. if that group is fixed for this `ShuffleType`
   */
  constructor(
    hexes: Hex[],
    shuffleType: ShuffleType,
    skipGroups?: (number | undefined)[]
  ) {
    const groupsAndIndices: [number | undefined, number][] = hexes.map(
      (h, i) => [h.group, i]
    );
    const uniqueGroups = Array.from(
      new Set(hexes.map((h) => h.group)).values()
    );
    this.#hexGroups = uniqueGroups
      .filter((groupId) => !(skipGroups && skipGroups.includes(groupId)))
      .map((groupId) => {
        const indices = groupsAndIndices
          .filter(([g]) => g === groupId)
          .map(([, i]) => i);
        return new HexGroup(
          indices.map((i) => hexes[i]),
          indices,
          shuffleType
        );
      });
    this.#setCurrentHexGroup();
  }

  /**
   * Get a random index to swap with the current index. Internally, this will
   * select from only those indices belonging to the same group as the current
   * index
   */
  getRandomIndex(): number {
    return this.#hexGroups[this.#currentHexGroup].getRandomIndex();
  }

  /**
   * Advance the current index. Internally, this moves the current index of the
   * current group and then changes the current group, if appropriate
   */
  advanceCurrentIndex(): void {
    this.#hexGroups[this.#currentHexGroup].advanceCurrentIndex();
    this.#setCurrentHexGroup();
  }

  /**
   * Resets the state of all internals. If shuffling needs to be restarted, use
   * this method first
   */
  reset(): void {
    this.#hexGroups.forEach((hg) => hg.reset());
    this.#setCurrentHexGroup();
  }

  /**
   * Find the hex group with the largest current index and set `#currentHexGroup`
   * to it
   */
  #setCurrentHexGroup(): void {
    let largest = -1;
    for (const [i, group] of this.#hexGroups.entries()) {
      if (group.currentIndex > largest) {
        largest = group.currentIndex;
        this.#currentHexGroup = i;
      }
    }
  }
}
