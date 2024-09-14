import { InlineKeyboard, Context } from "grammy";
import { request, getAuthHeaders } from "../../library/hc";
import {
  getDeadlineText,
  getGradeText,
  calculateGrades,
  getNotificationsKeyboard,
} from "../utils";
import keyboards from "./keyboards";

// Menu buttons
async function others(ctx: Context) {
  await ctx.editMessageText("More", { reply_markup: keyboards.others });
}

async function settings(ctx: Context) {
  await ctx.editMessageText("Settings", { reply_markup: keyboards.settings });
}

async function deadlines(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [deadlines, _] = await request((client) =>
    client.v1.deadlines.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!deadlines) {
    return;
  }

  if (deadlines.length === 0) {
    await ctx.editMessageText("You have no active deadlines 🥰", {
      reply_markup: keyboards.deadlines,
    });
    return;
  }

  const text =
    "Upcoming deadlines:\n\n" + deadlines.map(getDeadlineText).join("\n");

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup: keyboards.deadlines,
  });
}

// Back buttons
async function backToMenu(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [user, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!user) {
    await ctx.reply("You are not connected to ReMoodle!");
    return;
  }

  await ctx.editMessageText(`${user.name}`, {
    reply_markup: keyboards.main,
  });
}

async function backToSettings(ctx: Context) {
  await ctx.editMessageText("Settings", { reply_markup: keyboards.settings });
}

async function refreshDeadlines(ctx: Context) {
  if (!ctx || !ctx?.from || !ctx?.chat || !ctx?.match) {
    return;
  }

  const type = ctx.match[0].split("_")[2];

  const userId = ctx.from.id;

  const [deadlines, _] = await request((client) =>
    client.v1.deadlines.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!deadlines) {
    return;
  }

  if (deadlines.length === 0) {
    await ctx.editMessageText("You have no active deadlines 🥰", {
      reply_markup:
        type === "menu" ? keyboards.deadlines : keyboards.single_deadline,
    });
    return;
  }

  const text =
    "Upcoming deadlines:\n\n" + deadlines.map(getDeadlineText).join("\n");

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup:
      type === "menu" ? keyboards.deadlines : keyboards.single_deadline,
  });
}

