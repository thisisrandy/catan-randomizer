# Images

## Adding new hexes

All hex images are ripped using
[pdfimages](https://linux.die.net/man/1/pdfimages) from the Catan pdf manuals,
e.g. [this
one](https://www.catan.com/sites/prod/files/2021-06/catan_base_rules_2020_200707.pdf).
If needed, an alpha channel is added, and then the image is cropped into an
equilateral hexagon. Dimensions are `215x187`. Additional hexes may have higher
(or lower) resolution, but they must maintain the same aspect ratio else they
appear squashed.

As some expansions are played with hexes rotated 90°, two varieties of hexes are produced:

1. A "vertical" hex with images aligned on the vertical axis.
2. A "horizonal" hex where:
   - If a horizontal image is available, it is used rotated -90° (horizontal
     boards are specified at -90° and rotated 90° when drawn). Note that most
     hex images from the various manuals are vertical-only, meaning that the
     soft border around the hex image is oriented with vertices at top and
     bottom.
   - Otherwise, a horizonal version is created by rotating the vertical version
     -120°. This creates the effect of the image being at -30° on horizontal
     boards. The [Seafarers
     manual](https://www.catan.com/sites/prod/files/2021-06/catan-seafarers_2021_rule_book_201201.pdf)
     does this will all terrain hexes except for gold mines, for which a true
     horizontal hex is provided, so we follow their lead here. UPDATE: This can
     now be done automatically by specifying the horizontal image as `"auto"`
     as detailed [below](#using-new-hexes).

Note finally that the soft border color around hex images is slightly different
between some of the manuals. Use a color picker tool to determine the exact
color of the extant hex images and a bucket fill tool with a low threshold to
recolor new hex borders to match.

## Using new hexes

`HexType` is specified in [hexes.ts](../types/hexes.ts). Once a new `HexType` is
added, it can be used to specify new boards in
[expansions.ts](../data/expansions.ts). In order for the new type to display,
new hex images must be imported in [Board.tsx](../components/Board.tsx) and then
added to the constant `hexTypeToImg` at the top of that file.
