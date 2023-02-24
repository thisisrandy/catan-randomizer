import React, { useState, useEffect } from "react";
import { replacer, reviver } from "../utils/serialization";

const VER_KEY = "_version";
const VAL_KEY = "_value";

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
 *
 * State versioning is also supported via the `version` and `updaters`
 * parameters. A missing version is treated as `1`. If stored state is below the
 * specified `version`, the functions in `updaters` are incrementally applied
 * until the current version is reached. As an example, imagine that 3 versions
 * of the `Foo` interface exist:
 *
 * ```ts
 * interface FooV1 { bar: number }
 * interface FooV2 { bar: number, baz: number }
 * interface FooV3 { baz: number }
 * ```
 *
 * Version 2 adds the `baz` property, and version 3 removes the `bar` property.
 * Therefore, `updaters` should be defined as follows:
 *
 * ```ts
 * {
 *    1: (prev) => ({ ...prev, baz: 1 }), // or suitable default value for `baz`
 *    2: ({ bar, ...rest }) => rest
 * }
 * ```
 *
 * Privately, state is wrapped in a object with a  `_version` property to track
 * the version of stored state.
 */
export function useStateWithLocalStorage<T>(
  key: string,
  initialValue: T,
  filter: (value: any, index: number, array: any[]) => boolean = () => true,
  version: number = 1,
  updaters: { [key: number]: (prev: any) => any } = {}
): [T, React.Dispatch<React.SetStateAction<T>>] {
  if (key in localStorage) {
    const parsed = JSON.parse(localStorage.getItem(key)!, reviver);
    let storedVersion: number;
    // before versioning was introduced, the value was stored as is, so we need
    // to check if the stored version is wrapped or not. an unwrapped value is
    // assumed to be at version 1
    if (isObject(parsed) && parsed.hasOwnProperty(VER_KEY)) {
      storedVersion = parsed[VER_KEY];
      initialValue = parsed[VAL_KEY];
    } else {
      initialValue = parsed;
      storedVersion = 1;
    }
    while (storedVersion < version) {
      initialValue = updaters[storedVersion](initialValue);
      storedVersion++;
    }
  }
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const wrapped = {
      [VER_KEY]: version,
      [VAL_KEY]: Array.isArray(value) ? value.filter(filter) : value,
    };
    localStorage.setItem(key, JSON.stringify(wrapped, replacer));
  }, [key, filter, value, version]);

  return [value, setValue];
}

function isObject(val: unknown): boolean {
  return typeof val === "object" && !Array.isArray(val);
}
