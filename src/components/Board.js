import "../css/board.css";
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

// TODO: convert this back into typescript

const hexToGridArea = [
  "1 / 3 / 4 / 5",
  "1 / 5 / 4 / 7",
  "1 / 7 / 4 / 9",
  "3 / 2 / 6 / 4",
  "3 / 4 / 6 / 6",
  "3 / 6 / 6 / 8",
  "3 / 8 / 6 / 10",
  "5 / 1 / 8 / 3",
  "5 / 3 / 8 / 5",
  "5 / 5 / 8 / 7",
  "5 / 7 / 8 / 9",
  "5 / 9 / 8 / 11",
  "7 / 2 / 10 / 4",
  "7 / 4 / 10 / 6",
  "7 / 6 / 10 / 8",
  "7 / 8 / 10 / 10",
  "9 / 3 / 12 / 5",
  "9 / 5 / 12 / 7",
  "9 / 7 / 12 / 9",
];

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

/**
 * `Board` is the display logic for a Catan board, it's props is an array of hexes,
 * each with a coordinate, type, and number chit value
 */
export default function Board({ hexes }) {
  // if we split each hex into a top triangle, a middle rectangle, and a bottom
  // triangle, this weird number is the ratio of of the height of one of the
  // triangles to that of the rectangle. more or less. it's also the number that
  // looks right
  const smallRowSize = 5 / 11;

  return (
    <div
      id="board"
      style={{
        margin: 20,
        justifyItems: "center",
        alignItems: "center",
        display: "grid",
        // TODO: I'm ignoring border pieces for now. they significantly
        // complicate things
        gridTemplateColumns: "repeat(10, 1fr)",
        gridTemplateRows: `${smallRowSize}fr 1fr `
          .repeat(5)
          .concat(`${smallRowSize}fr`),
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
            gridArea: hexToGridArea[i],
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
              src={numberValToImg[number]}
              alt={number}
              style={{
                width: "35%",
                height: "30%",
                position: "absolute",
                zIndex: 2,
              }}
            ></img>
          )}
        </div>
      ))}
    </div>
  );
}
