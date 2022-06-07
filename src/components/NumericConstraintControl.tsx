import {
  FormControl,
  FormHelperText,
  OutlinedInput,
  InputLabel,
  Tooltip,
} from "@mui/material";
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
    <Tooltip title={toolTip}>
      <FormControl
        error={!constraints[constraint].valid}
        style={{ margin: 10 }}
      >
        <InputLabel htmlFor={constraint}>{label}</InputLabel>
        <OutlinedInput
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
        />
        {!constraints[constraint].valid && (
          <FormHelperText>
            Must be a number between {min} and {max}
          </FormHelperText>
        )}
      </FormControl>
    </Tooltip>
  );
}
