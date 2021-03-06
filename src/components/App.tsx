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
  Popper,
  PopperProps,
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

/**
 * Component to force the Autocomplete popper to stay on top, even when there's
 * room at the bottom. Used to make sure popper and tooltip always stay out of
 * each other's way
 */
const TopPopper = function (props: PopperProps) {
  return <Popper {...props} placement="top" />;
};

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveContext, setSaveContext] = useState<string | null>(null);

  /**
   * When the expansion is changed, state updates (specifically board and hexes)
   * must be batched together, which is guaranteed under synchronous conditions
   * inside a callback. This is a simple helper to ensure that
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

  // if this was a share link, parse and load it, then give the user the
  // opportunity to save it locally (recall that effects run on mount and then
  // every dep change, only the first of which will ever happen here)
  useEffect(() => {
    const sharedBoardStr = new URL(document.location.href).searchParams.get(
      SHARED_BOARD_PARAM
    );
    if (sharedBoardStr) {
      try {
        const [sharedBoardName, sharedBoard]: [keyof SavedBoards, SavedBoard] =
          JSON.parse(sharedBoardStr, reviver);
        changeExpansion(sharedBoard.expansion, sharedBoard.hexes);
        setSaveName(sharedBoardName as string);
        setSaveContext("You opened a shared board. Would you like to save it?");
        setSaveDialogOpen(true);
      } catch (error) {
        console.log(
          "Something went wrong trying to parse the savedBoard url param",
          error
        );
      }
    }
  }, [changeExpansion]);

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
            placement="bottom"
            arrow
            disableInteractive
          >
            <Autocomplete
              style={{
                margin: 10,
                marginBottom: 0,
                width: "min(90vw, 300px)",
              }}
              PopperComponent={TopPopper}
              options={Array.from(EXPANSIONS.keys()).sort()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Expansion / Extension / Scenario"
                />
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
              justifyContent: "center",
              flexWrap: "wrap",
              padding: 5,
            }}
          >
            <Randomizer {...{ setHexes, board }} />
            <BoardSaver
              {...{
                hexes,
                expansion,
                savedBoards,
                setSavedBoards,
                saveName,
                setSaveName,
              }}
              dialogOpen={saveDialogOpen}
              setDialogOpen={setSaveDialogOpen}
              context={saveContext}
              setContext={setSaveContext}
            />
            <BoardLoader
              {...{ savedBoards, setSavedBoards, changeExpansion }}
            />
            <Tooltip
              title="See the code on github.com"
              placement="top"
              arrow
              disableInteractive
            >
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
