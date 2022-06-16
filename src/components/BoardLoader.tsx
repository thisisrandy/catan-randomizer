import { useEffect, useState } from "react";
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
  savedBoards: SavedBoards;
  changeExpansion: (expansion: ExpansionName, hexes?: Hex[]) => void;
}

// TODO: Add a way to delete games

/**
 * Component for loading boards from local storage. Counterpart to BoardSaver.
 * Provides a load button and associated dialog.
 */
export default function BoardLoader({ savedBoards, changeExpansion }: Props) {
  const [disabled, setDisabled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gameToLoad, setGameToLoad] = useState<string | null>(null);
  const [loadDisabled, setLoadDisabled] = useState(true);

  const handleDialogClose = () => setDialogOpen(false);
  const handleLoad = () => {
    const saved = savedBoards[gameToLoad!];
    changeExpansion(saved.expansion, saved.hexes);
    handleDialogClose();
  };

  useEffect(() => {
    setDisabled(Object.keys(savedBoards).length === 0);
  }, [savedBoards]);

  useEffect(() => {
    setLoadDisabled(gameToLoad === null);
  }, [gameToLoad]);

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
              setGameToLoad(value);
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
          <Tooltip
            title={
              loadDisabled
                ? "Please select a board to load"
                : "Load the selected board"
            }
            disableTouchListener
          >
            <span>
              <Button
                style={{ marginRight: 20 }}
                variant="contained"
                onClick={handleLoad}
                disabled={loadDisabled}
              >
                Load
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title="Close the dialog without loading anything"
            disableTouchListener
          >
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
        disableTouchListener
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
