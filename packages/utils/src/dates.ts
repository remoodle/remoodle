import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const getTimeLeft = (date: number) => {
  const currentTime = dayjs();
  const deadlineTime = dayjs(date);
  const timeDiff = deadlineTime.diff(currentTime);

  const duration = dayjs.duration(timeDiff);

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return days > 0
    ? `${days} days, ${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
