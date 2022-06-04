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
      <input
        style={{ marginRight: 5, width: 30 }}
        type="number"
        value={constraints[constraint].value}
        min={min}
        max={max}
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
