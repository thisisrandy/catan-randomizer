import "../css/board.css";
import {
  pastureVertical,
  forestVertical,
  hillsVertical,
  mountainsVertical,
  fieldsVertical,
  desertVertical,
  goldHorizontal,
  goldVertical,
  seaHorizontal,
  seaVertical,
  fogHorizontal,
  fogVertical,
  riverHillsVertical,
  riverMountainsVertical,
  riverPastureVertical,
  riverSwamplandBottomVertical,
  riverSwamplandTopVertical,
  lakeVertical,
  oasisVertical,
  castleKnightsVertical,
  castleRestorationVertical,
  quarryVertical,
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
  fish4,
  fish5,
  fish6,
  fish8,
  fish9,
  fish10,
} from "../images/index";
import { Hex, HexType, PortType } from "../types/hexes";
import { CatanBoard } from "../types/boards";
import { Paper } from "@mui/material";
import { HEX_HEIGHT, HEX_WIDTH } from "../constants/imageProperties";
import ImageKeeper from "./ImageKeeper";

/**
 * Values are [vertical image, horizontal image]. Since very few hexes have a
 * true horizontal image found in the game manual images, the string "auto" can
 * also be used for the horizontal image. In this case, the vertical image is
 * simply rotated -30° (-120° + 90° for whole board rotation for horizontal
 * boards). See the README in src/images
 */
const hexTypeToImg: { [type in HexType]: [string, string | "auto"] } = {
  pasture: [pastureVertical, "auto"],
  forest: [forestVertical, "auto"],
  hills: [hillsVertical, "auto"],
  mountains: [mountainsVertical, "auto"],
  fields: [fieldsVertical, "auto"],
  desert: [desertVertical, "auto"],
  sea: [seaVertical, seaHorizontal],
  gold: [goldVertical, goldHorizontal],
  fog: [fogVertical, fogHorizontal],
  riverSwamplandTop: [riverSwamplandTopVertical, "auto"],
  riverSwamplandBottom: [riverSwamplandBottomVertical, "auto"],
  riverMountains: [riverMountainsVertical, "auto"],
  riverHills: [riverHillsVertical, "auto"],
  riverPasture: [riverPastureVertical, "auto"],
  lake: [lakeVertical, "auto"],
  oasis: [oasisVertical, "auto"],
  castleKnights: [castleKnightsVertical, "auto"],
  castleRestoration: [castleRestorationVertical, "auto"],
  quarry: [quarryVertical, "auto"],
  glassworks: [glassworksVertical, "auto"],
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

const fishNumberToImg = [
  null,
  null,
  null,
  null,
  fish4,
  fish5,
  fish6,
  null,
  fish8,
  fish9,
  fish10,
];

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
          {hexes.map(
            (
              { type, number, secondNumber, orientation, port, fishTile },
              i
            ) => (
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
                  src={
                    hexTypeToImg[type][Number(horizontal)] === "auto"
                      ? hexTypeToImg[type][0]
                      : hexTypeToImg[type][Number(horizontal)]
                  }
                  alt={`${type} hex at position ${i}. Positions indices run left to
              right, top to bottom`}
                  style={{
                    width: HEX_SIZE,
                    height: HEX_SIZE,
                    position: "absolute",
                    zIndex: 1,
                    transform: `rotate(${
                      (orientation || 0) +
                      Number(
                        hexTypeToImg[type][Number(horizontal)] === "auto" &&
                          -120
                      )
                    }deg)`,
                  }}
                />
                {number && secondNumber === undefined && (
                  <img
                    src={numberValToImg[number]!}
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
                      src={numberValToImg[number]!}
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
                      src={numberValToImg[secondNumber]!}
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
                {fishTile && (
                  <img
                    src={fishNumberToImg[fishTile.number]!}
                    alt={`${fishTile.number} fish tile at position ${i}`}
                    style={{
                      zIndex: 2,
                      width: HEX_SIZE,
                      height: HEX_SIZE,
                      transform: `rotate(${fishTile.orientation}deg)`,
                      position: "absolute",
                    }}
                  />
                )}
              </div>
            )
          )}
        </div>
      </Paper>
    </>
  );
}
