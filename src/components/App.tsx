import { useEffect, useState } from "react";
import { Hex } from "../types/hexes";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import { brown } from "@mui/material/colors";
import { CatanBoard, ExpansionName } from "../types/boards";
import { GitHub } from "@mui/icons-material";
import { useStateWithLocalStorage } from "../hooks/useStateWithLocalStorage";

// TODO: add a board history

function App() {
  const [expansion, setExpansion] = useStateWithLocalStorage<ExpansionName>(
    "expansion",
    "Catan"
  );
  const [board, setBoard] = useState<CatanBoard>(EXPANSIONS.get(expansion)!);
  const [hexes, setHexes] = useState<Hex[]>(board.recommendedLayout);

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
          <Tooltip
            title={
              "Choose the Catan expansion to use. The default for each is" +
              " the recommended beginner setup"
            }
            followCursor={true}
          >
            <Autocomplete
              style={{ margin: 10, marginBottom: 0, width: 300 }}
              disablePortal={true}
              options={Array.from(EXPANSIONS.keys()).sort()}
              renderInput={(params) => (
                <TextField {...params} label="Expansion" />
              )}
              value={expansion}
              onChange={(_, value) => {
                if (value !== null) setExpansion(value);
              }}
            />
          </Tooltip>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 5,
              width: 225,
            }}
          >
            <Randomizer setHexes={setHexes} board={board} />
            <Tooltip title="See the code on github.com" followCursor={true}>
              <IconButton
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/thisisrandy/catan-randomizer"
              >
                <GitHub style={{ margin: 5 }} />
              </IconButton>
            </Tooltip>
          </div>
        </Paper>
      </div>
    </ThemeProvider>
  );
}

export default App;
