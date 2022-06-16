import { ExpansionName } from "./boards";
import { Hex } from "./hexes";

/**
 * The information needed to restore a board from storage along with some
 * metadata
 */
export interface SavedBoard {
  expansion: ExpansionName;
  hexes: Hex[];
  date: Date;
}

/** The container object for all saved boards */
export interface SavedBoards {
  [key: string]: SavedBoard;
}
