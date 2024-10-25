import { InlineKeyboard, Context } from "grammy";
import TurndownService from "turndown";
import { request, getAuthHeaders } from "../../library/hc";
import {
  getDeadlineText,
  getGradeText,
  calculateGrades,
  getNotificationsKeyboard,
  truncateString,
  generateTotalGradesSortingKeyboard,
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

async function refreshDeadlines(ctx: Context) {
  if (!ctx || !ctx?.from || !ctx?.chat || !ctx?.match) {
    return;
  }

  const type = ctx.match[0].split("_")[2];

  const userId = ctx.from.id;

  const [deadlines, _] = await request((client) =>
    client.v1.deadlines.$get(
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

  if (!grades || !course) {
    await ctx.editMessageText("Grades for this course are not available.", {
      reply_markup: keyboards.single_grade,
    });
    return;
  }

  let message: string = `${course.name.split(" | ")[0]}\nTeacher: ${course.name.split(" | ")[1]}\n\n`;

  message += `${calculateGrades(grades)}`;

  grades.forEach((grade) => {
    message += `${getGradeText(grade)}`;
  });

  const keyboard = new InlineKeyboard()
    .text("Assignments", `course_assignments_${courseId}`)
    .row()
    .text("Back ←", "back_to_grades");

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

  const totalPages = Math.ceil(rmcCourses.length / 10);
  const startIndex = (page - 1) * 10;
  const endIndex = startIndex + 10;
  let courses = rmcCourses.slice(startIndex, endIndex);

  const coursesKeyboards = new InlineKeyboard();

  courses.forEach((course) => {
    coursesKeyboards
      .row()
      .text(
        course.name.split(" | ")[0],
        `past_course_${course.course_id}_${page}`,
      );
  });

  coursesKeyboards.row();

  if (page > 1) {
    coursesKeyboards.text("←", `old_grades_${page - 1}`);
  }

  coursesKeyboards.text("Back", "back_to_grades");

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
      reply_markup: new InlineKeyboard().text("Back ←", "settings"),
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
    client.v1.bye.$delete(
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

  const [user, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  return await ctx.editMessageText(
    "ReMoodle Account\n\nHandle:   `" +
      user?.handle +
      "`\nName:   `" +
      user?.name +
      "`\nMoodleID:   `" +
      user?.moodleId +
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
    return client.v1.course[":courseId"].$get(
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
    client.v1.course[":courseId"].assignments.$get(
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
        `assignment_${assignment.course_id}_${assignment.assignment_id}`,
      );
  });

  keyboard.row().text("Back ←", `inprogress_course_${courseId}`);

  await ctx.editMessageText(`Assignments\n*${course.name}*`, {
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

  if (courseError) {
    await ctx.editMessageText("Course error.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  if (!course) {
    await ctx.editMessageText("Course is not available.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  const [assignments, assignmentsError] = await request((client) =>
    client.v1.course[":courseId"].assignments.$get(
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
    (assignment) => assignment.assignment_id === assignmentId,
  );

  if (!assignment || !assignmentId) {
    await ctx.editMessageText("Assignment is not available.", {
      reply_markup: keyboardBack,
    });
    return;
  }

  let text = `*${assignment.name}*\n`;
  text += `*${course.name}*\n\n`;

  if (assignment.duedate && assignment.allowsubmissionsfromdate) {
    text += `*Opened:* ${formatUnixtimestamp(assignment.allowsubmissionsfromdate, true)}\n`;
    text += `*Due:* ${formatUnixtimestamp(assignment.duedate, true)}\n`;
  }

  if (assignment.gradeEntity && assignment.gradeEntity.percentage) {
    text += `*Grade:* ${assignment.gradeEntity.percentage}%\n\n`;
  } else {
    text += "\n";
  }

  if (assignment.intro) {
    const turndownService = new TurndownService();
    turndownService.remove(["script", "img", "iframe"]);
    const markdownIntro = turndownService.turndown(assignment.intro);

    if (assignment.intro.length > 700) {
      text += `${markdownIntro.slice(0, 700)}...\n\n`;
    } else {
      text += `${markdownIntro}\n\n`;
    }
  }

  return await ctx.editMessageText(text, {
    reply_markup: keyboardBack,
    parse_mode: "Markdown",
  });
}

async function totalGrades(ctx: Context) {
  if (!ctx.from || !ctx.match) {
    return;
  }

  const sortBy = ctx.match[0].split("_")[2];
  const sortDir = ctx.match[0].split("_")[3];

  const userId = ctx.from.id;

  const [coursesOverall, error] = await request((client) =>
    client.v1.courses.overall.$get(
      {
        query: {
          status: undefined,
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  if (!coursesOverall || error) {
    console.log("parasha", coursesOverall, error);
    return;
  }

  const keyboard = generateTotalGradesSortingKeyboard(sortBy, sortDir);

  coursesOverall.sort((a, b) => {
    const direction = sortDir === "asc" ? 1 : -1;

    if (sortBy === "name") {
      return direction * a.name.localeCompare(b.name);
    } else if (sortBy === "grade") {
      const gradeA =
        a.grades?.find((grade) => grade.itemtype === "course")?.graderaw ?? 0;
      const gradeB =
        b.grades?.find((grade) => grade.itemtype === "course")?.graderaw ?? 0;
      return direction * (gradeA - gradeB);
    } else {
      return 0;
    }
  });

  let result = "Total grades for all courses:\n\n";

  coursesOverall.forEach((course) => {
    result += `${truncateString(course.name.split(" | ")[0], 21)}  →  *${Math.ceil(course?.grades?.find((grade) => grade.itemtype === "course")?.graderaw ?? 0)}*\n`;
  });

  await ctx.editMessageText(result, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
  // pass
}

const callbacks = {
  menu: {
    others: others,
    settings: settings,
    deadlines: deadlines,
    grades: grades,
    totalGrades: totalGrades,
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
    toGrades: backToGrades,
  },
  other: {
    donate: donate,
    schedule: comingSoon,
  },
};

export default callbacks;
