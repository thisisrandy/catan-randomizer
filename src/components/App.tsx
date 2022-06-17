import { useCallback, useEffect, useState } from "react";
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
import { blueGrey } from "@mui/material/colors";
import { CatanBoard, ExpansionName } from "../types/boards";
import { GitHub } from "@mui/icons-material";
import { useStateWithLocalStorage } from "../hooks/useStateWithLocalStorage";
import { SavedBoard, SavedBoards } from "../types/persistence";
import BoardSaver from "./BoardSaver";
import BoardLoader from "./BoardLoader";
import { reviver } from "../utils/serialization";
import { SHARED_BOARD_PARAM } from "../constants/sharing";

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
  const changeExpansion = useCallback(
    (expansion: ExpansionName, hexes?: Hex[]) => {
      setExpansion(expansion);
      const board = EXPANSIONS.get(expansion)!;
      setBoard(board);
      setHexes(typeof hexes === "undefined" ? board.recommendedLayout : hexes);
    },
    [setExpansion]
  );

  // if this was a share link, parse it, save it to savedBoards, and then load it
  useEffect(() => {
    const sharedBoardStr = new URL(document.location.href).searchParams.get(
      SHARED_BOARD_PARAM
    );
    if (sharedBoardStr) {
      try {
        const [sharedBoardName, sharedBoard]: [keyof SavedBoards, SavedBoard] =
          JSON.parse(sharedBoardStr, reviver);
        setSavedBoards((savedBoards) => ({
          ...savedBoards,
          [sharedBoardName]: sharedBoard,
        }));
        changeExpansion(sharedBoard.expansion, sharedBoard.hexes);
      } catch (error) {
        console.log(
          "Something went wrong trying to parse the savedBoard url param",
          error
        );
      }
    }
  }, [changeExpansion, setSavedBoards]);

  const theme = unstable_createMuiStrictModeTheme({
    palette: { mode: "dark", primary: blueGrey },
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
            disableTouchListener
            placement="left"
          >
            <Autocomplete
              style={{ margin: 10, marginBottom: 0, width: 300 }}
              options={Array.from(EXPANSIONS.keys()).sort()}
              renderInput={(params) => (
                <TextField {...params} label="Expansion" />
              )}
              value={expansion}
              onChange={(_, value) => {
                if (value !== null) changeExpansion(value);
              }}
              autoComplete
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
            <BoardSaver
              {...{ hexes, expansion, savedBoards, setSavedBoards }}
            />
            <BoardLoader
              {...{ savedBoards, setSavedBoards, changeExpansion }}
            />
            <Tooltip title="See the code on github.com" disableTouchListener>
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
