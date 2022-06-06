import "../css/app.css";
import { useState } from "react";
import { HexRecord } from "../types/hexes";
import Board from "./Board";
import Randomizer from "./Randomizer";
import { EXPANSIONS } from "../data/expansions";
import {
  unstable_createMuiStrictModeTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import { brown } from "@mui/material/colors";

const board = EXPANSIONS.get("Catan")!;

function App() {
  let [hexes, setHexes] = useState<HexRecord>(board.recommendedLayout);

  const theme = unstable_createMuiStrictModeTheme({
    palette: { mode: "dark", primary: brown },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

export default App;
