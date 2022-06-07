import pasture from "../images/pasture.png";
import forest from "../images/forest.png";
import hills from "../images/hills.png";
import mountains from "../images/mountains.png";
import fields from "../images/fields.png";
import desert from "../images/desert.png";
import two from "../images/2.png";
import three from "../images/3.png";
import four from "../images/4.png";
import five from "../images/5.png";
import six from "../images/6.png";
import eight from "../images/8.png";
import nine from "../images/9.png";
import ten from "../images/10.png";
import eleven from "../images/11.png";
import twelve from "../images/12.png";
import { HexRecord } from "../types/hexes";
import { CatanBoard, ExpansionName } from "../types/boards";
import { Paper } from "@mui/material";

const hexNameToImg = {
  pasture: pasture,
  forest: forest,
  hills: hills,
  mountains: mountains,
  fields: fields,
  desert: desert,
};

const numberValToImg = [
  null,
  null,
  two,
  three,
  four,
  five,
  six,
  null,
  eight,
  nine,
  ten,
  eleven,
  twelve,
];

interface Props {
  hexes: HexRecord;
  board: CatanBoard;
  expansion: ExpansionName;
}

/**
 * `Board` is the display logic for a Catan board, it's props is an array of hexes,
 * each with a coordinate, type, and number chit value
 */
export default function Board({ hexes, board, expansion }: Props) {
  return (
    <Paper
      elevation={20}
      style={{
        margin: 10,
        padding: 20,
        // TODO: this doesn't look good on really tall screens. also, it would
        // be nice if everything were bigger on wide screens. play around with
        // css min, etc.
        width: "55vh",
        height: "55vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: expansion === "Explorers & Pirates" ? "55%" : "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: board.cssGridTemplateColumns,
          gridTemplateRows: board.cssGridTemplateRows,
        }}
      >
        {hexes.map(({ type, number }, i) => (
          <div
            key={i}
            style={{
              height: "100%",
              width: "100%",
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gridArea: board.cssGridAreas[i],
            }}
          >
            <img
              src={hexNameToImg[type]}
              alt={type}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                zIndex: 1,
              }}
            />
            {number && (
              <img
                src={String(numberValToImg[number])}
                alt={String(number)}
                style={{
                  width: "35%",
                  height: "28%",
                  position: "absolute",
                  zIndex: 2,
                }}
              ></img>
            )}
          </div>
        ))}
      </div>
    </Paper>
  );
}
