import { useEffect, useState } from "react";
import { now } from "@/lib/calendar-dates";

/** The current Kazakhstan wall-clock time, refreshed every minute. */
export function useNow() {
  const [value, setValue] = useState(now);

  useEffect(() => {
    const interval = setInterval(() => setValue(now()), 60_000);

    return () => clearInterval(interval);
  }, []);

  return value;
}
