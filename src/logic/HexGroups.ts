import { CatanBoard } from "../types/boards";
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
 * 2. `"numbers"`: non-resource-producing hexes, i.e. `sea` and `desert` hexes,
 *    are removed. a number shuffling function should handle skipping these
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
          (_, i) => !["sea", "desert"].includes(hexes[i].type)
        );
        break;
      default:
        ((_: never): never => {
          throw new Error("never");
        })(shuffleType);
    }

    this.#internalIndex = this.sourceIndices.length - 1;
    if (this.#internalIndex < 0) {
      throw new Error(
        "Tried to make a HexGroup without any in-class hexes." +
          " The source board is probably ill-specified"
      );
    }
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
    return this.sourceIndices[--this.#internalIndex];
  }

  /**
   * Reset the internal indices. If shuffling needs to be restarted, use this
   * method first. Returns the new current index
   */
  reset(): number {
    return this.sourceIndices[
      (this.#internalIndex = this.sourceIndices.length - 1)
    ];
  }
}

/**
 * Abstracts the creation and management of a group of `HexGroup`s into a single
 * interface. See {@link HexGroup}
 */
export class HexGroups {
  #hexGroups: HexGroup[] = [];
  #currentHexGroup: number = 0;

  constructor(board: CatanBoard, shuffleType: ShuffleType) {
    const groupsAndIndices: [number | undefined, number][] =
      board.recommendedLayout.map((h, i) => [h.group, i]);
    const uniqueGroups = Array.from(
      new Set(board.recommendedLayout.map((h) => h.group)).values()
    );
    this.#hexGroups = uniqueGroups.map((groupId) => {
      const indices = groupsAndIndices
        .filter(([g]) => g === groupId)
        .map(([, i]) => i);
      return new HexGroup(
        indices.map((i) => board.recommendedLayout[i]),
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
