import type { ComponentProps } from "react";

/** The ReMoodle mark: a cap on a stem between two pillars. Same geometry as `public/icon.svg`. */
export function BrandMark(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="-20 0 316 316" fill="currentColor" aria-hidden {...props}>
      <path d="M138 0L271 79L138 157L5 79Z" />
      <path d="M129 140H147V316H129Z" />
      <path d="M0 130L86 180V316H0Z" />
      <path d="M276 130L190 180V316H276Z" />
    </svg>
  );
}
