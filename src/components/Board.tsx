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
import port3to1WithDocks from "../images/port-3-1-with-docks.png";
import portBrickWithDocks from "../images/port-brick-with-docks.png";
import portGrainWithDocks from "../images/port-grain-with-docks.png";
import portOreWithDocks from "../images/port-ore-with-docks.png";
import portTimberWithDocks from "../images/port-timber-with-docks.png";
import portWoolWithDocks from "../images/port-wool-with-docks.png";
import { Hex, HexType, PortType } from "../types/hexes";
import { CatanBoard } from "../types/boards";
import { Paper } from "@mui/material";
import { HEX_HEIGHT, HEX_WIDTH } from "../constants/imageProperties";

const hexNameToImg: { [type in HexType]: string } = {
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

const portTypeToImage: { [type in PortType]: string } = {
  "3:1": port3to1WithDocks,
  brick: portBrickWithDocks,
  grain: portGrainWithDocks,
  ore: portOreWithDocks,
  timber: portTimberWithDocks,
  wool: portWoolWithDocks,
};

interface Props {
  hexes: Hex[];
  board: CatanBoard;
}

const HEX_SIZE = "90%";

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
        {hexes.map(({ type, number, port }, i) => (
          // NOTE: this div fixes display on some older devices. see
          // https://stackoverflow.com/a/67527395/12162258
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
              alt={`${type} hex at position ${i}. Positions indices run left to
              right, top to bottom`}
              style={{
                width: HEX_SIZE,
                height: HEX_SIZE,
                position: "absolute",
                zIndex: 1,
              }}
            />
            {number && (
              <img
                src={String(numberValToImg[number])}
                alt={`${number} chit at position ${i}`}
                style={{
                  width: "35%",
                  height: `${(35 * HEX_WIDTH) / HEX_HEIGHT}%`,
                  position: "absolute",
                  zIndex: 2,
                }}
              />
            )}
            {port && (
              <img
                src={portTypeToImage[port.type]}
                alt={`${port.type} port at position ${i}`}
                style={{
                  zIndex: 2,
                  width: HEX_SIZE,
                  height: HEX_SIZE,
                  transform: `rotate(${port.orientation}deg)`,
                  position: "absolute",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </Paper>
  );
}
