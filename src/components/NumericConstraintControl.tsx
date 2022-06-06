import { TextField } from "@mui/material";
import React from "react";
import { NumericConstraints } from "../types/constraints";
interface Props {
  constraint: keyof NumericConstraints;
  min: number;
  max: number;
  text: string;
  constraints: NumericConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<NumericConstraints>>;
}

export default function NumericConstraintControl({
  constraint,
  min,
  max,
  text,
  constraints,
  setConstraints,
}: Props) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        minWidth: 200,
        margin: 5,
      }}
    >
      <TextField
        style={{ marginRight: 5, minWidth: 50 }}
        type="number"
        value={constraints[constraint].value}
        inputProps={{ min, max }}
        onChange={(e) => {
          let val = Number(e.target.value);
          setConstraints((c) => ({
            ...c,
            [constraint]: { value: val, valid: val <= max && val >= min },
          }));
        }}
      />
      {text}
    </span>
  );
}
