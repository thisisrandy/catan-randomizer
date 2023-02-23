![CI](https://github.com/thisisrandy/catan-randomizer/actions/workflows/main.yml/badge.svg)

# Catan Randomizer

<p align="center">
  <img alt="demo gif" src="demo.gif" />
</p>

This is a hobby project to produce randomized [Catan](https://www.catan.com) boards under
constraints, e.g. `6` and `8` can't touch, or the
[pip](<https://en.wikipedia.org/wiki/Pip_(counting)>) count for each intersection
can't exceed a certain total. It is deployed
[here](https://catan-randomizer.vercel.app/).

While the same idea has been executed
[many](https://jkirschner.github.io/catan-randomizer/)
[times](https://catan.bunge.io/)
[before](https://alexbeals.com/projects/catan/), this project supports fairness
constraints and [Catan
Expansions](https://www.catan.com/explore-catan/catan-core-family-games) that
aren't seen elsewhere.

## Supported Constraints

- 6 & 8 can't touch
- 2 & 12 can't touch
- Same number can't touch
- Limit on the size of groups of same-type terrain
- Limit on the total pip count of intersections
- Lower limit on the number of islands created for the _Seafarers: New World_
  scenario. See [New World](#on-the-new-world-scenario) for details

## Supported Expansions/Extensions/Scenarios

### Catan

Both [Catan](https://www.catan.com/catan) and [Catan: 5-6 Player
Extension](http://catanshop.com/the-settlers-of-catan-5-6-player-extension)
supported.

### Cities & Knights

See [Cities & Knights](https://www.catan.com/cities-knights). Note that this is
identical to [Catan](#catan) except for the recommended beginner setup.

### Explorers & Pirates

Starting island for [Explorers &
Pirates](https://www.catan.com/explorers-pirates), including the recommended
setup for combining with _Cities & Knights_ (see the "Possible Combinations"
tab on the [Explorers & Pirates product
page](https://www.catan.com/explorers-pirates)). There's no way to set up the
hidden islands face down without involving a third party, and assigned number
chits are gameplay-dependent, so no attempt is made to shuffle those.

### Seafarers

All [Seafarers](https://www.catan.com/seafarers) scenarios are supported,
including some custom _New World_ scenarios. Pains have been taken to observe
every aspect of variable setup specified in the manual for each scenario,
including things like shuffling the main and foreign islands separately,
restricting the pip count of certain positions or terrain types, and not
shuffling some/all islands and/or ports.

#### On the _New World_ scenario

_New World_ is the final, fully randomized scenario for _Seafarers_.

- Ports are shuffled such that they are placed with both docks pointing at a
  terrain hex such that no more than one total dock points at any given
  intersection. Within those constraints, they are allowed to appear on any sea
  hex in this scenario. However, you may feel free to ignore random placement
  and instead use the instructions from the manual (_"Shuffle... with their
  reverse sides facing up. Starting with the oldest player... each takes a
  [port] and places it..."_)
- A _Min Island Count_ setting specific to this scenario is provided from the
  settings menu. You can use it to specify a lower limit on the number of
  distinct islands generated during the shuffling process.
- There are two additional scenarios provided which do not appear in the
  manual:
  - _New World Expanded_: Same as _New World_ but using the full
    frame and all terrain hexes, i.e. adding the 3 deserts, 2 gold fields, and
    remaining hill and mountain hexes (1 each). There is one more number chit
    than resource-producing hex[^1], so, following the _The Wonders of Catan_
    scenario, the second 12 chit is excluded. It is recommended to increase the
    victory point goal for this board to 14
  - _New World Islands_: Same as _New World Expanded_, but with
    distinct and separately-shuffled main and foreign island areas
    - Following the _Through the Desert_ scenario, gold fields and some of the
      better number chits are reserved for the foreign island area. Players can
      choose to allow or disallow initial settlements on the foreign island
      area by preference, but the latter is recommended
    - Under the _Min Island Count_ constraint, the main island is included in
      the count

[^1]:
    For the curious, the extra chit is used exclusively in the _Cloth for
    Catan_ scenario, where each cloth island has a chit on both its east and
    west sides representing separate villages

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
permission. Additionally, the [favicon](https://en.wikipedia.org/wiki/Favicon)
is the same as that used at [catan.com](https://en.wikipedia.org/wiki/Favicon).
As I do not profit in any way from this project, this usage appears to be in
line with the [Catan IP
guidelines](https://www.catan.com/guidelines-dealing-intellectual-property-catan).
However, on the off chance that you are associated with CATAN GmbH and feel that
this project harms your brand in any way, it will be swiftly and
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
