import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const getTimeFromNow = (date: number) => {
  const currentTime = dayjs();
  const deadlineTime = dayjs(date);
  const timeDiff = deadlineTime.diff(currentTime);

  const duration = dayjs.duration(timeDiff);

  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const timeComponents = [];

  if (months > 0) {
    timeComponents.push(`${months} ${months === 1 ? "month" : "months"}`);
  }

  if (months > 0 || days > 0) {
    timeComponents.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0 || minutes > 0 || seconds > 0) {
    timeComponents.push(
      `${hours}:${minutes}:${seconds.toString().padStart(2, "0")}`,
    );
  }

  return timeComponents.join(", ");
};
