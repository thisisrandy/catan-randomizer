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
}

export default function NumericConstraintControl({
  constraint,
  min,
  max,
  label,
  toolTip,
  constraints,
  setConstraints,
}: Props) {
  return (
    <Tooltip title={toolTip} followCursor={true}>
      <TextField
        style={{ margin: 10 }}
        id={constraint}
        label={label}
        value={constraints[constraint].value}
        onChange={(e) => {
          let val = Number(e.target.value);
          setConstraints((c) => ({
            ...c,
            [constraint]: { value: val, valid: val <= max && val >= min },
          }));
        }}
        helperText={
          !constraints[constraint].valid
            ? `Must be a number between ${min} and ${max}`
            : null
        }
        error={!constraints[constraint].valid}
      />
    </Tooltip>
  );
}
