import { useState } from "react";
import Board from "./Board";
import Randomize from "./Randomize";

function App() {
  // NOTE: this is the prescribed layout from the manual
  // TODO: add a hexes interface
  let [hexes, setHexes] = useState([
    { type: "mountains", number: 10 },
    { type: "pasture", number: 2 },
    { type: "forest", number: 9 },
    { type: "fields", number: 12 },
    { type: "hills", number: 6 },
    { type: "pasture", number: 4 },
    { type: "hills", number: 10 },
    { type: "fields", number: 9 },
    { type: "forest", number: 11 },
    { type: "desert", number: null },
    { type: "forest", number: 3 },
    { type: "mountains", number: 8 },
    { type: "forest", number: 8 },
    { type: "mountains", number: 3 },
    { type: "fields", number: 4 },
    { type: "pasture", number: 5 },
    { type: "hills", number: 5 },
    { type: "fields", number: 6 },
    { type: "pasture", number: 11 },
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Board hexes={hexes} />
      <Randomize setHexes={setHexes} />
    </div>
  );
}

export default App;
