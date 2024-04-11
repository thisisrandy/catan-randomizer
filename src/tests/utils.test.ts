import {
  compareHexType,
  hexToPipCount,
  numberToPipCount,
} from "../utils/catan";

describe("Catan utils", () => {
  it("should return the correct number of pips for every valid number", () => {
    expect(numberToPipCount(2)).toBe(1);
    expect(numberToPipCount(3)).toBe(2);
    expect(numberToPipCount(4)).toBe(3);
    expect(numberToPipCount(5)).toBe(4);
    expect(numberToPipCount(6)).toBe(5);
    expect(numberToPipCount(8)).toBe(5);
    expect(numberToPipCount(9)).toBe(4);
    expect(numberToPipCount(10)).toBe(3);
    expect(numberToPipCount(11)).toBe(2);
    expect(numberToPipCount(12)).toBe(1);
  });

  it("should return the correct number of pips for combinations of numbers", () => {
    expect(
      hexToPipCount({ type: "mountains", number: 2, secondNumber: 12 })
    ).toBe(2);
    expect(
      hexToPipCount({ type: "mountains", number: 6, secondNumber: 12 })
    ).toBe(6);
    expect(
      hexToPipCount({ type: "mountains", number: 10, secondNumber: 10 })
    ).toBe(6);
  });

  it("should correctly compare all hex type pairs", () => {
    expect(
      compareHexType({ type: "mountains" }, { type: "riverMountains" })
    ).toBe(true);
    expect(
      compareHexType({ type: "riverMountains" }, { type: "riverMountains" })
    ).toBe(true);
    expect(compareHexType({ type: "hills" }, { type: "riverHills" })).toBe(
      true
    );
    expect(compareHexType({ type: "riverHills" }, { type: "riverHills" })).toBe(
      true
    );
    expect(compareHexType({ type: "pasture" }, { type: "riverPasture" })).toBe(
      true
    );
    expect(
      compareHexType({ type: "riverPasture" }, { type: "riverPasture" })
    ).toBe(true);
    expect(
      compareHexType({ type: "desert" }, { type: "oasis", spinFreely: true })
    ).toBe(true);
    expect(
      compareHexType({ type: "mountains" }, { type: "riverPasture" })
    ).toBe(false);
    expect(compareHexType({ type: "mountains" }, { type: "riverHills" })).toBe(
      false
    );
    expect(compareHexType({ type: "hills" }, { type: "riverMountains" })).toBe(
      false
    );
    expect(
      compareHexType({ type: "pasture" }, { type: "riverMountains" })
    ).toBe(false);
    expect(compareHexType({ type: "fields" }, { type: "fields" })).toBe(true);
  });
});
