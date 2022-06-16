import { useState } from "react";
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
import { SavedBoards } from "../types/persistence";
import BoardSaver from "./BoardSaver";
import BoardLoader from "./BoardLoader";

// FIXME: need to reevaluate the use of tooltips throughout the app. they look
// great when a mouse is being used for all navigation, but they're all kinds of
// broken otherwise. if there's no consistently good looking solution, it might
// be best to just get rid of them altogether

function App() {
  const [expansion, setExpansion] = useStateWithLocalStorage<ExpansionName>(
    "expansion",
    "Catan"
  );
  const [board, setBoard] = useState<CatanBoard>(EXPANSIONS.get(expansion)!);
  const [hexes, setHexes] = useState<Hex[]>(board.recommendedLayout);
  const [savedBoards, setSavedBoards] = useStateWithLocalStorage<SavedBoards>(
    "savedBoards",
    {}
  );

  /**
   * When the expansion is changed, state must be updated in the right order.
   * This is a simple helper to ensure that ordering
   */
  const changeExpansion = (expansion: ExpansionName, hexes?: Hex[]) => {
    setExpansion(expansion);
    const board = EXPANSIONS.get(expansion)!;
    setBoard(board);
    setHexes(typeof hexes === "undefined" ? board.recommendedLayout : hexes);
  };

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
        <Board {...{ hexes, board }} />
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
                if (value !== null) changeExpansion(value);
              }}
            />
          </Tooltip>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 5,
            }}
          >
            <Randomizer {...{ setHexes, board }} />
            <BoardSaver {...{ hexes, expansion, setSavedBoards }} />
            <BoardLoader {...{ savedBoards, changeExpansion }} />
            <Tooltip title="See the code on github.com" followCursor={true}>
              <IconButton
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/thisisrandy/catan-randomizer"
              >
                <GitHub />
              </IconButton>
            </Tooltip>
          </div>
        </Paper>
      </div>
    </ThemeProvider>
  );
}

export default App;
