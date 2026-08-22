import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);

export { dayjs };

export type { Dayjs };
