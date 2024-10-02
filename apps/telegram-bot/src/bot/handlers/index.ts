import { Composer } from "grammy";
import callbacks from "./callback-handlers";
import {commands} from "./command-handlers";
import MyContext from "..";

const commandsHandler = new Composer<MyContext>();

commandsHandler.command("start", commands.start);
commandsHandler.command("deadlines", commands.deadlines);

const callbacksHandler = new Composer();

// Menu buttons
callbacksHandler.callbackQuery("others", callbacks.menu.others);
callbacksHandler.callbackQuery("settings", callbacks.menu.settings);
callbacksHandler.callbackQuery("deadlines", callbacks.menu.deadlines);
callbacksHandler.callbackQuery("grades", callbacks.menu.grades);

// Deadlines buttons
callbacksHandler.callbackQuery(
  /^refresh_deadlines_(.+)/,
  callbacks.deadlines.refresh,
);

// Settings buttons
callbacksHandler.callbackQuery(
  "notifications",
  callbacks.settings.notifications,
);
callbacksHandler.callbackQuery(
  /^change_notifications_(.+)_(.+)/,
  callbacks.settings.changeNotifications,
);

// Delete profile (Settings)
callbacksHandler.callbackQuery(
  "delete_profile",
  callbacks.settings.deleteProfile,
);
callbacksHandler.callbackQuery(
  "delete_profile_yes",
  callbacks.settings.deleteProfileYes,
);

// Grades buttons
callbacksHandler.callbackQuery(
  /inprogress_course_\d+/,
  callbacks.grades.inProgressCourse,
);

callbacksHandler.callbackQuery(/old_grades_\d+/, callbacks.grades.pastCourses);
callbacksHandler.callbackQuery(
  /past_course_\d+_\d+/,
  callbacks.grades.pastCourse,
);

// Back buttons
callbacksHandler.callbackQuery("back_to_menu", callbacks.back.toMenu);
callbacksHandler.callbackQuery("back_to_settings", callbacks.back.toSettings);
callbacksHandler.callbackQuery("back_to_grades", callbacks.back.toGrades);
callbacksHandler.callbackQuery("back_to_account", callbacks.back.toAccount);

// Extra
callbacksHandler.callbackQuery("donate", callbacks.other.donate);
callbacksHandler.callbackQuery(
  "schedule_coming_soon",
  callbacks.other.schedule,
);
callbacksHandler.callbackQuery("account", callbacks.settings.account);

export { commandsHandler, callbacksHandler };
