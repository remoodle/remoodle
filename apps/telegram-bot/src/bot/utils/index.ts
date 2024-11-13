import { Deadline } from "@remoodle/types";
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

const getDeadlineText = (deadline: Deadline) => {
  let text = "";
  deadline.timestart *= 1000;
  const timeleft = deadline.timestart - Date.now();
  const isFiring = timeleft / 60 / 60 / 1000 <= 3;
  const [courseName, _] = deadline.course_name.split(" | ");

  const date = formatUnixtimestamp(deadline.timestart);
  const timeLeft = `<b>${getTimeLeft(deadline.timestart)}</b>`;

  text += isFiring ? "🔥  " : "📅  ";
  text += `<b>${deadline.name.slice(0, -7)}</b>  |  ${courseName}  |  Date → ${date}  |  Time left → ${timeLeft}\n`;

  return text;
};

const getGradeText = (grade: any) => {
  let text = "";
  if (!["category", "course"].includes(grade.itemtype)) {
    text += `${grade.name} → <b>${grade.graderaw !== null ? grade.graderaw?.toFixed(2) : "None"}</b>\n`;

    if (grade.name === "Attendance") {
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

const calculateGrades = (grades: any[]) => {
  const regFinal = grades.find((grade) => grade.name === "Register Final");
  const regMid = grades.find((grade) => grade.name === "Register Midterm");
  const regEnd = grades.find((grade) => grade.name === "Register Endterm");
  const regTerm = (regMid?.graderaw + regEnd?.graderaw) / 2;

  if (regFinal?.graderaw && regTerm && regMid?.graderaw && regEnd?.graderaw) {
    const total =
      regFinal.graderaw * 0.4 + regMid.graderaw * 0.3 + regEnd.graderaw * 0.3;
    const text = `<b>TOTAL  →  ${total.toFixed(2)}</b>\n<b>GPA  →  ${getGPA(total)}</b>\n\n`;

    if (total >= 50 && total < 70) {
      return `No scholarship 😭\n${text}`;
    } else if (total >= 70 && total < 90) {
      return `Scholarship 🎉\n${text}`;
    } else if (total >= 90) {
      return `High scholarship 🎉🎉\n${text}`;
    } else {
      return `Retake 💀\n${text}`;
    }
  }

  if (regTerm && regMid.graderaw && regEnd.graderaw && !regFinal.graderaw) {
    let text = "";

    const high = (90 - regTerm * 0.6) / 0.4;
    const scholarship = (70 - regTerm * 0.6) / 0.4;
    const retake = (50 - regTerm * 0.6) / 0.4;

    text += `👹 Avoid retake: <b>final > ${retake <= 50.0 ? "50.0" : retake.toFixed(1)}</b>\n`;
    text += `💚 Save scholarship: <b>final > ${scholarship <= 50 ? "50.0" : scholarship.toFixed(1)}</b>\n`;
    text += `😈 High scholarship: ${high > 100 ? `<b>unreachable(${high.toFixed(1)})` : `<b>final > ${high.toFixed(1)}`}</b>\n`;

    return text;
  }

  return "";
};

const getNotificationsKeyboard = (notifications: any) => {
  const keyboard = new InlineKeyboard();

  if (notifications.enabled) {
    keyboard
      .text(
        `Telegram Notifications ${notifications.enabled ? "🔔" : "🔕"}`,
        `change_notifications_telegram_${notifications.enabled ? "off" : "on"}`,
      )
      .row()
      .text(
        `Grades ${notifications.gradeUpdates ? "🔔" : "🔕"}`,
        `change_notifications_grades_${notifications.gradeUpdates ? "off" : "on"}`,
      )
      .text(
        `Deadlines ${notifications.deadlineReminders ? "🔔" : "🔕"}`,
        `change_notifications_deadlines_${notifications.deadlineReminders ? "off" : "on"}`,
      )
      .row()
      .text("Back ←", "settings");
  } else {
    keyboard
      .text(
        `Telegram Notifications ${notifications.enabled ? "🔔" : "🔕"}`,
        `change_notifications_telegram_${notifications.enabled ? "off" : "on"}`,
      )
      .row()
      .text("Back ←", "settings");
  }

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
