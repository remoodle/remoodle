import { ref, type Ref } from "vue";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { APIError } from "@remoodle/types";
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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function prepareFileURL(fileurl: string, token: string) {
  const url = new URL(fileurl);

  url.searchParams.set("token", token);
  url.searchParams.set("forcedownload", "1");

  return url.toString();
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

export function getGpaForGrade(total: number): string {
  const grades: { [key: number]: number } = {
    100: 4.0,
    95: 4.0,
    90: 3.67,
    85: 3.33,
    80: 3.0,
    75: 2.67,
    70: 2.33,
    65: 2.0,
    60: 1.67,
    55: 1.33,
    50: 1.0,
  };

  const grade = Math.floor(total / 5) * 5;
  return grades[grade] ? grades[grade].toFixed(2) : "0.00";
}

interface UseAsync<T extends (...args: unknown[]) => unknown, E = APIError> {
  loading: Ref<boolean>;
  error: Ref<E | null>;
  run: (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

export function createAsyncProcess<T extends (...args: any) => unknown>(
  fn: T,
): UseAsync<T> {
  const loading: UseAsync<T>["loading"] = ref(false);
  const error: UseAsync<T>["error"] = ref(null);

  const run: UseAsync<T>["run"] = async (...args) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await fn(...(args as any));
      return result as ReturnType<T>;
    } catch (err) {
      // @ts-ignore
      error.value = err;
      return error as ReturnType<T>;
    } finally {
      loading.value = false;
    }
  };

  return { loading, run, error };
}

export const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus(),
};
