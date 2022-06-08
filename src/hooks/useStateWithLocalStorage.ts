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
    initialValue = JSON.parse(localStorage.getItem(key)!);
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    localStorage.setItem(
      key,
      JSON.stringify(Array.isArray(value) ? value.filter(filter) : value)
    );
  }, [key, filter, value]);

  return [value, setValue];
}
