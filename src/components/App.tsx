import { useCallback, useEffect, useRef, useState } from "react";
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
  Snackbar,
  Alert,
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

/**
 * Mimics the behavior of the old componentWillMount lifecycle method. Stolen
 * shamelessly from https://stackoverflow.com/a/56818036/12162258
 */
const useComponentWillMount = (cb: () => void) => {
  const willMount = useRef(true);
  if (willMount.current) cb();
  willMount.current = false;
};

function App() {
  const [expansion, setExpansion] = useStateWithLocalStorage<ExpansionName>(
    "expansion",
    "Catan"
  );
  // Guard against garbage in localStorage and changes in expansion names. This
  // won't run until after board is loaded for the first time, so we need the
  // same guard inside the useState call for board
  useComponentWillMount(() => {
    if (!EXPANSIONS.has(expansion)) setExpansion("Catan");
  });
  const [board, setBoard] = useState<CatanBoard>(
    EXPANSIONS.has(expansion)
      ? EXPANSIONS.get(expansion)!
      : EXPANSIONS.get("Catan")!
  );
  const [hexes, setHexes] = useState<Hex[]>(board.recommendedLayout);
  const [savedBoards, setSavedBoards] = useStateWithLocalStorage<SavedBoards>(
    "savedBoards",
    {}
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveContext, setSaveContext] = useState<string | null>(null);
  const [errorSnackOpen, setErrorSnackOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleErrorSnackClose = () => {
    setErrorSnackOpen(false);
  };

  /**
   * When the expansion is changed, state updates (specifically board and hexes)
   * must be batched together, which is guaranteed under synchronous conditions
   * inside a callback. This is a simple helper to ensure that
   */
  const changeExpansion = useCallback(
    (expansion: ExpansionName, hexes?: Hex[]) => {
      if (!EXPANSIONS.has(expansion))
        throw new Error(`Unrecognized expansion "${expansion}"`);
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
        setErrorMessage(
          `Something went wrong trying to open a shared board: ${error}`
        );
        setErrorSnackOpen(true);
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
                width: "min(80vw, 400px)",
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
            <Randomizer {...{ setHexes, board, expansion }} />
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

      {/* Error snackbar */}
      <Snackbar
        open={errorSnackOpen}
        onClose={handleErrorSnackClose}
        style={{ maxWidth: 400 }}
      >
        <Alert
          onClose={handleErrorSnackClose}
          severity="error"
          style={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
