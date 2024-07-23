import {
  useBreakpoints as useBreakpointsComposable,
  breakpointsTailwind,
} from "@vueuse/core";

export function useBreakpoints() {
  const breakpoints = useBreakpointsComposable(breakpointsTailwind);

  const smAndSmaller = breakpoints.smallerOrEqual("sm");
  const mdAndSmaller = breakpoints.smallerOrEqual("md");
  const lgOrLarger = breakpoints.greaterOrEqual("lg");
  const xlOrLarger = breakpoints.greaterOrEqual("xl");

  return {
    smAndSmaller,
    mdAndSmaller,
    lgOrLarger,
    xlOrLarger,
  };
}
