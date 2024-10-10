import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const getTimeLeft = (date: number) => {
  const currentTime = dayjs();
  const deadlineTime = dayjs(date);
  const timeDiff = deadlineTime.diff(currentTime);

  const duration = dayjs.duration(timeDiff);

  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const timeComponents = [];

  if (months > 0) {
    timeComponents.push(`${months} ${months === 1 ? "month" : "months"}`);
  }

  if (months > 0 || days > 0) {
    timeComponents.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  timeComponents.push(
    `${formattedHours}:${formattedMinutes}:${formattedSeconds}`,
  );

  return timeComponents.join(", ");
};
