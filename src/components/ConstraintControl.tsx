import React from "react";
import { Constraints } from "../types/constraints";

interface Props {
  constraint: keyof Constraints;
  text: string;
  constraints: Constraints;
  setConstraints: React.Dispatch<React.SetStateAction<Constraints>>;
}

export default function ConstraintControl({
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
      <input
        style={{ marginRight: 5 }}
        type="checkbox"
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
