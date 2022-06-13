/** Hex height, in pixels */
export const HEX_HEIGHT = 215;
/** Hex width, in pixels */
export const HEX_WIDTH = 187;
/**
 * The length, in pixels, of each hex side
 */
export const SIDE_LENGTH = 107;
/**
 * If we split each hex into a top triangle, middle rectangle, and bottom
 * triangle, this is the height of the triangles
 */
export const TRIANGLE_ALTITUDE = (HEX_HEIGHT - SIDE_LENGTH) / 2;
/**
 * When drawing hexes in a grid, the ratio between triangle altitude and side
 * length can be expressed in CSS
 * [fr](https://www.w3.org/TR/css3-grid-layout/#fr-unit) units to maintain the
 * equilateral appearance of hexes. This is that ratio
 */
export const TRIANGLE_TO_SIDE_RATIO = TRIANGLE_ALTITUDE / SIDE_LENGTH;
