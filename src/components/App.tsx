import "../css/app.css";
import { useState } from "react";
import { HexRecord } from "../types/hexes";
import Board from "./Board";
import Randomizer from "./Randomizer";
import { EXPANSIONS } from "../data/expansions";

const board = EXPANSIONS.get("Catan")!;

function App() {
  let [hexes, setHexes] = useState<HexRecord>(board.recommendedLayout);

  return (
    <div
      id="app"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Randomizer setHexes={setHexes} board={board} />
      <Board hexes={hexes} board={board} />
    </div>
  );
}

export default App;
