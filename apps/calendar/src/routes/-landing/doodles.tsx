import type { ComponentProps } from "react";
import { cn } from "cn";

// Pencil marks from DESIGN.md: single 2px strokes, round caps, mist-tinted, never over copy.
const stroke =
  "fill-none stroke-scribble [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2] [vector-effect:non-scaling-stroke]";

export function Spiral(props: ComponentProps<"svg">) {
  return (
    <svg aria-hidden viewBox="0 0 80 80" {...props} className={cn(stroke, props.className)}>
      <path d="M40 42c-2-4 5-6 7-2 3 6-5 11-11 8-8-4-6-16 3-18 12-3 20 10 15 20-6 12-25 12-31-1-7-15 6-30 22-29 19 1 30 21 22 37" />
    </svg>
  );
}

export function Dashes(props: ComponentProps<"svg">) {
  return (
    <svg aria-hidden viewBox="0 0 60 60" {...props} className={cn(stroke, props.className)}>
      <path d="M8 30h10M30 8v10M44 16l7-7M44 44l7 7" />
    </svg>
  );
}
