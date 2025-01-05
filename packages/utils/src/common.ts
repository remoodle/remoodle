export function partition<T, U extends string>(
  arr: ReadonlyArray<T>,
  sorter: (el: T) => U,
): { [K in U]: T[] | undefined } {
  const res = {} as { [K in U]: T[] | undefined };
  for (const el of arr) {
    const key = sorter(el);
    const target: T[] = res[key] ?? (res[key] = []);
    target.push(el);
  }
  return res;
}

export function getKeys<T extends Record<string, unknown>>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}

export function getValues<T extends Record<string, unknown>>(obj: T) {
  return Object.values(obj) as T[keyof T][];
}

export function fromEntries<T extends Array<[PropertyKey, unknown]>>(
  entries: T,
) {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
}

export function objectEntries<T extends object>(
  obj: T,
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as any;
}
