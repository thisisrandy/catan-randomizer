import "../css/board.css";
import pastureHorizontal from "../images/pasture-horizontal.png";
import pastureVertical from "../images/pasture-vertical.png";
import forestHorizontal from "../images/forest-horizontal.png";
import forestVertical from "../images/forest-vertical.png";
import hillsHorizontal from "../images/hills-horizontal.png";
import hillsVertical from "../images/hills-vertical.png";
import mountainsHorizontal from "../images/mountains-horizontal.png";
import mountainsVertical from "../images/mountains-vertical.png";
import fieldsHorizontal from "../images/fields-horizontal.png";
import fieldsVertical from "../images/fields-vertical.png";
import desertHorizontal from "../images/desert-horizontal.png";
import desertVertical from "../images/desert-vertical.png";
import goldHorizonal from "../images/gold-horizontal.png";
import goldVertical from "../images/gold-vertical.png";
import seaHorizontal from "../images/sea-horizontal.png";
import seaVertical from "../images/sea-vertical.png";
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

/**
 * Values are [vertical image, horizontal image]
 */
const hexNameToImg: { [type in HexType]: [string, string] } = {
  pasture: [pastureVertical, pastureHorizontal],
  forest: [forestVertical, forestHorizontal],
  hills: [hillsVertical, hillsHorizontal],
  mountains: [mountainsVertical, mountainsHorizontal],
  fields: [fieldsVertical, fieldsHorizontal],
  desert: [desertVertical, desertHorizontal],
  sea: [seaVertical, seaHorizontal],
  gold: [goldVertical, goldHorizonal],
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
  const horizontal =
    typeof board.horizontal !== "undefined" && board.horizontal;

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
          transform: horizontal ? "rotate(90deg)" : "",
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
              src={hexNameToImg[type][Number(horizontal)]}
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
                  transform: horizontal ? "rotate(-90deg)" : "",
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
