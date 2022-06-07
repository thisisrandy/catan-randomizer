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
  const [hexes, setHexes] = useState<HexRecord>(board.recommendedLayout);

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Board hexes={hexes} board={board} />
        <Randomizer setHexes={setHexes} board={board} />
      </div>
    </ThemeProvider>
  );
}

export default App;
