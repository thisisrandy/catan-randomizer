import React, { useEffect, useState } from "react";
import { Hex } from "../types/hexes";
import { BinaryConstraints, NumericConstraints } from "../types/constraints";
import BinaryConstraintControl from "./BinaryConstraintControl";
import NumericConstraintControl from "./NumericConstraintControl";
import { CatanBoard, ExpansionName } from "../types/boards";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  FormGroup,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useStateWithLocalStorage } from "../hooks/useStateWithLocalStorage";
import { IncomingMessage, OutgoingMessage } from "../threading/shuffleWorker";

const islandExpansions: ExpansionName[] = [
  "Seafarers: Heading for New Shores 3-Player Set-up",
  "Seafarers: Heading for New Shores 4-Player Set-up",
  "Seafarers: Through the Desert 3-Player Set-up",
  "Seafarers: Through the Desert 4-Player Set-up",
  "Seafarers: New World",
  "Seafarers: New World of Fish",
  "Seafarers: New World Expanded",
  "Seafarers: New World of Fish Expanded",
  "Seafarers: New World Islands",
  "Everything, Everywhere, All at Once, Variable",
  "Seafarers & Pirates, Variable",
];

interface Props {
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>;
  board: CatanBoard;
  expansion: ExpansionName;
}

// per https://webpack.js.org/guides/web-workers/, creating a new Worker is
// straightforward
const shuffleWorker = new Worker(
  new URL("../threading/shuffleWorker.ts", import.meta.url)
);

/**
 * Component for producing random arrangements of hexes and number chits within
 * certain constraints. Provides a dialog to manage constraint settings and two
 * buttons, one to randomize the board, and the other to open the settings
 * dialog. These can be arranged in whatever manner the parent component chooses
 */
