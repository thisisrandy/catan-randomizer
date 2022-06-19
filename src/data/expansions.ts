import catanBoardFactory from "../factories/boardFactory";
import {
  CatanBoardTemplate,
  ExpansionName,
  Expansions,
  UseHorizonalLayout,
} from "../types/boards";

// TODO: add seafarers and anything else that makes sense
const templates: [ExpansionName, CatanBoardTemplate, UseHorizonalLayout?][] = [
  [
    "Catan",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 300 } },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "mountains", number: 10 },
        { type: "pasture", number: 2 },
        { type: "forest", number: 9 },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 300 } },
      ],
      [
        { type: "empty" },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 180 },
        },
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
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
      ],
      [
        { type: "sea", fixed: true, port: { type: "brick", orientation: 180 } },
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
        { type: "sea", fixed: true, port: { type: "wool", orientation: 60 } },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 60 } },
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
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "wool", orientation: 300 } },
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
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 300 } },
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
        { type: "sea", fixed: true, port: { type: "ore", orientation: 180 } },
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
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "pasture", number: 9 },
        { type: "mountains", number: 5 },
        { type: "fields", number: 2 },
        { type: "desert" },
        { type: "pasture", number: 3 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true, port: { type: "grain", orientation: 180 } },
        { type: "hills", number: 8 },
        { type: "pasture", number: 4 },
        { type: "pasture", number: 9 },
        { type: "mountains", number: 6 },
        { type: "sea", fixed: true, port: { type: "brick", orientation: 60 } },
      ],
      [
        { type: "sea", fixed: true },
        { type: "mountains", number: 11 },
        { type: "fields", number: 11 },
        { type: "forest", number: 10 },
        { type: "sea", fixed: true, port: { type: "wool", orientation: 0 } },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "timber", orientation: 60 } },
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
  [
    "Cities & Knights",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "brick", orientation: 240 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 300 } },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "hills", number: 6 },
        { type: "mountains", number: 2 },
        { type: "hills", number: 5 },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 300 },
        },
      ],
      [
        { type: "empty" },
        {
          type: "sea",
          fixed: true,
          port: { type: "3:1", orientation: 180 },
        },
        { type: "forest", number: 3 },
        { type: "mountains", number: 9 },
        { type: "desert" },
        { type: "forest", number: 10 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "forest", number: 8 },
        { type: "fields", number: 4 },
        { type: "hills", number: 11 },
        { type: "pasture", number: 3 },
        { type: "fields", number: 8 },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 0 } },
      ],
      [
        { type: "sea", fixed: true, port: { type: "wool", orientation: 180 } },
        { type: "pasture", number: 10 },
        { type: "fields", number: 5 },
        { type: "mountains", number: 6 },
        { type: "pasture", number: 4 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "fields", number: 9 },
        { type: "pasture", number: 12 },
        { type: "forest", number: 11 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 60 } },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 60 } },
        { type: "sea", fixed: true },
      ],
    ],
  ],
  [
    "Seafarers: Heading for New Shores 3-Player Set-up",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "hills", number: 12, group: 2 },
        { type: "goldHorizontal", number: 5, group: 2 },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "pasture", number: 4, group: 2 },
        { type: "mountains", number: 9, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 180 } },
        { type: "fields", number: 4 },
        { type: "pasture", number: 6 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
        { type: "fields", number: 3, group: 2 },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 240 } },
        { type: "pasture", number: 2 },
        { type: "mountains", number: 5 },
        { type: "forest", number: 10 },
        { type: "sea", fixed: true, port: { type: "wool", orientation: 300 } },
        { type: "goldHorizontal", number: 4, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "hills", number: 8 },
        { type: "pasture", number: 10 },
        { type: "pasture", number: 9 },
        { type: "forest", number: 8 },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "fields", number: 11 },
        { type: "mountains", number: 3 },
        { type: "hills", number: 11 },
        { type: "sea", fixed: true },
        { type: "mountains", number: 8, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true, port: { type: "brick", orientation: 180 } },
        { type: "fields", number: 6 },
        { type: "forest", number: 5 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
        { type: "hills", number: 10, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 120 },
        },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
    ],
    true,
  ],
  [
    "Seafarers: Heading for New Shores 4-Player Set-up",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "mountains", number: 8, group: 2 },
        { type: "pasture", number: 11, group: 2 },
        { type: "sea", fixed: true },
        { type: "goldHorizontal", number: 4, group: 2 },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 240 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 300 } },
        { type: "sea", fixed: true },
        { type: "hills", number: 5, group: 2 },
        { type: "mountains", number: 2, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "pasture", number: 5 },
        { type: "forest", number: 6 },
        { type: "mountains", number: 4 },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 300 },
        },
        { type: "forest", number: 9, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 180 } },
        { type: "fields", number: 12 },
        { type: "hills", number: 11 },
        { type: "fields", number: 3 },
        { type: "pasture", number: 9 },
        { type: "sea", fixed: true },
        { type: "goldHorizontal", number: 10, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "hills", number: 6 },
        { type: "forest", number: 10 },
        { type: "desert" },
        { type: "fields", number: 11 },
        { type: "forest", number: 5 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 0 } },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true, port: { type: "wool", orientation: 180 } },
        { type: "mountains", number: 3 },
        { type: "pasture", number: 4 },
        { type: "hills", number: 9 },
        { type: "pasture", number: 8 },
        { type: "sea", fixed: true },
        { type: "hills", number: 3, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "fields", number: 8 },
        { type: "forest", number: 2 },
        { type: "mountains", number: 10 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 60 } },
        { type: "fields", number: 6, group: 2 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "brick", orientation: 60 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
    ],
    true,
  ],
  [
    "Seafarers: The Four Islands 3-Player Set-up",
    [
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "fields", number: 4 },
        { type: "pasture", number: 3, minPipsOnChit: 2 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 300 } },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
        { type: "mountains", number: 4 },
        { type: "forest", number: 9, minPipsOnChit: 2 },
        { type: "sea", fixed: true },
        { type: "fields", number: 9 },
        { type: "hills", number: 5 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "empty" },
        { type: "sea", fixed: true },
        { type: "pasture", number: 6, minPipsOnChit: 2 },
        { type: "mountains", number: 10 },
        { type: "sea", fixed: true, port: { type: "ore", orientation: 60 } },
        { type: "forest", number: 8, minPipsOnChit: 2 },
        { type: "hills", number: 11 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "empty" },
        { type: "sea", fixed: true },
        {
          type: "sea",
          fixed: true,
          port: { type: "timber", orientation: 300 },
        },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true, port: { type: "brick", orientation: 120 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "fields", number: 11 },
        { type: "mountains", number: 8 },
        { type: "forest", number: 3, minPipsOnChit: 2 },
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 240 } },
        { type: "hills", number: 10 },
        { type: "hills", number: 6 },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true, port: { type: "3:1", orientation: 120 } },
        { type: "forest", number: 5, minPipsOnChit: 2 },
        { type: "pasture", number: 9, minPipsOnChit: 2 },
        { type: "sea", fixed: true },
        { type: "mountains", number: 2 },
        { type: "fields", number: 5 },
        { type: "sea", fixed: true, port: { type: "grain", orientation: 60 } },
      ],
      [
        { type: "sea", fixed: true },
        { type: "pasture", number: 12, minPipsOnChit: 2 },
        { type: "sea", fixed: true, port: { type: "wool", orientation: 60 } },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
      [
        { type: "sea", fixed: true },
        { type: "sea", fixed: true },
      ],
    ],
    true,
  ],
];

export const EXPANSIONS: Expansions = new Map(
  templates.map(([key, template, horizontal]) => [
    key,
    catanBoardFactory(template, horizontal),
  ])
);
