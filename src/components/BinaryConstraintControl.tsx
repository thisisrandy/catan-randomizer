import { Checkbox, FormControlLabel, Tooltip } from "@mui/material";
import React from "react";
import { BinaryConstraints } from "../types/constraints";

interface Props {
  constraint: keyof BinaryConstraints;
  label: string;
  toolTip: string;
  constraints: BinaryConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<BinaryConstraints>>;
}

export default function BinaryConstraintControl({
  constraint,
  label,
  toolTip,
  constraints,
  setConstraints,
}: Props) {
  return (
    <Tooltip title={toolTip} placement="top" arrow disableInteractive>
      <FormControlLabel
        control={
          <Checkbox
            checked={!constraints[constraint]}
            onChange={(e) =>
              setConstraints((c) => ({
                ...c,
                [constraint]: !e.target.checked,
              }))
            }
          />
        }
        label={label}
      />
    </Tooltip>
  );
}
