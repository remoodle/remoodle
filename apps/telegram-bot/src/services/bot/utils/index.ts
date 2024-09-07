import { Deadline } from "@remoodle/types";
import { getTimeLeft } from "@remoodle/utils";

const getDeadlineText = (deadline: Deadline) => {
  let text = "";
  deadline.timestart *= 1000;
  const timeleft = deadline.timestart - Date.now();
  const isFiring = timeleft < 10800; // 3 hours
  const [courseName, _] = deadline.course_name.split(" | ");

  const date = new Date(deadline.timestart)
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace("24:00", "00:00");
  const timeLeft = `<b>${getTimeLeft(deadline.timestart)}</b>`;

  text += isFiring ? "🔥  " : "📅  ";
  text += `<b>${deadline.name.slice(0, -7)}</b>  |  ${courseName}  |  Date → ${date}  |  Time left → ${timeLeft}\n`;

  return text;
};

const getGradeText = (grade: any) => {
  let text = "";
  if (!["category", "course"].includes(grade.itemtype)) {
    text += `${grade.name} → ${grade.graderaw !== null ? grade.graderaw?.toFixed(2) : "None"}\n`;

    if (grade.name === "Attendance") {
      text += "\n";
    }
  }

  return text;
};

export { getDeadlineText, getGradeText };
