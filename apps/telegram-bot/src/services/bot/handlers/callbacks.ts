import { Composer, InlineKeyboard } from "grammy";
import { request, getAuthHeaders } from "../../../helpers/hc";
import { getDeadlineText, getGradeText, calculateGrades } from "../utils";
import keyboards from "../keyboards";

const callbacksHandler = new Composer();

// Menu buttons
callbacksHandler.callbackQuery("others", async (ctx) => {
  await ctx.editMessageText("Other", { reply_markup: keyboards.others });
});

callbacksHandler.callbackQuery("settings", async (ctx) => {
  await ctx.editMessageText("Settings", { reply_markup: keyboards.settings });
});

callbacksHandler.callbackQuery("deadlines", async (ctx) => {
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
});

// Back buttons
callbacksHandler.callbackQuery("back_to_menu", async (ctx) => {
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
});

callbacksHandler.callbackQuery("back_to_settings", async (ctx) => {
  await ctx.editMessageText("Settings", { reply_markup: keyboards.settings });
});

callbacksHandler.callbackQuery(/^refresh_deadlines_(.+)/, async (ctx) => {
  if (!ctx.from || !ctx.chat) {
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
});

// Grades
callbacksHandler.callbackQuery("grades", async (ctx) => {
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
});

callbacksHandler.callbackQuery("back_to_grades", async (ctx) => {
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
});

callbacksHandler.callbackQuery(/inprogress_course_\d+/, async (ctx) => {
  if (!ctx.from) {
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
});

callbacksHandler.callbackQuery(/^refresh_grade_\d+/, async (ctx) => {
  if (!ctx.from) {
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
});

// Old courses
callbacksHandler.callbackQuery(/old_grades_\d+/, async (ctx) => {
  if (!ctx.from) {
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

  rmcCourses = Object.entries(rmcCourses).map(([k, v]) => ({ ...v, id: k }));

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

  const coursesKeyboards = new InlineKeyboard();

  courses.forEach((course) => {
    coursesKeyboards
      .row()
      .text(
        course.name.split(" | ")[0],
        `past_course_${course.course_id}_${page}`,
      );
  });

  if (page === 1) {
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

  await ctx.editMessageText("Your past courses:", {
    reply_markup: coursesKeyboards,
  });
});

callbacksHandler.callbackQuery(/past_course_\d+_\d+/, async (ctx) => {
  if (!ctx.from) {
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
});

// Notifications
callbacksHandler.callbackQuery("notifications", async (ctx) => {
  if (!ctx.from) {
    return;
  }
  const userId = ctx.from.id;

  const keyboard = new InlineKeyboard();
  keyboard
    .text(`Telegram Notifications`, "change_notifications_telegram")
    .row()
    .text(`Grades`, "change_notifications_grades")
    .text(`Deadlines`, "change_notifications_deadlines")
    .row()
    .text("Back ←", "back_to_settings");
});

// Delete profile
callbacksHandler.callbackQuery("delete_profile", async (ctx) => {
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
    `Are you sure to delete your ReMoodle profile?\nThis action is not irreversible and will delete all related data to you.`,
    {
      reply_markup: keyboards.delete_profile,
    },
  );
});

callbacksHandler.callbackQuery("delete_profile_yes", async (ctx) => {
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
});

export default callbacksHandler;
