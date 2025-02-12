import { InlineKeyboard, Context } from "grammy";
import TurndownService from "turndown";
import { request, getAuthHeaders } from "../../library/hc";
import {
  getDeadlineText,
  getGradeText,
  calculateGrades,
  getNotificationsKeyboard,
  formatUnixtimestamp,
  getMiniAppUrl,
} from "../utils";
import keyboards from "./keyboards";
import { config } from "../../config";

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
    client.v2.deadlines.$get(
      {
        query: {},
      },
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
    client.v2.user.check.$get(
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

  const url = await getMiniAppUrl(userId, config.frontend.url);

  const keyboard = keyboards.main.clone().webApp("Website", url);

  await ctx.editMessageText(`${user.name}`, {
    reply_markup: keyboard,
  });
}

async function refreshDeadlines(ctx: Context) {
  if (!ctx || !ctx?.from || !ctx?.chat || !ctx?.match) {
    return;
  }

  const type = ctx.match[0].split("_")[2];

  const userId = ctx.from.id;

  const [deadlines, _] = await request((client) =>
    client.v2.deadlines.$get(
      {
        query: {},
      },
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
    client.v2.courses.$get(
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
      .text(
        `${grade.shortname.split(" | ")[0]} ${grade.notingroup ? "❗" : ""}`,
        `inprogress_course_${grade.id}`,
      );
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

async function gradesInProgressCourse(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[2];

  const [grades, _] = await request((client) =>
    client.v2.course[":courseId"].grades.$get(
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
    client.v2.course[":courseId"].$get(
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

  if (!grades || !course) {
    await ctx.editMessageText("Grades for this course are not available.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  let message: string = `${course.fullname.split(" | ")[0]}\nTeacher: ${course.fullname.split(" | ")[1]}\n\n`;

  message += `${calculateGrades(grades)}`;

  grades.forEach((grade) => {
    message += `${getGradeText(grade)}`;
  });

  const keyboard = new InlineKeyboard()
    .text("Assignments", `course_assignments_${courseId}`)
    .row()
    .text("Back ←", "grades");

  return await ctx.editMessageText(message, {
    reply_markup: keyboard,
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
    client.v2.courses.$get(
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
      reply_markup: new InlineKeyboard().text("Back ←", "grades"),
    });
    return;
  }

  if (rmcCourses.length === 0) {
    await ctx.editMessageText("You have no past courses 🥰", {
      reply_markup: new InlineKeyboard().text("Back", "grades"),
    });
    return;
  }

  const totalPages = Math.ceil(rmcCourses.length / 10);
  const startIndex = (page - 1) * 10;
  const endIndex = startIndex + 10;
  let courses = rmcCourses.slice(startIndex, endIndex);

  const coursesKeyboards = new InlineKeyboard();

  courses.forEach((course) => {
    coursesKeyboards
      .row()
      .text(
        course.fullname.split(" | ")[0],
        `past_course_${course.id}_${page}`,
      );
  });

  coursesKeyboards.row();

  if (page > 1) {
    coursesKeyboards.text("←", `old_grades_${page - 1}`);
  }

  coursesKeyboards.text("Back", "grades");

  if (page < totalPages) {
    coursesKeyboards.text("→", `old_grades_${page + 1}`);
  }

  await ctx.editMessageText(`Your past courses (${page}/${totalPages}):`, {
    reply_markup: coursesKeyboards,
  });
}

async function gradesPastCourse(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[2];

  const [grades, _] = await request((client) =>
    client.v2.course[":courseId"].grades.$get(
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
    client.v2.course[":courseId"].$get(
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

  let message: string = `${course.fullname.split(" | ")[0]}\nTeacher: ${course.fullname.split(" | ")[1]}\n\n`;

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
    client.v2.user.settings.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!data) {
    return;
  }

  const settings = data.notificationSettings;

  const url = await getMiniAppUrl(
    userId,
    config.frontend.url,
    "/account/notifications",
  );

  await ctx.editMessageText("Notifications", {
    reply_markup: getNotificationsKeyboard(settings, url),
  });
}

async function changeNotifications(ctx: Context) {
  if (!ctx?.from || !ctx?.match) {
    return;
  }

  const userId = ctx.from.id;
  const type = ctx.match[0].split("_")[2];
  const value = ctx.match[0].split("_")[3];

  const [account, accountError] = await request((client) =>
    client.v2.user.settings.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (accountError) {
    await ctx.editMessageText("An error occurred. Try again later.", {
      reply_markup: new InlineKeyboard().text("Back ←", "settings"),
    });
    return;
  }

  const notificationSettings = account.notificationSettings;

  if (type === "telegram") {
    notificationSettings["gradeUpdates::telegram"] = value === "on" ? 1 : 0;
    notificationSettings["deadlineReminders::telegram"] =
      value === "on" ? 1 : 0;
  } else if (type === "grades") {
    notificationSettings["gradeUpdates::telegram"] = value === "on" ? 1 : 0;
  } else if (type === "deadlines") {
    notificationSettings["deadlineReminders::telegram"] =
      value === "on" ? 1 : 0;
  } else {
    return;
  }

  const [_, error] = await request((client) =>
    client.v2.user.settings.$post(
      {
        json: {
          notificationSettings,
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (error) {
    await ctx.editMessageText("An error occurred. Try again later.", {
      reply_markup: new InlineKeyboard().text("Back ←", "settings"),
    });
    return;
  }

  const [data, __] = await request((client) =>
    client.v2.user.settings.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!data) {
    return;
  }

  const url = await getMiniAppUrl(
    userId,
    config.frontend.url,
    "/account/notifications",
  );

  await ctx.editMessageText("Notifications", {
    reply_markup: getNotificationsKeyboard(data.notificationSettings, url),
  });
}

// Delete profile
async function deleteProfile(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [user, _] = await request((client) =>
    client.v2.user.check.$get(
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
    client.v2.bye.$delete(
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

async function account(ctx: Context) {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [user, error] = await request((client) =>
    client.v2.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (error) {
    await ctx.editMessageText("An error occurred. Try again later.", {
      reply_markup: keyboards.account,
      parse_mode: "Markdown",
    });
    return;
  }

  return await ctx.editMessageText(
    "ReMoodle Account\n\nHandle:   `" +
      user.handle +
      "`\nName:  `" +
      user.name +
      "`\nMoodleID:  `" +
      user.moodleId +
      "`\n\nBot version:  `" +
      // eslint-disable-next-line
      (process.env.VERSION_TAG || "") +
      "`\nToken health:  `" +
      `${user.health} ${user.health > 0 ? "🟢" : "🔴"}` +
      "`",
    {
      reply_markup: keyboards.account,
      parse_mode: "Markdown",
    },
  );
}

async function courseAssignments(ctx: Context) {
  if (!ctx.from || !ctx.match) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[2];

  const [course, courseError] = await request((client) => {
    return client.v2.course[":courseId"].$get(
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
    );
  });

  if (courseError) {
    await ctx.editMessageText("Course error.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  if (!course) {
    await ctx.editMessageText("Course is not available.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  const [assignments, assignmentsError] = await request((client) =>
    client.v2.course[":courseId"].assignments.$get(
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

  if (assignmentsError && assignmentsError.status === 404) {
    await ctx.editMessageText("Assignments were not found.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  if (assignmentsError && assignmentsError.status === 401) {
    await ctx.editMessageText("You are not connected to ReMoodle.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  if (!assignments) {
    await ctx.editMessageText("Assignments are not available.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  const keyboard = new InlineKeyboard();

  assignments.forEach((assignment) => {
    keyboard
      .row()
      .text(
        assignment.name,
        `assignment_${assignment.course}_${assignment.id}`,
      );
  });

  keyboard.row().text("Back ←", `inprogress_course_${courseId}`);

  await ctx.editMessageText(`Assignments\n*${course.fullname}*`, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}

async function courseAssignmentById(ctx: Context) {
  if (!ctx.from || !ctx.match) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[1];
  const assignmentId = parseInt(ctx.match[0].split("_")[2]);
  const keyboardBack = new InlineKeyboard().text(
    "Back ←",
    `course_assignments_${courseId}`,
  );

  const [course, courseError] = await request((client) =>
    client.v2.course[":courseId"].$get(
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

  if (!course || courseError) {
    await ctx.editMessageText("Course is not available.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  const [grades, gradesError] = await request((client) =>
    client.v2.course[":courseId"].grades.$get(
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

  if (!grades || gradesError) {
    await ctx.editMessageText("Grades are not available.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  const [assignments, assignmentsError] = await request((client) =>
    client.v2.course[":courseId"].assignments.$get(
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

  if (assignmentsError && assignmentsError.status === 404) {
    await ctx.editMessageText("Assignments were not found.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  if (assignmentsError && assignmentsError.status === 401) {
    await ctx.editMessageText("You are not connected to ReMoodle.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  if (!assignments) {
    await ctx.editMessageText("Assignment is not available.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  const assignment = assignments.find(
    (assignment) => assignment.id === assignmentId,
  );

  if (!assignment || !assignmentId) {
    await ctx.editMessageText("Assignment is not available.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  let text = `*${assignment.name}*\n`;
  text += `*${course.fullname}*\n\n`;

  if (assignment.duedate && assignment.allowsubmissionsfromdate) {
    text += `*Opened:* ${formatUnixtimestamp(assignment.allowsubmissionsfromdate * 1000, true)}\n`;
    text += `*Due:* ${formatUnixtimestamp(assignment.duedate * 1000, true)}\n`;
  }

  console.log(assignmentId);
  const grade = grades.find((g) => g.iteminstance === assignmentId);
  console.log(grade);

  if (grade) {
    text += `*Grade:* ${grade.gradeformatted}%\n`;
  }

  if (assignment.intro) {
    const turndownService = new TurndownService();
    turndownService.remove(["script", "img", "iframe"]);
    const markdownIntro = turndownService.turndown(assignment.intro);

    if (assignment.intro.length > 700) {
      text += `\n${markdownIntro.slice(0, 700)}...\n\n`;
    } else {
      text += `\n${markdownIntro}\n\n`;
    }
  }

  return await ctx.editMessageText(text, {
    reply_markup: keyboardBack,
    parse_mode: "Markdown",
  });
}

// Delete message (clear notification)
async function clearMessage(ctx: Context) {
  await ctx.deleteMessage();
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
    pastCourses: gradesPastCourses,
    pastCourse: gradesPastCourse,
    assignments: {
      course: courseAssignments,
      assignment: courseAssignmentById,
    },
  },
  settings: {
    notifications: notifications,
    changeNotifications: changeNotifications,
    deleteProfile: deleteProfile,
    deleteProfileYes: deleteProfileYes,
    account: account,
  },
  back: {
    toMenu: backToMenu,
  },
  other: {
    donate: donate,
    schedule: comingSoon,
    clearMessage: clearMessage,
  },
};

export default callbacks;
