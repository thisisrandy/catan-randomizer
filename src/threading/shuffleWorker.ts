/**
 * While board shuffling is generally quick, it is nonetheless blocking and as
 * such should be in a Web Worker. This script is that worker. Its benefits are
 * especially apparent when a board is over-constrained and the shuffler expends
 * a lot of effort retrying the shuffling process over and over again.
 */

import { shuffle, ShufflingError } from "../logic/shuffle";
import { CatanBoard } from "../types/boards";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import { Hex } from "../types/hexes";

export interface IncomingMessage {
  board: CatanBoard;
  binaryConstraints: BinaryConstraints;
  numericConstraints: NumericConstraints;
}
export type OutgoingMessage =
  | { messageType: "result"; payload: Hex[] }
  | { messageType: "error"; payload: string };

onmessage = (ev: MessageEvent<IncomingMessage>) => {
  const { board, binaryConstraints, numericConstraints } = ev.data;

  try {
    const message: OutgoingMessage = {
      messageType: "result",
      payload: shuffle(board, binaryConstraints, numericConstraints),
    };
    postMessage(message);
  } catch (error: unknown) {
    if (error instanceof ShufflingError) {
      const message: OutgoingMessage = {
        messageType: "error",
        payload: error.message,
      };
      postMessage(message);
    } else throw error;
  }
};
