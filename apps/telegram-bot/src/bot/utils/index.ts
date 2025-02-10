import type {
  MoodleEvent,
  MoodleGrade,
  NotificationSettings,
} from "@remoodle/types";
import { getTimeLeft } from "@remoodle/utils";
import { InlineKeyboard, GrammyError, BotError, HttpError } from "grammy";

const formatUnixtimestamp = (timestamp: number, showYear: boolean = false) => {
  return new Date(timestamp)
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      year: showYear ? "numeric" : undefined,
      hour12: false,
      timeZone: "Asia/Almaty",
    })
    .replace("24:00", "00:00");
};

const getDeadlineText = (deadline: MoodleEvent) => {
  let text = "";
  deadline.timestart *= 1000;
  const timeleft = deadline.timestart - Date.now();
  const isFiring = timeleft / 60 / 60 / 1000 <= 3;
  const [courseName, _] = deadline.course.shortname.split(" | ");

  const date = formatUnixtimestamp(deadline.timestart);
  const timeLeft = `<b>${getTimeLeft(deadline.timestart)}</b>`;
  const deadlineName = deadline.name.replace(/ is due( to be graded)?/, "");

  text += isFiring ? "🔥  " : "📅  ";
  text += `<b>${deadlineName}</b>  |  ${courseName}  |  Date → ${date}  |  Time left → ${timeLeft}\n`;

  return text;
};

const getGradeText = (grade: MoodleGrade) => {
  let text = "";
  if (!["category", "course"].includes(grade.itemtype)) {
    text += `${grade.itemname} → <b>${grade.graderaw !== null ? grade.graderaw?.toFixed(2) : "None"}</b>\n`;

    if (grade.itemname === "Attendance") {
      text += "\n";
    }
  }

  return text;
};

const getGPA = (total: number) => {
  const grades: { [key: number]: number } = {
    100: 4.0,
    95: 4.0,
    90: 3.67,
    85: 3.33,
    80: 3.0,
    75: 2.67,
    70: 2.33,
    65: 2.0,
    60: 1.67,
    55: 1.33,
    50: 1.0,
  };

  const grade = Math.floor(total / 5) * 5;
  return grades[grade] ? grades[grade].toFixed(2) : "0.00";
};

const calculateGrades = (grades: MoodleGrade[]) => {
  const getGrade = (name: string) =>
    grades.find((grade) => grade.itemname === name)?.graderaw ?? 0;

  const regFinal = getGrade("Register Final");
  const regMid = getGrade("Register Midterm");
  const regEnd = getGrade("Register Endterm");
  const regTerm = (regMid + regEnd) / 2;

  if (regFinal !== 0 && regTerm !== 0) {
    const totalGrade = getGrade("Total");

    const total =
      totalGrade === 0
        ? regFinal * 0.4 + regMid * 0.3 + regEnd * 0.3
        : getGrade("Total");
    const text = `<b>TOTAL  →  ${total.toFixed(2)}</b>\n<b>GPA  →  ${getGPA(total)}</b>\n\n`;

    if (total >= 90) {
      return `High scholarship 🎉🎉\n${text}`;
    } else if (total >= 70) {
      return `Scholarship 🎉\n${text}`;
    } else if (total >= 50) {
      return `No scholarship 😭\n${text}`;
    } else {
      return `Retake 💀\n${text}`;
    }
  } else if (regTerm !== 0 && regFinal === 0) {
    const calculateTarget = (target: number) => (target - regTerm * 0.6) / 0.4;

    const high = calculateTarget(90);
    const scholarship = calculateTarget(70);
    const retake = calculateTarget(50);

    return [
      `👹 Avoid retake: <b>final > ${retake <= 50.0 ? "50.0" : retake.toFixed(1)}</b>`,
      `💚 Save scholarship: <b>final > ${scholarship <= 50 ? "50.0" : scholarship.toFixed(1)}</b>`,
      `😈 High scholarship: ${high > 100 ? `<b>unreachable(${high.toFixed(1)})` : `<b>final > ${high.toFixed(1)}`}</b>`,
      `\n`,
    ].join("\n");
  }

  return "";
};

const getNotificationsKeyboard = (
  notificationSettings: NotificationSettings,
  websiteUrl: string | false = false,
) => {
  const keyboard = new InlineKeyboard();

  const enabled =
    notificationSettings["deadlineReminders::telegram"] === 1 ||
    notificationSettings["gradeUpdates::telegram"] === 1;

  keyboard
    .text(
      `Telegram Notifications ${enabled ? "🔔" : "🔕"}`,
      `change_notifications_telegram_${enabled ? "off" : "on"}`,
    )
    .row()
    .text(
      `Grades ${notificationSettings["gradeUpdates::telegram"] === 1 ? "🔔" : "🔕"}`,
      `change_notifications_grades_${notificationSettings["gradeUpdates::telegram"] === 1 ? "off" : "on"}`,
    )
    .text(
      `Deadlines ${notificationSettings["deadlineReminders::telegram"] === 1 ? "🔔" : "🔕"}`,
      `change_notifications_deadlines_${notificationSettings["deadlineReminders::telegram"] === 1 ? "off" : "on"}`,
    );

  if (websiteUrl) {
    keyboard.row().webApp("Advanced settings", websiteUrl);
  }

  keyboard.row().text("Back ←", "settings");

  return keyboard;
};

function logWithTimestamp(
  message: string,
  error: BotError | HttpError | GrammyError | Error,
) {
  console.error(`[${new Date().toISOString()}] ${message}`, error);
}

export {
  getDeadlineText,
  getGradeText,
  calculateGrades,
  getGPA,
  getNotificationsKeyboard,
  formatUnixtimestamp,
  logWithTimestamp,
};
