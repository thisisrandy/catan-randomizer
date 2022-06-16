import React, { useEffect, useState } from "react";
import { ExpansionName } from "../types/boards";
import { Hex } from "../types/hexes";
import SaveIcon from "@mui/icons-material/Save";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  OutlinedInput,
  Tooltip,
} from "@mui/material";
import { SavedBoards } from "../types/persistence";

interface Props {
  hexes: Hex[];
  expansion: ExpansionName;
  setSavedBoards: React.Dispatch<React.SetStateAction<SavedBoards>>;
}

const saveInputId = "save-board-input";
const saveInputLabel = "Save as...";
const saveMinChars = 5;

// TODO: track whether the current board has been saved. if so, grey out the
// save button and change the tooltip
// TODO: enforce name uniqueness

/**
 * Component for saving boards to local storage. Counterpart to BoardLoader.
 * Provides a save button and associated dialog
 */
export default function BoardSaver({
  hexes,
  expansion,
  setSavedBoards,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDisabled, setSaveDisabled] = useState(true);

  useEffect(
    () => setSaveDisabled(saveName.length < saveMinChars),
    [setSaveDisabled, saveName]
  );

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSaveName("");
  };
  const handleSave = () => {
    setSavedBoards((savedBoards) => ({
      ...savedBoards,
      [saveName]: { expansion, hexes, date: new Date() },
    }));
    handleDialogClose();
  };

  return (
    <>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Save Board</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FormControl style={{ marginTop: 5 }}>
            <InputLabel htmlFor={saveInputId}>{saveInputLabel}</InputLabel>
            <OutlinedInput
              id={saveInputId}
              label={saveInputLabel}
              value={saveName}
              onChange={(e) => {
                setSaveName(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              // NOTE: autoFocus recently broke under strict mode. production is
              // unaffected since strict mode is a development only thing. see
              // https://github.com/mui/material-ui/issues/33004
              autoFocus={true}
            />
          </FormControl>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Tooltip
            title={
              saveDisabled
                ? `Save name must be at least ${saveMinChars} characters long`
                : "Save the board on this device"
            }
            followCursor={true}
          >
            <span>
              <Button
                variant="contained"
                disabled={saveDisabled}
                onClick={handleSave}
                style={{ marginRight: 20 }}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Close the dialog without saving">
            <Button variant="contained" onClick={handleDialogClose}>
              Cancel
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <Tooltip title="Save the current board configuration" followCursor={true}>
        <IconButton onClick={() => setDialogOpen(true)}>
          <SaveIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
