import React, { useState, useEffect } from "react";

/**
 * Just like `useState`, but checks `localStorage` for `key` before
 * initializing. If `key` is found, the data stored there is used, and
 * `initialValue` otherwise. Data is jsonified and stored in `localStorage` on
 * every change. If `filter` is specified and `T` is an array, `filter` is
 * applied to the array before every write. Likely not performant on complex or
 * frequently-written data.
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

function replacer(_: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: [...value],
    };
  } else {
    return value;
  }
}

function reviver(_: string, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
