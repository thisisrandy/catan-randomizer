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
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { SavedBoards } from "../types/persistence";

/**
 * Input props. Note that BoardSaver doesn't own a lot of its state, because
 * it's useful to be able to invoke it at the App level when we open a shared
 * board
 */
interface Props {
  hexes: Hex[];
  expansion: ExpansionName;
  savedBoards: SavedBoards;
  setSavedBoards: React.Dispatch<React.SetStateAction<SavedBoards>>;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saveName: string;
  setSaveName: React.Dispatch<React.SetStateAction<string>>;
  /**
   * If there is any additional context as to why the save dialog has been
   * opened, e.g. because the user used a share link and are now being prompted
   * to save it, supply it here
   */
  context: string | null;
  setContext: React.Dispatch<React.SetStateAction<string | null>>;
}

const saveMinChars = 5;

/**
 * Component for saving boards to local storage. Counterpart to BoardLoader.
 * Provides a save button and associated dialog
 */
export default function BoardSaver({
  hexes,
  expansion,
  savedBoards,
  setSavedBoards,
  dialogOpen,
  setDialogOpen,
  saveName,
  setSaveName,
  context,
  setContext,
}: Props) {
  const [okayToSave, setOkayToSave] = useState(false);

  useEffect(() => {
    setOkayToSave(
      saveName.length >= saveMinChars && !(saveName in savedBoards)
    );
  }, [saveName, savedBoards]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSaveName("");
    setContext(null);
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
        {context && (
          <div style={{ lineHeight: 1, padding: "0px 24px" }}>
            <Typography variant="caption">{context}</Typography>
          </div>
        )}
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
              if (e.key === "Enter" && okayToSave) {
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
            spellCheck={false}
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
          <Tooltip
            title={
              okayToSave
                ? "Save the board on this device"
                : "Please choose a name that isn't already in use"
            }
            placement="top"
            arrow
            disableInteractive
          >
            <span>
              <Button
                variant="contained"
                disabled={!okayToSave}
                onClick={handleSave}
                style={{ marginRight: 20 }}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title="Close the dialog without saving"
            placement="top"
            arrow
            disableInteractive
          >
            <Button variant="contained" onClick={handleDialogClose}>
              Cancel
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <Tooltip
        title="Save the current board configuration"
        placement="top"
        arrow
        disableInteractive
      >
        <IconButton onClick={() => setDialogOpen(true)}>
          <SaveIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
