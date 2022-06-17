import React, { useState, useEffect } from "react";

/**
 * Just like `useState`, but checks `localStorage` for `key` before
 * initializing. If `key` is found, the data stored there is used, and
 * `initialValue` otherwise. Data is jsonified and stored in `localStorage` on
 * every change. If `filter` is specified and `T` is an array, `filter` is
 * applied to the array before every write. Likely not performant on complex or
 * frequently-written data.
 *
 * Note that not all types have native JSON support. Of those, `Map` and `Date`
 * are currently supported by this function. Behavior for any other unsupported
 * type is to become a string or disappear entirely, e.g. as with function
 * types, per the [ECMA
 * spec](https://tc39.es/ecma262/multipage/structured-data.html#sec-json.stringify)
 */
export function useStateWithLocalStorage<T>(
  key: string,
  initialValue: T,
  filter: (value: any, index: number, array: any[]) => boolean = () => true
): [T, React.Dispatch<React.SetStateAction<T>>] {
  if (key in localStorage)
    initialValue = JSON.parse(localStorage.getItem(key)!, reviver);
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    localStorage.setItem(
      key,
      JSON.stringify(
        Array.isArray(value) ? value.filter(filter) : value,
        replacer
      )
    );
  }, [key, filter, value]);

  return [value, setValue];
}

// there is no native support for Map (de)serialization, but it is easily
// supported via the replacer/reviver functions which can be passed to
// JSON.stringify/JSON.parse, respectively. stolen shamelessly from
// https://stackoverflow.com/a/56150320/12162258

// Date is also not supported, but it suffers from an additional devious trick:
// Date.toJSON is called *before* the replacer, so any dates are already
// stringified once they reach replace. however, according to
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter,
// "The object in which the key was found is provided as the replacer's this
// parameter," so we can look up the real object there. another option is to
// save Date.prototype.toJSON in a temp var, delete it, run JSON.stringify, and
// then replace it from the temp var

function replacer(
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

function reviver(_: string, value: any) {
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
