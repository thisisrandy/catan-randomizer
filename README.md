![CI](https://github.com/thisisrandy/catan-randomizer/actions/workflows/main.yml/badge.svg)

# Catan Randomizer

<p align="center">
  <img alt="demo gif" src="demo.gif" />
</p>

This is a hobby project to produce randomized [Catan](https://www.catan.com) boards under
constraints, e.g. `6` and `8` can't touch, or the
[pip](<https://en.wikipedia.org/wiki/Pip_(counting)>) count for each
intersection (the sum of pips on adjacent [number
chits](<https://en.wikipedia.org/wiki/Chit_(board_wargames)>)) can't exceed a
certain total. It is deployed [here](https://catan-randomizer.vercel.app/).

While the same idea has been executed
[many](https://jkirschner.github.io/catan-randomizer/)
[times](https://catan.bunge.io/)
[before](https://alexbeals.com/projects/catan/), this project supports [fairness
constraints](#supported-constraints), [Catan
Expansions](https://www.catan.com/explore-catan/catan-core-family-games), and
[custom](#expanded-versions)
[scenarios](#everything%2C-everywhere%2C-all-at-once) that aren't seen
elsewhere.

## Supported Constraints

- 6 & 8 can't touch
- 2 & 12 can't touch
- Same number can't touch
- Limit on the size of groups of same-type terrain
- Limit on the total pip count of intersections
- For scenarios featuring a variable number of islands, a lower limit on the
  number of islands created. See
  [Seafarers](#on-scenarios-with-a-variable-number-of-islands) for details

## Supported Expansions/Extensions/Scenarios

### Catan

Both [Catan](https://www.catan.com/catan) and [Catan: 5-6 Player
Extension](http://catanshop.com/the-settlers-of-catan-5-6-player-extension)
are supported.

### Cities & Knights

[Cities & Knights](https://www.catan.com/cities-knights), which is identical to
[Catan](#catan) except for the recommended beginner setup, is supported.

### Explorers & Pirates

Shuffling of the starting island for [Explorers &
Pirates](https://www.catan.com/explorers-pirates) is supported, as is the
recommended starting island for combining with _Cities & Knights_ (see the
"Possible Combinations" tab on the [Explorers & Pirates product
page](https://www.catan.com/explorers-pirates)). There's no way to set up the
hidden islands face down without involving a third party, and assigned number
chits are gameplay-dependent, so no attempt is made to shuffle those.

### Seafarers

All [Seafarers](https://www.catan.com/seafarers) scenarios are supported,
including some custom _New World_ scenarios as well as a partially shuffled
version of the _The Pirate Islands_ scenario. Pains have been taken to observe
every aspect of variable setup specified in the manual for each scenario,
including things like shuffling the main and foreign islands separately,
restricting the pip count of certain positions or terrain types, and not
shuffling some/all islands and/or ports.

#### On scenarios with a variable number of islands

Some _Seafarers_ scenarios allow a variable number of islands to be created
during terrain shuffling. For these, a _Min Island Count_ constraint is
provided from the settings menu to allow for more control over the number of
distinct islands generated during the shuffling process. For scenarios which
have well-defined "main" and "foreign" islands, the main island is included in
this count.

The following scenarios support this constraint:

- _Heading for New Shores_
- _Through the Desert_
- _New World_
- _New World Expanded_
- _New World Islands_
- _Everything, Everywhere, All at Once, Variable_
- _Seafarers & Pirates, Variable_

Note that the maximum feasible number of islands is different from scenario to
scenario. For example, the shuffler can usually find a 7 island board for _New
World_, but since there are only two variable sea hexes in _Through the
Desert_, no more than 4 islands are possible. The shuffler will alert you if
the board is over-constrained in this or any other way.

#### On the _New World_ scenario

_New World_ is the final, fully randomized scenario for _Seafarers_.

Ports are shuffled such that they are placed with both docks pointing at a
terrain hex and no more than one total dock pointing at any given intersection.
Within those constraints, they are allowed to appear on any sea hex in this
scenario. However, you may feel free to ignore random placement and instead use
the instructions from the manual (_"Shuffle... with their reverse sides facing
up. Starting with the oldest player... each takes a [port] and places it..."_).

##### Expanded versions

There are two additional scenarios provided which do not appear in the manual:

- _New World Expanded_: Same as _New World_ but using the full frame and all
  terrain hexes, i.e. adding the 3 deserts, 2 gold fields, and remaining hill
  and mountain hexes (1 each). Gold fields are restricted to 3 or fewer pips to
  prevent overly favorable initial settlement opportunities. There is one more
  number chit than resource-producing hex[^2], so, following the _The Wonders
  of Catan_ scenario, the second 12 chit is excluded. It is recommended to
  increase the victory point goal for this board to 14
- _New World Islands_: Same as _New World Expanded_, but with distinct and
  separately-shuffled main and foreign island areas. Following the _Through the
  Desert_ scenario, gold fields and some of the better number chits are
  reserved for the foreign island area. You can choose to allow or disallow
  initial settlements in the foreign island area, but the latter is
  recommended. Since gold fields can only appear on foreign islands, the pip
  restriction from _New World Expanded_ is removed

[^2]:
    For the curious, the extra number chit is used exclusively in the _Cloth
    for Catan_ scenario, where each cloth island has a number chit on both its
    east and west sides representing separate villages

#### On the _The Pirate Islands_ scenario

The manual claims, _"This scenario is balanced only if the given set-up is
maintained. Therefore, it should not be varied, except for the [ports]."_ These
instructions are respected in the _The Pirate Islands_ scenario, but fair
variable setups can still be achieved if we just fix the terrain and numbers of
the outer ("pirate") islands and the upper ("western") coastline of the main
("eastern") island. A _The Pirate Islands (Shuffled)_ scenario is provided
which shuffles the remaining hexes and number chits as well as the ports.

Note that this is a tightly constrained scenario; you may need to relax your
constraint settings in order to successfully shuffle it.

### Everything, Everywhere, All at Once

The "Possible Conbinations" sections of both the
[Seafarers](https://www.catan.com/seafarers) and [Explorers &
Pirates](https://www.catan.com/explorers-pirates) pages claim, "In the
[Seafarers and Explorers & Pirates] expansions, the ways of using ships and
settling new islands are so fundamentally different from each other that it is
**impossible to combine the expansions**. Besides, combining them doesn't make
much sense anyway. If you use a settler ship, you reach a new building site for
a settlement faster and more cost-effectively than when stringing together
various ships."

We claim that they haven't tried hard enough. Enter the _Everything,
Everywhere, All at Once_ scenario, which combines _Explorers & Pirates_,
_Seafarers_, and _Cities & Knights_ ([optional](#scenarios)).

<p align="center">
  <img alt="EEAatO.png" src="EEAatO.png" />
</p>

**NB:** The _Orange Sun_ and _Green Moon_ islands, which, as noted
[above](#explorers-%26-pirates), must be manually shuffled, are not depicted by
the randomizer. Instead, an empty space between the main and _Far Islands_ is
diplayed. See the [rules](#rules).

#### Scenarios

- _Everything, Everywhere, All at Once_ - Combines _Explorers & Pirates_,
  _Seafarers_, and _Cities & Knights_. Play to 27 VP.
- _Everything, Everywhere, All at Once, Variable_ - Same as _Everything,
  Everywhere, All at Once_, but with variable island shuffling. Subject to the
  [Min Islands](#on-scenarios-with-a-variable-number-of-islands) constraint.
- _Seafarers & Pirates_ - Combines _Explorers & Pirates_ and _Seafarers_. Play
  to 22 VP.
- _Seafarers & Pirates, Variable_ - Same as _Seafarers & Pirates_, but with
  variable island shuffling. Subject to the [Min
  Islands](#on-scenarios-with-a-variable-number-of-islands) constraint.

#### Rules

For brevity, _Explorers & Pirates_ is abbreviated _EP_, _Seafarers_ as _SF_,
and _Cities & Knights_ as _CK_:

- **Setup**:
  1. Begin by assembling the final scenario for _EP_. Remember to substitute
     an additional fields hex for a forest hex if playing in combination with
     _CK_ (w/and w/o _CK_ scenarios are provided via this app).
  2. Then, using the 2 two hex length and 2 one hex length border pieces from
     _SF_, further extend the long side borders by three hex lengths on each
     side.
  3. Using _SF_ hexes and number chits, create an addition 5 islands
     (henceforth _Far Islands_) as specified on the far side of the world.
- **Objective**: If playing with just _EP_ and _SF_, play is to 22 (17 for _EP_ + 5
  for _SF_). If also using _CK_, add an additional 5 points, for a grand total
  of 27 VPs.
- **Robber & Pirate**:
  - Only the _EP_ pirate is used. **VARIATION**: Add the robber. When any
    action that would move the robber or pirate occurs, the initiating players
    gets to choose which they will move.
  - Per the _EP_ rules, the pirate can be placed on any sea hex except along
    the coastline of the _EP_ main island, including in the area around the
    _Far Islands_. Also, per the _EP_ rules, this _does not_ include border
    pieces.
  - The pirate's interaction with _EP_ ships and _SF_ shipping routes is the same
    as specified in the rules for each expansion. In particular:
    - _EP_: Ships may not move past the pirate without paying tribute unless
      the pirate is the same color as them. Ships may do battle with the
      pirate during the player's movement phrase as per the _EP_ rules.
    - _SF_: The pirate prevents any building or open shipping route movement
      on any adjacent route. The _SF_ pirate is neutral, so _all players_ are
      affected regardless of the pirate piece color.
- **Settling Foreign Islands**:
  - Catan chits (_SF_) worth one VP each are awarded for each player's _first_
    settlement on each of the _Far Islands only_. Settlements on any part of
    the _Orange Sun_ or _Green Moon_ islands (_EP_) are _not_ thusly rewarded.
  - _Orange Sun_ and _Green Moon_ islands (_EP_) may be settled either with a
    settler ship (_EP_) or by building a shipping route (_SF_) to an
    intersection and then building a settlement. Note that the only compelling
    reason to do the latter is if you are using all of your _EP_ ships for
    something else.
  - The _Far Islands_ may _only_ be settled by building a shipping route (_SF_)
    to abut them and then building a settlement. In this way, an extra element
    of play and strategy is introduced: there is a race to build settlements on
    the far side of the _Orange Sun_ and _Green Moon_ islands so that a
    shipping route can be build from them towards one or more of the lucrative
    _Far Islands_.
- **Shipping Route (_SF_)/Ship (_EP_) Interaction**: None. _EP_ ships may sail freely through
  _SF_ shipping routes and vice-versa.
- **Ports & Trade**: The basic trading rate for _EP_ is 3:1, and it remains so
  here. However, all the 2:1 ports are in play, but only in the seas
  surrounding the _Far Islands_. **VARIATION**: Since it is no small feat to
  build a settlement on the _Far Islands_, players may wish to increase the
  favorability of trades from these ports to 1:1. Make sure to agree beforehand
  on which rate you wish to use.
- **Gold Mines**:
  - _Orange Sun_ and _Green Moon_ islands: Treat these as in _EP_. A
    settlement or harbor settlement built adjacent one of these mines (after
    the resident pirates are driven away, of course) produces 2 gold, and a
    city produces 4 gold.
  - _Far Islands_: Treat these as in _SF_. A settlement produces one resource
    of the player's choice, and a city produces two. While there's little
    compelling reason to do so until the endgame (e.g. for victory points that
    are slightly cheaper than cities, or if cities have run out), players may
    build harbor settlements on the _Far Islands_. If they do, harbor
    settlement production is the same as basic settlements, per usual.
  - **VARIATION**: Treat all gold mines identically in the manner of your
    choosing. Remember to agree on this beforehand.

## Other Features

- Save/load boards to/from [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- Generate sharing links for saved boards

## Contributing

Pull requests are welcome! In particular, I haven't played every expansion and
kind of ran out of steam including the ones I don't even own, so if there's a
board configuration you'd like to see made available, please contribute!

Also, my graphic design skills are basic and uncultivated, so if something about
the aesthetics of the project is cringe-worthy to your much more refined eye,
please feel free to fix it.

The codebase is small and follows the general structure of a
[create-react-app](https://create-react-app.dev/) project, so it should be easy
to dive into, but here are some tips:

- Board definitions are in [src/data/expansions.ts](src/data/expansions.ts), and
  expansion names are in [src/types/boards.ts](src/types/boards.ts). Provided that
  any restrictions on variable setup can be encoded in a `CatanBoardTemplate` (see
  [boards.ts](src/types/boards.ts) for details), adding a new board is
  just a matter of adding a new board definiton and expansion name in these two
  files.
- All code and docs are formatted using [Prettier](https://prettier.io/) with
  default options. Any PRs should be, too.
- All shuffling logic is thoroughly tested and fully passing. Any fixes or
  additions should be, too.

## Attribution

All images are [ripped](https://en.wikipedia.org/wiki/Pdfimages) from the pdf
manuals found at [catan.com](https://www.catan.com/) and used without explicit
permission. The [favicon](https://en.wikipedia.org/wiki/Favicon) is a
cut-and-paste job of the front cover of the manual. As I do not profit in any
way from this project, this usage appears to be in line with the [Catan IP
guidelines](https://www.catan.com/guidelines-dealing-intellectual-property-catan).
However, on the off chance that you are associated with CATAN GmbH and feel
that this project harms your brand in any way, it will be swiftly and
enthusiastically scrubbed from public existence upon request.

## Uh, ports? Don't you mean harbors?

You may have noticed that the word "port" is used pervasively to refer to what
the Catan manuals call "harbors." I didn't do this on purpose, but once I
realized my mistake, I also realized it was actually a correction.
[Here](http://www.differencebetween.net/language/difference-between-port-and-harbor/)
are some appropriate definitions:

**harbor** _noun_ A place of safety for ships and other waterborne vessels.

**port** _noun_ A commercial water facility used for ships and their cargo.

In other words, since harbors are just mooring areas and have nothing to do with
goods and trade, what we have in Catan are more aptly called ports.
