import { Composer } from "grammy";
import { request, getAuthHeaders } from "../../../helpers/hc";
import { getDeadlineText } from "../utils";
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
        headers: getAuthHeaders(userId, 1),
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

  const [rmcUser, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  await ctx.editMessageText(`${rmcUser?.user.name}`, {
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
        headers: getAuthHeaders(userId, 1),
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
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!grades) {
    return;
  }

  console.log(grades);

  grades.forEach((grade) => {
    keyboards.grades
      .row()
      .text(grade.name.split(" | ")[0], `course_${grade.course_id}`);
  });

  const gradesKeyboards = keyboards.grades.row().text("Back ←", "back_to_menu");

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
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!grades) {
    await ctx.reply("Grades are not available.");
    return;
  }

  const gradesKeyboards = keyboards.grades;

  grades.forEach((grade) => {
    gradesKeyboards
      .row()
      .text(grade.name.split(" | ")[0], `course_${grade.course_id}`);
  });

  gradesKeyboards.row().text("Back ←", "back_to_menu");

  await ctx.editMessageText("Your courses:", { reply_markup: gradesKeyboards });
});

callbacksHandler.callbackQuery(/course_\d+/, async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;
  const courseId = ctx.match[0].split("_")[1];

  const [grades, _] = await request((client) =>
    client.v1.course[":courseId"].grades.$get(
      {
        param: {
          courseId: courseId,
        },
      },
      {
        headers: getAuthHeaders(userId, 1),
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
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!grades || !course) {
    await ctx.editMessageText("Grades for this course are not available.", {
      reply_markup: keyboards.single_grade.text(
        "Refresh",
        `refresh_grade_${courseId}`,
      ),
    });
    return;
  }

  console.log(course);
  console.log(grades);

  // let message: string = `${course.name.split(" | ")[0]}\n${course.name.split(" | ")[1]}\n\n`;

  // grades.forEach((grade) => {
  //   message += `${grade.name} → ${grade.graderaw}\n`;
  // });
});

// Delete profile
callbacksHandler.callbackQuery("delete_profile", async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [rmcUser, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!rmcUser) {
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
        headers: getAuthHeaders(userId, 1),
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
