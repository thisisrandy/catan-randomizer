import catanBoardFactory from "../factories/boardFactory";
import { CatanBoardTemplate, ExpansionName, Expansions } from "../types/boards";

// TODO: add seafarers and anything else that makes sense
// this won't be properly type checked if we feed it directly to the Map
// constructor. see https://github.com/microsoft/TypeScript/issues/49500
const templates: [ExpansionName, CatanBoardTemplate][] = [
  [
    "Catan",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "mountains", number: 10 },
        { type: "pasture", number: 2 },
        { type: "forest", number: 9 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "fields", number: 12 },
        { type: "hills", number: 6 },
        { type: "pasture", number: 4 },
        { type: "hills", number: 10 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "fields", number: 9 },
        { type: "forest", number: 11 },
        { type: "desert" },
        { type: "forest", number: 3 },
        { type: "mountains", number: 8 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "forest", number: 8 },
        { type: "mountains", number: 3 },
        { type: "fields", number: 4 },
        { type: "pasture", number: 5 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "hills", number: 5 },
        { type: "fields", number: 6 },
        { type: "pasture", number: 11 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
    ],
  ],
  [
    "Catan: 5-6 Player Extension",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "forest", number: 4 },
        { type: "pasture", number: 5 },
        { type: "fields", number: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "hills", number: 6 },
        { type: "mountains", number: 11 },
        { type: "hills", number: 10 },
        { type: "pasture", number: 8 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "desert" },
        { type: "forest", number: 12 },
        { type: "fields", number: 12 },
        { type: "forest", number: 9 },
        { type: "fields", number: 4 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "fields", number: 3 },
        { type: "forest", number: 10 },
        { type: "mountains", number: 3 },
        { type: "hills", number: 6 },
        { type: "hills", number: 5 },
        { type: "forest", number: 8 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "pasture", number: 9 },
        { type: "mountains", number: 5 },
        { type: "fields", number: 2 },
        { type: "desert" },
        { type: "pasture", number: 3 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "hills", number: 8 },
        { type: "pasture", number: 4 },
        { type: "pasture", number: 9 },
        { type: "mountains", number: 6 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "mountains", number: 11 },
        { type: "fields", number: 11 },
        { type: "forest", number: 10 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
    ],
  ],
  [
    "Explorers & Pirates",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "mountains", number: 11 },
        { type: "forest", number: 9 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "fields", number: 3 },
        { type: "pasture", number: 8 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "hills", number: 4 },
        { type: "pasture", number: 10 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "pasture", number: 6, fixed: true },
        { type: "mountains", number: 12 },
        { type: "forest", number: 8 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "fields", number: 10 },
        { type: "pasture", number: 4 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "forest", number: 11 },
        { type: "hills", number: 6 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "mountains", number: 3 },
        { type: "forest", number: 5 },
        { type: "sea", fixed: true },
      ],
    ],
  ],
];

export const EXPANSIONS: Expansions = new Map(
  templates.map(([key, val]) => [key, catanBoardFactory(val)])
);
