import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const getTimeLeft = (date: number) => {
  const currentTime = dayjs(new Date());
  const deadlineTime = dayjs(date);
  const timeDiff = deadlineTime.diff(currentTime);

  const duration = dayjs.duration(timeDiff);

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${days} days, ${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
