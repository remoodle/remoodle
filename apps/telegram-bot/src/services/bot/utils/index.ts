import { Deadline } from "@remoodle/types";

const getTimeLeft = (current_timestamp: number, deadline_timestamp: number) => {
  const timeDiff = (deadline_timestamp - current_timestamp) / 1000;

  const seconds = Math.floor(timeDiff % 60);
  const minutes = Math.floor((timeDiff / 60) % 60);
  const hours = Math.floor((timeDiff / (60 * 60)) % 24);
  const days = Math.floor(timeDiff / (60 * 60 * 24));

  const formattedTime = `<b>${days} days, ${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}</b>`;

  return formattedTime;
};

const getDeadlineText = (deadline: Deadline) => {
  let text = "";
  deadline.timestart *= 1000;
  const timeleft = deadline.timestart - Date.now();
  const is_firing = timeleft < 10800; // 3 hours
  const [course_name, _] = deadline.course_name.split(" | ");

  const date = new Date(deadline.timestart)
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace("24:00", "00:00");
  const timeLeft = getTimeLeft(Date.now(), deadline.timestart);

  text += is_firing ? "🔥  " : "📅  ";
  text += `<b>${deadline.name.slice(0, -7)}</b>  |  ${course_name}  |  Date → ${date}  |  Time left → ${timeLeft}\n`;

  return text;
};

export { getDeadlineText };
