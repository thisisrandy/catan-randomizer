import React, { useEffect, useState } from "react";
import { ExpansionName } from "../types/boards";
import { Hex } from "../types/hexes";
import HistoryIcon from "@mui/icons-material/History";
import {
  Autocomplete,
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
  setHexes: React.Dispatch<React.SetStateAction<Hex[]>>;
  setExpansion: React.Dispatch<React.SetStateAction<ExpansionName>>;
  savedBoards: SavedBoards;
}

// TODO: Add a way to delete games

/**
 * Component for loading boards from local storage. Counterpart to BoardSaver.
 * Provides a load button and associated dialog.
 */
export default function BoardLoader({
  setHexes,
  setExpansion,
  savedBoards,
}: Props) {
  const [disabled, setDisabled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  // FIXME: set this to the most recently saved board
  const [gameToLoad, setGameToLoad] = useState("");

  const handleDialogClose = () => setDialogOpen(false);
  const handleLoad = () => {
    const saved = savedBoards[gameToLoad];
    setExpansion(saved.expansion);
    setHexes(saved.hexes);
    handleDialogClose();
  };

  useEffect(() => {
    setDisabled(Object.keys(savedBoards).length === 0);
  }, [savedBoards]);

  return (
    <>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Load Board</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* TODO: Add date saved display and sort by date */}
          <Autocomplete
            // NOTE: this gets automagically shrunk as needed, so what we're
            // actually specifying is closer to max width
            style={{ margin: 10, marginBottom: 0, width: 300 }}
            disablePortal={true}
            options={Object.keys(savedBoards)}
            renderInput={(params) => (
              <TextField {...params} autoFocus label="Saved Board" />
            )}
            value={gameToLoad}
            onChange={(_, value) => {
              if (value !== null) setGameToLoad(value);
            }}
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
          <Tooltip title="Load the selected board">
            <Button
              style={{ marginRight: 20 }}
              variant="contained"
              onClick={handleLoad}
            >
              Load
            </Button>
          </Tooltip>
          <Tooltip title="Close the dialog without loading anything">
            <Button variant="contained" onClick={handleDialogClose}>
              Cancel
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <Tooltip
        title={
          disabled
            ? "No games have been previously saved on this device, so there's" +
              " nothing to load"
            : "Load a previously saved board configuration"
        }
        followCursor={true}
      >
        <span>
          <IconButton disabled={disabled} onClick={() => setDialogOpen(true)}>
            <HistoryIcon />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}
