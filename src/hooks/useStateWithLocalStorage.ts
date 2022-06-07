import React, { useState, useEffect } from "react";

export function useStateWithLocalStorage<T>(
  key: string,
  initialValue: T,
  filter: (value: T, index: number, array: T[]) => boolean = () => true
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
