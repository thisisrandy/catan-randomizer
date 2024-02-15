import "../css/board.css";
import {
  pastureHorizontal,
  pastureVertical,
  forestHorizontal,
  forestVertical,
  hillsHorizontal,
  hillsVertical,
  mountainsHorizontal,
  mountainsVertical,
  fieldsHorizontal,
  fieldsVertical,
  desertHorizontal,
  desertVertical,
  goldHorizonal,
  goldVertical,
  seaHorizontal,
  seaVertical,
  fogHorizontal,
  fogVertical,
  riverHillsHorizontal,
  riverHillsVertical,
  riverMountainsHorizontal,
  riverMountainsVertical,
  riverPastureHorizontal,
  riverPastureVertical,
  riverSwamplandBottomHorizontal,
  riverSwamplandBottomVertical,
  riverSwamplandTopHorizontal,
  riverSwamplandTopVertical,
  lakeVertical,
  lakeHorizontal,
  oasisHorizontal,
  oasisVertical,
  castleKnightsHorizontal,
  castleKnightsVertical,
  castleRestorationHorizontal,
  castleRestorationVertical,
  quarryHorizontal,
  quarryVertical,
  glassworksHorizontal,
  glassworksVertical,
  two,
  three,
  four,
  five,
  six,
  eight,
  nine,
  ten,
  eleven,
  twelve,
  port3to1WithDocks,
  portBrickWithDocks,
  portGrainWithDocks,
  portOreWithDocks,
  portTimberWithDocks,
  portWoolWithDocks,
} from "../images/index";
import { Hex, HexType, PortType } from "../types/hexes";
import { CatanBoard } from "../types/boards";
import { Paper } from "@mui/material";
import { HEX_HEIGHT, HEX_WIDTH } from "../constants/imageProperties";
import ImageKeeper from "./ImageKeeper";

/**
 * Values are [vertical image, horizontal image]
 */
const hexTypeToImg: { [type in HexType]: [string, string] } = {
  pasture: [pastureVertical, pastureHorizontal],
  forest: [forestVertical, forestHorizontal],
  hills: [hillsVertical, hillsHorizontal],
  mountains: [mountainsVertical, mountainsHorizontal],
  fields: [fieldsVertical, fieldsHorizontal],
  desert: [desertVertical, desertHorizontal],
  sea: [seaVertical, seaHorizontal],
  gold: [goldVertical, goldHorizonal],
  fog: [fogVertical, fogHorizontal],
  riverSwamplandTop: [riverSwamplandTopVertical, riverSwamplandTopHorizontal],
  riverSwamplandBottom: [
    riverSwamplandBottomVertical,
    riverSwamplandBottomHorizontal,
  ],
  riverMountains: [riverMountainsVertical, riverMountainsHorizontal],
  riverHills: [riverHillsVertical, riverHillsHorizontal],
  riverPasture: [riverPastureVertical, riverPastureHorizontal],
  lake: [lakeVertical, lakeHorizontal],
  oasis: [oasisVertical, oasisHorizontal],
  castleKnights: [castleKnightsVertical, castleKnightsHorizontal],
  castleRestoration: [castleRestorationVertical, castleRestorationHorizontal],
  quarry: [quarryVertical, quarryHorizontal],
  glassworks: [glassworksVertical, glassworksHorizontal],
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
    <>
      <ImageKeeper />
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
          {hexes.map(({ type, number, secondNumber, port }, i) => (
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
                src={hexTypeToImg[type][Number(horizontal)]}
                alt={`${type} hex at position ${i}. Positions indices run left to
              right, top to bottom`}
                style={{
                  width: HEX_SIZE,
                  height: HEX_SIZE,
                  position: "absolute",
                  zIndex: 1,
                }}
              />
              {number && secondNumber === undefined && (
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
              {number && secondNumber && (
                <div
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
                    src={String(numberValToImg[number])}
                    alt={`${number} chit at position ${i}`}
                    style={{
                      width: "30%",
                      height: `${(30 * HEX_WIDTH) / HEX_HEIGHT}%`,
                      zIndex: 2,
                      transform: horizontal ? "rotate(-90deg)" : "",
                      marginRight: "5%",
                    }}
                  />
                  <img
                    src={String(numberValToImg[secondNumber])}
                    alt={`${secondNumber} chit at position ${i}`}
                    style={{
                      width: "30%",
                      height: `${(30 * HEX_WIDTH) / HEX_HEIGHT}%`,
                      zIndex: 2,
                      transform: horizontal ? "rotate(-90deg)" : "",
                    }}
                  />
                </div>
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
    </>
  );
}
