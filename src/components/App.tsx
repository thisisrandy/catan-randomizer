import { useEffect, useState } from "react";
import { HexRecord } from "../types/hexes";
import Board from "./Board";
import Randomizer from "./Randomizer";
import { EXPANSIONS } from "../data/expansions";
import {
  unstable_createMuiStrictModeTheme,
  ThemeProvider,
  CssBaseline,
  Autocomplete,
  Paper,
  TextField,
} from "@mui/material";
import { brown } from "@mui/material/colors";
import { CatanBoard, ExpansionName } from "../types/boards";

function App() {
  const [expansion, setExpansion] = useState<ExpansionName>("Catan");
  const [board, setBoard] = useState<CatanBoard>(EXPANSIONS.get(expansion)!);
  const [hexes, setHexes] = useState<HexRecord>(board.recommendedLayout);

  useEffect(() => {
    const board = EXPANSIONS.get(expansion)!;
    setBoard(board);
    setHexes(board.recommendedLayout);
  }, [setBoard, expansion, setHexes]);

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
        <Paper
          elevation={20}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Autocomplete
            style={{ margin: 10, marginBottom: 0, width: 300 }}
            disablePortal={true}
            options={Array.from(EXPANSIONS.keys())}
            renderInput={(params) => (
              <TextField {...params} label="Expansion" />
            )}
            value={expansion}
            onChange={(_, value) => {
              if (value !== null) setExpansion(value);
            }}
          />
          <Randomizer setHexes={setHexes} board={board} />
        </Paper>
      </div>
    </ThemeProvider>
  );
}

export default App;
