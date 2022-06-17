import { useEffect, useState } from "react";
import { ExpansionName } from "../types/boards";
import { Hex } from "../types/hexes";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { SavedBoards } from "../types/persistence";
import { getDaysSince } from "../utils/dates";
import DeleteSavedBoardConfirmationAlert from "./DeleteBoardConfirmationAlert";
import { replacer } from "../utils/serialization";
import { SHARED_BOARD_PARAM } from "../constants/sharing";

interface Props {
  savedBoards: SavedBoards;
  setSavedBoards: React.Dispatch<React.SetStateAction<SavedBoards>>;
  changeExpansion: (expansion: ExpansionName, hexes?: Hex[]) => void;
}

/**
 * Component for loading boards from local storage. Counterpart to BoardSaver.
 * Provides a load button and associated dialog.
 */
export default function BoardLoader({
  savedBoards,
  setSavedBoards,
  changeExpansion,
}: Props) {
  const [disabled, setDisabled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gameToLoad, setGameToLoad] = useState<string | null>(null);
  const [loadDisabled, setLoadDisabled] = useState(true);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [deletionConfirmationAlertOpen, setDeletionConfirmationAlertOpen] =
    useState(false);
  const [handleDeleteBoard, setHandleDeleteBoard] = useState(() => () => {});
  const [shareSnackOpen, setShareSnackOpen] = useState(false);
  const [shareSnackSeverity, setShareSnackSeverity] = useState<
    "success" | "error"
  >("success");
  const [shareSnackMessage, setShareSnackMessage] = useState("");

  const handleDialogClose = () => setDialogOpen(false);
  const handleLoad = () => {
    const saved = savedBoards[gameToLoad!];
    changeExpansion(saved.expansion, saved.hexes);
    handleDialogClose();
  };

  const handleConfirmDeletion =
    (name: keyof SavedBoards) =>
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // delete buttons are part of the select clickable surface, so the event
      // will bubble up and select the thing we just selected for deletion,
      // unless we prevent it from doing so
      event.stopPropagation();
      // note that, per the docs
      // (https://www.typescriptlang.org/docs/handbook/2/keyof-types.html),
      // "JavaScript object keys are always coerced to a string", which is why
      // name is string | number. a quick cast fixes us right up
      setBoardToDelete(name as string);
      setHandleDeleteBoard(() => () => {
        setSavedBoards(({ [name]: omitted, ...savedBoards }) => savedBoards);
        // if we deleted the currently selected game to load, clear gameToLoad
        setGameToLoad((gameToLoad) =>
          name === gameToLoad ? null : gameToLoad
        );
      });
      setDeletionConfirmationAlertOpen(true);
    };

  const handleShare =
    (name: keyof SavedBoards) =>
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // as with delete, the first order of business is to prevent the event
      // from propagating to the select surface
      event.stopPropagation();
      const selectedBoard = [name, savedBoards[name]] as const;
      const url =
        `${window.location.href.split("?")[0]}?${SHARED_BOARD_PARAM}=` +
        encodeURIComponent(JSON.stringify(selectedBoard, replacer));
      navigator.clipboard.writeText(url).then(
        () => {
          setShareSnackSeverity("success");
          setShareSnackMessage("Successfully copied share link to clipboard!");
          setShareSnackOpen(true);
        },
        (reason) => {
          setShareSnackSeverity("error");
          setShareSnackMessage(
            "Something went wrong copying the share link to" +
              "the clipboard. Check the console for details."
          );
          console.log(reason);
          setShareSnackOpen(true);
        }
      );
    };

  const handleShareSnackClose = () => setShareSnackOpen(false);

  useEffect(() => {
    setDisabled(Object.keys(savedBoards).length === 0);
  }, [savedBoards]);

  useEffect(() => {
    setLoadDisabled(gameToLoad === null);
  }, [gameToLoad]);

  return (
    <>
      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Load Board</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Autocomplete
            // NOTE: this gets automagically shrunk as needed, so what we're
            // actually specifying is closer to max width
            style={{ margin: 10, marginBottom: 0, width: 300 }}
            options={Object.entries(savedBoards)
              .map(([name, savedBoard]) => ({ ...savedBoard, name }))
              .sort((a, b) => {
                return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
              })}
            groupBy={(option) => {
              const daysSince = getDaysSince(option.date);
              if (daysSince === 0) {
                return "Today";
              } else if (daysSince === 1) {
                return "Yesterday";
              } else if (daysSince <= 7) {
                return "This week";
              } else if (daysSince <= 14) {
                return "Last week";
              } else {
                return "Older";
              }
            }}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <Tooltip
                title="Start typing to narrow the results"
                disableTouchListener
                placement="top"
              >
                <TextField
                  {...params}
                  autoFocus
                  label="Saved Board"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !loadDisabled) handleLoad();
                  }}
                />
              </Tooltip>
            )}
            renderOption={(props, option) => {
              return (
                <li
                  {...props}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography>{option.name}</Typography>
                    <Typography variant="caption">
                      {option.expansion}
                    </Typography>
                    <Typography variant="caption">
                      {`Saved on: ${option.date.toLocaleString()}`}
                    </Typography>
                  </span>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <Tooltip
                      title="Share this board"
                      disableTouchListener
                      placement="right"
                    >
                      <IconButton onClick={handleShare(option.name)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="Delete this board"
                      disableTouchListener
                      placement="right"
                    >
                      <IconButton onClick={handleConfirmDeletion(option.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </span>
                </li>
              );
            }}
            value={
              gameToLoad
                ? { ...savedBoards[gameToLoad], name: gameToLoad }
                : null
            }
            onChange={(_, value) => {
              setGameToLoad(value ? value.name : null);
            }}
            autoComplete
            isOptionEqualToValue={(option, value) => {
              // it isn't really clear to me why autocomplete needs to check
              // this, and I don't feel like digging in. suffice to say that
              // this seems to always be true, but the default seems to be to
              // use simple equality, which is of course false for object
              // comparisons (and option/value are both [identical] objects). as
              // a compromise instead of just returning true, check that their
              // keys are the same
              const optKeys = new Set(Object.keys(option));
              const valKeys = new Set(Object.keys(value));
              if (optKeys.size !== valKeys.size) return false;
              for (const k in optKeys) if (!valKeys.has(k)) return false;
              return true;
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

      {/* Confirmation dialog */}
      <DeleteSavedBoardConfirmationAlert
        open={deletionConfirmationAlertOpen}
        setOpen={setDeletionConfirmationAlertOpen}
        boardToDelete={boardToDelete}
        handleDeleteBoard={handleDeleteBoard}
      />

      {/* Open dialog button */}
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

      {/* Share snackbar */}
      <Snackbar
        open={shareSnackOpen}
        autoHideDuration={6000}
        onClose={handleShareSnackClose}
      >
        <Alert
          onClose={handleShareSnackClose}
          severity={shareSnackSeverity}
          style={{ width: "100%" }}
        >
          {shareSnackMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