// Grades
async function grades(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [grades, _] = await request((client) =>
    client.v1.courses.$get(
      {
        query: {
          status: "inprogress",
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!grades) {
    return;
  }

  const gradesKeyboards = new InlineKeyboard();

  grades.forEach((grade) => {
    gradesKeyboards
      .row()
      .text(grade.name.split(" | ")[0], `inprogress_course_${grade.course_id}`);
  });

  gradesKeyboards
    .row()
    .text("Back ←", "back_to_menu")
    .text("Past courses", "old_grades_1");

  if (grades.length === 0) {
    await ctx.editMessageText("You have no grades 🥰", {
      reply_markup: gradesKeyboards,
    });
    return;
  }

  await ctx.editMessageText("Your courses:", { reply_markup: gradesKeyboards });
}

async function backToGrades(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [grades, _] = await request((client) =>
    client.v1.courses.$get(
      {
        query: {
          status: "inprogress",
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!grades) {
    await ctx.reply("Grades are not available.");
    return;
  }

  const gradesKeyboards = new InlineKeyboard();

  grades.forEach((grade) => {
    gradesKeyboards
      .row()
      .text(grade.name.split(" | ")[0], `inprogress_course_${grade.course_id}`);
  });

  gradesKeyboards
    .row()
    .text("Back ←", "back_to_menu")
    .text("Past courses", "old_grades_1");

  await ctx.editMessageText("Your courses:", { reply_markup: gradesKeyboards });
}

async function gradesInProgressCourse(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[2];

  const [grades, _] = await request((client) =>
    client.v1.course[":courseId"].grades.$get(
      {
        param: {
          courseId: courseId,
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const [course, __] = await request((client) =>
    client.v1.course[":courseId"].$get(
      {
        param: {
          courseId: courseId,
        },
        query: {
          content: "0",
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const keyboard = keyboards.single_grade.clone();

  if (!grades || !course) {
    await ctx.editMessageText("Grades for this course are not available.", {
      reply_markup: keyboard.text("Refresh", `refresh_grade_${courseId}`),
    });
    return;
  }

  let message: string = `${course.name.split(" | ")[0]}\nTeacher: ${course.name.split(" | ")[1]}\n\n`;

  message += `${calculateGrades(grades)}`;

  grades.forEach((grade) => {
    message += `${getGradeText(grade)}`;
  });

  return await ctx.editMessageText(message, {
    reply_markup: keyboard.text("Refresh", `refresh_grade_${courseId}`),
    parse_mode: "HTML",
  });
}

async function refreshCourse(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;

  const courseId = ctx.match[0].split("_")[2];

  const [grades, _] = await request((client) =>
    client.v1.course[":courseId"].grades.$get(
      {
        param: {
          courseId: courseId,
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const [course, __] = await request((client) =>
    client.v1.course[":courseId"].$get(
      {
        param: {
          courseId: courseId,
        },
        query: {
          content: "0",
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const keyboard = keyboards.single_grade.clone();

  if (!grades || !course) {
    await ctx.editMessageText("Grades for this course are not available.", {
      reply_markup: keyboard.text("Refresh", `refresh_grade_${courseId}`),
    });
    return;
  }

  let message: string = `${course.name.split(" | ")[0]}\nTeacher: ${course.name.split(" | ")[1]}\n\n`;

  grades.forEach((grade) => {
    message += getGradeText(grade);
  });

  return await ctx.editMessageText(message, {
    reply_markup: keyboard.text("Refresh", `refresh_grade_${courseId}`),
    parse_mode: "HTML",
  });
}

// Old courses
async function gradesPastCourses(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const page = parseInt(ctx.match[0]?.split("_")[2]);

  const userId = ctx.from.id;

  let [rmcCourses, _] = await request((client) =>
    client.v1.courses.$get(
      {
        query: {
          status: "past",
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!rmcCourses) {
    await ctx.editMessageText("Past courses are not available.", {
      reply_markup: new InlineKeyboard().text("Back ←", "back_to_grades"),
    });
    return;
  }

  if (rmcCourses.length === 0) {
    await ctx.editMessageText("You have no past courses 🥰", {
      reply_markup: new InlineKeyboard().text("Back", "back_to_grades"),
    });
    return;
  }

  let courses = rmcCourses.splice((page - 1) * 10, 10);
  rmcCourses = rmcCourses.concat(courses);

  const coursesKeyboards = new InlineKeyboard();

  courses.forEach((course) => {
    coursesKeyboards
      .row()
      .text(
        course.name.split(" | ")[0],
        `past_course_${course.course_id}_${page}`,
      );
  });

  if (rmcCourses.length < 10) {
    coursesKeyboards.row().text("Back", "back_to_grades");
  } else if (page === 1) {
    coursesKeyboards
      .row()
      .text("Back", "back_to_grades")
      .text("→", `old_grades_${page + 1}`);
  } else if (page === rmcCourses.length / 10 + 1) {
    coursesKeyboards
      .row()
      .text("Back", "back_to_grades")
      .text("←", `old_grades_${page - 1}`);
  } else {
    coursesKeyboards
      .row()
      .text("Back", "back_to_grades")
      .text("←", `old_grades_${page - 1}`)
      .text("→", `old_grades_${page + 1}`);
  }

  await ctx.editMessageText(
    `Your past courses (${page}/${Math.ceil(rmcCourses.length / 10)}):`,
    {
      reply_markup: coursesKeyboards,
    },
  );
}

async function gradesPastCourse(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[2];

  const [grades, _] = await request((client) =>
    client.v1.course[":courseId"].grades.$get(
      {
        param: {
          courseId: courseId,
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const [course, __] = await request((client) =>
    client.v1.course[":courseId"].$get(
      {
        param: {
          courseId: courseId,
        },
        query: {
          content: "0",
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const keyboard = new InlineKeyboard().text(
    "Back ←",
    `old_grades_${ctx.match[0].split("_")[3]}`,
  );

  if (!grades || !course) {
    await ctx.editMessageText("Grades for this course are not available.", {
      reply_markup: keyboard,
    });
    return;
  }

  let message: string = `${course.name.split(" | ")[0]}\nTeacher: ${course.name.split(" | ")[1]}\n\n`;

  message += `${calculateGrades(grades)}`;

  grades.forEach((grade) => {
    message += `${getGradeText(grade)}`;
  });

  return await ctx.editMessageText(message, {
    reply_markup: keyboard,
    parse_mode: "HTML",
  });
}

// Notifications
async function notifications(ctx: Context) {
  if (!ctx.from) {
    return;
  }
  const userId = ctx.from.id;

  const [data, _] = await request((client) =>
    client.v1.user.settings.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!data) {
    return;
  }

  const settings = data.notifications.telegram;

  await ctx.editMessageText("Notifications", {
    reply_markup: getNotificationsKeyboard(settings),
  });
}

async function changeNotifications(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;
  const type = ctx.match[0].split("_")[2];
  const value = ctx.match[0].split("_")[3];

  const json: { [key: string]: boolean } = {};
  if (type === "telegram") {
    json["telegramDeadlineReminders"] = value === "on";
    json["telegramGradeUpdates"] = value === "on";
  } else if (type === "grades") {
    json["telegramGradeUpdates"] = value === "on";
  } else if (type === "deadlines") {
    json["telegramDeadlineReminders"] = value === "on";
  } else {
    return;
  }

  const [_, error] = await request((client) =>
    client.v1.user.settings.$post(
      {
        json: json,
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (error) {
    await ctx.editMessageText("An error occurred. Try again later.", {
      reply_markup: new InlineKeyboard().text("Back ←", "back_to_settings"),
    });
    return;
  }

  const [data, __] = await request((client) =>
    client.v1.user.settings.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!data) {
    return;
  }

  const settings = data.notifications.telegram;

  await ctx.editMessageText("Notifications", {
    reply_markup: getNotificationsKeyboard(settings),
  });
}

// Delete profile
async function deleteProfile(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [user, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!user) {
    await ctx.reply("You are not connected to ReMoodle!");
    return;
  }

  await ctx.editMessageText(
    `Are you sure to delete your ReMoodle profile?\nThis action is irreversible and will remove all data related to you.`,
    {
      reply_markup: keyboards.delete_profile,
    },
  );
}

async function deleteProfileYes(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [_, error] = await request((client) =>
    client.v1.goodbye.$delete(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (error) {
    await ctx.deleteMessage();
    await ctx.reply("An error occurred. Try again later.");
    return;
  }

  await ctx.deleteMessage();
  await ctx.reply("Your ReMoodle profile has been deleted.");
}

// Donate button
async function donate(ctx: Context) {
  await ctx.reply(
    "Our project, ReMoodle, is completely free to use and supported by donations.\nSupport us 💵 (click to copy)\n\n*Kaspi*  →  `4400430319119613`\n\n*Halyk*  →  `5522042707904355`",
    {
      parse_mode: "Markdown",
    },
  );
}

async function comingSoon(ctx: Context) {
  await ctx.answerCallbackQuery({
    text: "Schedules will be available very soon! Stay updated on our channel :D",
    show_alert: true,
  });
}

const callbacks = {
  menu: {
    others: others,
    settings: settings,
    deadlines: deadlines,
    grades: grades,
  },
  deadlines: {
    refresh: refreshDeadlines,
  },
  grades: {
    inProgressCourse: gradesInProgressCourse,
    refresh: refreshCourse,
    pastCourses: gradesPastCourses,
    pastCourse: gradesPastCourse,
  },
  settings: {
    notifications: notifications,
    changeNotifications: changeNotifications,
    deleteProfile: deleteProfile,
    deleteProfileYes: deleteProfileYes,
  },
  back: {
    toMenu: backToMenu,
    toSettings: backToSettings,
    toGrades: backToGrades,
  },
  other: {
    donate: donate,
    schedule: comingSoon,
  },
};

export default callbacks;
