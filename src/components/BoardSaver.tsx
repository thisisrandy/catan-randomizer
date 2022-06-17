import React, { useState } from "react";
import { ExpansionName } from "../types/boards";
import { Hex } from "../types/hexes";
import SaveIcon from "@mui/icons-material/Save";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { SavedBoards } from "../types/persistence";

interface Props {
  hexes: Hex[];
  expansion: ExpansionName;
  savedBoards: SavedBoards;
  setSavedBoards: React.Dispatch<React.SetStateAction<SavedBoards>>;
}

const saveMinChars = 5;

// TODO: track whether the current board has been saved. if so, grey out the
// save button and change the tooltip

/**
 * Component for saving boards to local storage. Counterpart to BoardLoader.
 * Provides a save button and associated dialog
 */
export default function BoardSaver({
  hexes,
  expansion,
  savedBoards,
  setSavedBoards,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

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
          <TextField
            style={{ marginTop: 5 }}
            label={"Save as..."}
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
            autoFocus
            helperText={
              saveName.length < saveMinChars
                ? `${saveMinChars - saveName.length} characters to go...`
                : saveName in savedBoards
                ? "That name is already in use"
                : "Looks good!"
            }
            error={saveName in savedBoards}
          />
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Tooltip title={"Save the board on this device"} disableTouchListener>
            <span>
              <Button
                variant="contained"
                disabled={
                  saveName.length < saveMinChars || saveName in savedBoards
                }
                onClick={handleSave}
                style={{ marginRight: 20 }}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Close the dialog without saving" disableTouchListener>
            <Button variant="contained" onClick={handleDialogClose}>
              Cancel
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <Tooltip
        title="Save the current board configuration"
        disableTouchListener
      >
        <IconButton onClick={() => setDialogOpen(true)}>
          <SaveIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
