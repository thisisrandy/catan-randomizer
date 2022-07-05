/**
 * There is no native support for Map (de)serialization, but it is easily
 * supported via the replacer/reviver functions which can be passed to
 * JSON.stringify/JSON.parse, respectively. The code below is modified from
 * https://stackoverflow.com/a/56150320/12162258.

 * Date is also not supported, but it suffers from an additional devious trick:
 * Date.toJSON is called *before* the replacer, so any dates are already
 * stringified once they reach replace. However, according to
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter,
 * "The object in which the key was found is provided as the replacer's this
 * parameter," so we can look up the real object there. Another option is to
 * save Date.prototype.toJSON in a temp var, delete it, run JSON.stringify, and
 * then replace it from the temp var.
 */

/**
 * A `replacer` function for `JSON.stringify` that supports `Map` and `Date`
 * types. Use associated `reviver` to deserialize
 */
export function replacer(
  this: { [key: string]: [value: any] },
  key: string,
  value: any
) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: [...value],
    };
  } else if (this[key] instanceof Date) {
    return {
      dataType: "Date",
      value: value,
    };
  } else {
    return value;
  }
}

/**
 * A `reviver` function for `JSON.parse` that supports `Map` and `Date` types.
 * Use associated `replacer` to stringify
 */
export function reviver(_: string, value: any) {
  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.dataType === "string"
  ) {
    switch (value.dataType) {
      case "Map":
        return new Map(value.value);
      case "Date":
        return new Date(value.value);
    }
  }
  return value;
}
