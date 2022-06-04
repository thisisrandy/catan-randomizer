import React from "react";
import {
  NumericConstraints,
  NumericConstraintValidity,
} from "../types/constraints";

interface Props {
  constraint: keyof NumericConstraints;
  min: number;
  max: number;
  text: string;
  constraints: NumericConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<NumericConstraints>>;
  setValid: React.Dispatch<React.SetStateAction<NumericConstraintValidity>>;
}

export default function NumericConstraintControl({
  constraint,
  min,
  max,
  text,
  constraints,
  setConstraints,
  setValid,
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
        value={constraints[constraint]}
        min={min}
        max={max}
        onChange={(e) => {
          let val = Number(e.target.value);
          setValid((v) => ({
            ...v,
            [constraint]: val <= max && val >= min,
          }));
          setConstraints((c) => ({
            ...c,
            [constraint]: val,
          }));
        }}
      />
      {text}
    </span>
  );
}
