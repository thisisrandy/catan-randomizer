import { Tooltip, TextField } from "@mui/material";
import { NumericConstraints } from "../types/constraints";

interface Props {
  constraint: keyof NumericConstraints;
  min: number;
  max: number;
  label: string;
  toolTip: string;
  constraints: NumericConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<NumericConstraints>>;
  handleClose: () => void;
}

export default function NumericConstraintControl({
  constraint,
  min,
  max,
  label,
  toolTip,
  constraints,
  setConstraints,
  handleClose,
}: Props) {
  return (
    <Tooltip title={toolTip} placement="top" arrow disableInteractive>
      <TextField
        style={{ margin: 10 }}
        id={constraint}
        label={label}
        value={constraints[constraint].value}
        onChange={(e) => {
          const val = Number(e.target.value);
          setConstraints((c) => ({
            ...c,
            [constraint]: {
              ...c[constraint],
              value: isNaN(val) ? 0 : val,
              valid: val <= max && val >= min,
            },
          }));
        }}
        helperText={
          !constraints[constraint].valid
            ? `Must be a number between ${min} and ${max}`
            : null
        }
        error={!constraints[constraint].valid}
        disabled={!constraints[constraint].active}
        onKeyUp={(e) => {
          if (e.key === "Enter") handleClose();
        }}
      />
    </Tooltip>
  );
}
