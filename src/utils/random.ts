/**
 * Randomly select one of the items in `options` with equal weight given to
 * each item
 */
export function select<T>(...options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}