export default function Randomizer({ setHexes, board, expansion }: Props) {
  const [binaryConstraints, setBinaryConstraints] =
    useStateWithLocalStorage<BinaryConstraints>("binaryConstraints", {
      noAdjacentSixEight: true,
      noAdjacentTwoTwelve: true,
      noAdjacentPairs: true,
    });

  const [numericConstraints, setNumericConstraints] =
    useStateWithLocalStorage<NumericConstraints>(
      "numericConstraints",
      {
        maxConnectedLikeTerrain: { value: 2, valid: true, active: true },
        maxIntersectionPipCount: { value: 10, valid: true, active: true },
        minIslandCount: { value: 1, valid: true, active: true },
      },
      undefined,
      2,
      {
        // version 1 lacked a `minIslandCount` property and `active`
        // subproperties
        1: ({ maxConnectedLikeTerrain, maxIntersectionPipCount }) => ({
          maxConnectedLikeTerrain: { ...maxConnectedLikeTerrain, active: true },
          maxIntersectionPipCount: { ...maxIntersectionPipCount, active: true },
          minIslandCount: { value: 1, valid: true, active: true },
        }),
      }
    );

  // we want to remember this state in case the user set invalid constraints
  // and then closed the page. it would be confusing to have the randomize
  // button greyed out without any explanation
  const [dialogOpen, setDialogOpen] = useStateWithLocalStorage(
    "randomizerDialogOpen",
    false
  );
  const [invalidConstraints, setInvalidConstraints] = useState(false);

  useEffect(
    () =>
      setInvalidConstraints(
        !Object.values(numericConstraints)
          .map((c) => c.valid)
          .reduce((acc, v) => acc && v)
      ),
    [numericConstraints, setInvalidConstraints]
  );

  const handleClose = () => {
    if (!invalidConstraints) setDialogOpen(false);
  };

  const [errorSnackOpen, setErrorSnackOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleErrorSnackClose = () => {
    setErrorSnackOpen(false);
  };

  useEffect(() => {
    shuffleWorker.onmessage = (ev: MessageEvent<OutgoingMessage>) => {
      const { messageType, payload } = ev.data;
      switch (messageType) {
        case "result":
          setHexes(payload);
          break;
        case "error":
          setErrorMessage(payload);
          setErrorSnackOpen(true);
          break;
        default:
          ((_: never): never => {
            throw new Error("never");
          })(messageType);
      }
    };
  });

  useEffect(() => {
    setNumericConstraints((c) => ({
      ...c,
      minIslandCount: {
        ...c.minIslandCount,
        active: islandExpansions.includes(expansion),
      },
    }));
  }, [expansion, setNumericConstraints]);

  return (
    <>
      {/* Constraints dialog */}
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingBottom: 0,
          }}
        >
          <FormGroup>
            <BinaryConstraintControl
              constraint="noAdjacentSixEight"
              label={"Allow adjacent 6 & 8"}
              toolTip={
                "When this box is checked, the numbers 6 & 8 are allowed" +
                " to appear next to each other"
              }
              constraints={binaryConstraints}
              setConstraints={setBinaryConstraints}
            />
            <BinaryConstraintControl
              constraint="noAdjacentTwoTwelve"
              label={"Allow adjacent 2 & 12"}
              toolTip={
                "When this box is checked, the numbers 2 & 12 are allowed" +
                " to appear next to each other"
              }
              constraints={binaryConstraints}
              setConstraints={setBinaryConstraints}
            />
            <BinaryConstraintControl
              constraint="noAdjacentPairs"
              label="Allow adjacent number pairs"
              toolTip={
                "When this box is checked, pairs of the same number are allowed" +
                " to appear next to each other"
              }
              constraints={binaryConstraints}
              setConstraints={setBinaryConstraints}
            />
          </FormGroup>
          <NumericConstraintControl
            constraint="maxConnectedLikeTerrain"
            min={1}
            max={7}
            label="Max connected like terrain"
            toolTip={
              "Control how many terrain hexes of the same type can appear" +
              " connected. Note that connected can mean in any shape, including a line"
            }
            constraints={numericConstraints}
            setConstraints={setNumericConstraints}
          />
          <NumericConstraintControl
            constraint="maxIntersectionPipCount"
            min={10}
            max={15}
            label="Max intersection pip count"
            toolTip={
              "Control the upper limit on the sum of the pips surrounding each" +
              " intersection. For example, if this is set to 12, an intersection surrounded" +
              " by 6 (5 pips), 5 (4 pips), and 9 (4 pips) would not be allowed"
            }
            constraints={numericConstraints}
            setConstraints={setNumericConstraints}
          />
          <NumericConstraintControl
            constraint="minIslandCount"
            min={1}
            max={7}
            label="Min island count"
            toolTip={
              numericConstraints.minIslandCount.active
                ? "Control the lower limit on distinct islands on the shuffled board"
                : "Only applicable to scenarios with a variable number of islands"
            }
            constraints={numericConstraints}
            setConstraints={setNumericConstraints}
          />
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip
            title={
              invalidConstraints
                ? "One or more constraints is invalid. Please fix this before closing the dialog"
                : "Close the dialog"
            }
            placement="top"
            arrow
            disableInteractive
          >
            {/* the span allows the tooltip to still pop up when the button is
            disabled. see
            https://mui.com/material-ui/react-tooltip/#disabled-elements */}
            <span>
              <Button
                style={{ marginBottom: 10 }}
                variant="contained"
                onClick={handleClose}
                disabled={invalidConstraints}
              >
                Close
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Buttons */}
      <Tooltip
        title="Generate a random board layout subject to the specified constraints"
        placement="top"
        arrow
        disableInteractive
      >
        <Button
          variant="contained"
          style={{ margin: 5, padding: 10 }}
          onClick={() => {
            const message: IncomingMessage = {
              board,
              binaryConstraints,
              numericConstraints,
            };
            shuffleWorker.postMessage(message);
          }}
          disabled={invalidConstraints}
        >
          Randomize!
        </Button>
      </Tooltip>
      <Tooltip
        title="Open the constraints settings dialog"
        placement="top"
        arrow
        disableInteractive
      >
        <IconButton onClick={() => setDialogOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

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
    </>
  );
}
