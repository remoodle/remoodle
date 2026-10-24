// Motion tiers from DESIGN.md. `fast` and `moderate` are critically damped so short travel lands
// without overshoot; only `slow`, used for large panels, keeps a little bounce.
export const spring = {
  fast: { type: "spring", duration: 0.08, bounce: 0 },
  moderate: { type: "spring", duration: 0.16, bounce: 0 },
  slow: { type: "spring", duration: 0.24, bounce: 0.12 },
} as const;
