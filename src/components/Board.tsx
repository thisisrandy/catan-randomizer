import "../css/board.css";
import pasture from "../images/pasture.png";
import forest from "../images/forest.png";
import hills from "../images/hills.png";
import mountains from "../images/mountains.png";
import fields from "../images/fields.png";
import desert from "../images/desert.png";
import sea from "../images/sea.png";
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
import { Hex } from "../types/hexes";
import { CatanBoard } from "../types/boards";
import { Paper } from "@mui/material";
import { HEX_HEIGHT, HEX_WIDTH } from "../data/expansions";

const hexNameToImg = {
  pasture: pasture,
  forest: forest,
  hills: hills,
  mountains: mountains,
  fields: fields,
  desert: desert,
  sea: sea,
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
  hexes: Hex[];
  board: CatanBoard;
}

/**
 * `Board` is the display logic for a Catan board
 */
export default function Board({ hexes, board }: Props) {
  return (
    <Paper
      id="board-container"
      elevation={20}
      style={{
        margin: 10,
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width:
            typeof board.boardWidthPercentage !== "undefined"
              ? board.boardWidthPercentage
              : "100%",
          height:
            typeof board.boardHeightPercentage !== "undefined"
              ? board.boardHeightPercentage
              : "100%",
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
                width: "90%",
                height: "90%",
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
                  height: `${(35 * HEX_WIDTH) / HEX_HEIGHT}%`,
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
