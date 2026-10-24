import { queryOptions } from "@tanstack/react-query";
import { getSession } from "@/server/auth.functions";
import { getIcalSubscription } from "@/server/ical.functions";
import { getMoodleEvents } from "@/server/moodle.functions";
import { getMyDuSchedule } from "@/server/my-du.functions";

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: () => getSession(),
  staleTime: 5 * 60_000,
});

export const myDuQuery = queryOptions({
  queryKey: ["my-du"],
  queryFn: () => getMyDuSchedule(),
  staleTime: 5 * 60_000,
});

// Moodle is read live from the user's export, so a page visit is the refresh.
export const moodleQuery = queryOptions({
  queryKey: ["moodle"],
  queryFn: () => getMoodleEvents(),
  staleTime: 60_000,
  retry: false,
});

export const icalSubscriptionQuery = queryOptions({
  queryKey: ["ical-subscription"],
  queryFn: () => getIcalSubscription(),
});
