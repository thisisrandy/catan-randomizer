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
import { SavedBoards } from "../types/persistence";
import BoardSaver from "./BoardSaver";
import BoardLoader from "./BoardLoader";

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

  // FIXME: with the addition of loading, we will be setting expansion *and*
  // hexes, so this effect will do useless work that will probably manifest as
  // jumpy extra drawing. this work should be moved into the onChange function
  // of the expansion selector. we do, however, want to set the board in all
  // cases (load + change expansion). might make sense to keep that in an effect
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
            }}
          >
            <Randomizer {...{ setHexes, board }} />
            <BoardSaver {...{ hexes, expansion, setSavedBoards }} />
            <BoardLoader {...{ setHexes, setExpansion, savedBoards }} />
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
