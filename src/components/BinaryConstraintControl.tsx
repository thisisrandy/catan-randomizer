import { Checkbox } from "@mui/material";
import React from "react";
import { BinaryConstraints } from "../types/constraints";

interface Props {
  constraint: keyof BinaryConstraints;
  text: string;
  constraints: BinaryConstraints;
  setConstraints: React.Dispatch<React.SetStateAction<BinaryConstraints>>;
}

export default function BinaryConstraintControl({
  constraint,
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
      <Checkbox
        style={{ marginRight: 5 }}
        checked={!constraints[constraint]}
        onChange={(e) =>
          setConstraints((c) => ({
            ...c,
            [constraint]: !e.target.checked,
          }))
        }
      />
      {text}
    </span>
  );
}
