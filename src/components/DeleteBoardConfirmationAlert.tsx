import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import React from "react";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  boardToDelete: string | null;
  handleDeleteBoard: () => void;
}

export default function DeleteBoardConfirmationAlert({
  open,
  setOpen,
  boardToDelete,
  handleDeleteBoard,
}: Props) {
  return (
    <Dialog open={open}>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent style={{ maxWidth: 400 }}>
        <DialogContentText>
          You are about to delete the saved board "{boardToDelete}". Are you
          sure? This is <strong>not</strong> reversible.
        </DialogContentText>
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
          title="Delete forever!"
          placement="top"
          arrow
          disableInteractive
        >
          <Button
            style={{ marginRight: 20 }}
            variant="contained"
            onClick={() => {
              handleDeleteBoard();
              setOpen(false);
            }}
          >
            Yes
          </Button>
        </Tooltip>
        <Tooltip
          title="Let the poor board be!"
          placement="top"
          arrow
          disableInteractive
        >
          <Button variant="contained" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
