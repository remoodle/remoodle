import { dayjs, type TDate } from "./dayjs";

export { camelize, getCurrentInstance, toHandlerKey } from "vue";

export { isObject, objectEntries } from "@vueuse/core";

export { filesize } from "filesize";

export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function insertIf<T>(condition = true, ...elements: T[]) {
  return condition ? elements : [];
}

export function isEmptyString(value: string) {
  return value.trim() === "";
}

export function getStorageKey(key: string, storageVersion?: number) {
  return `h3-${key}` + (storageVersion ? `-${storageVersion}` : "");
}

export function getURLHost(url: string) {
  try {
    return new URL(url).host;
  } catch (e) {
    return url;
  }
}

export function prepareFileURL(fileurl: string) {
  const currentPath = window.location.pathname + window.location.search;

  return (
    window.location.origin +
    `/f?filepath=${fileurl}&from=${encodeURIComponent(currentPath)}`
  );
}

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

export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);

  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function fromUnix(timestamp: TDate): Date {
  return dayjs.unix(Number(timestamp)).toDate();
}

const DATE_FORMAT_OPTIONS = {
  short: "L, LT",
  medium: "lll",
  long: "LLL Z",
  full: "LLLL",
  extraShortDate: "MMM 'YY",
  superShortDate: "MMM D",
  shortDate: "L",
  mediumDate: "MMM D, YYYY",
  longDate: "MMMM D, YYYY",
  fullDate: "dddd, MMMM D, YYYY",
  shortTime: "LT",
  mediumTime: "LTS",
  longTime: "LTS Z",
  fullTime: "LTS ZZ",
} as const;

export function formatDate(
  value: TDate,
  format: keyof typeof DATE_FORMAT_OPTIONS,
  options?: Partial<{ utc: boolean; unix: boolean }>,
): string {
  const { utc = false } = options || {};

  const date = utc ? dayjs.utc(value) : dayjs(value);

  return date.format(DATE_FORMAT_OPTIONS[format]);
}

export function getRelativeTime(date: TDate): string {
  return dayjs(date).fromNow();
}

export function splitCourseName(title?: string) {
  if (!title) {
    return { name: "", teacher: "" };
  }

  const [name, teacher] = title.split(" | ");

  if (!name || !teacher) {
    return { name: title, teacher: "" };
  }

  return { name, teacher };
}

export function formatAssignmentName(title: string) {
  return title.replace("is due", "").trim();
}

export const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus(),
};
