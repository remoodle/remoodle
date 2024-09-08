import { Composer } from "grammy";
import callbacks from "../callbacks";

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
callbacksHandler.callbackQuery(/^refresh_grade_\d+/, callbacks.grades.refresh);
callbacksHandler.callbackQuery(/old_grades_\d+/, callbacks.grades.pastCourses);
callbacksHandler.callbackQuery(
  /past_course_\d+_\d+/,
  callbacks.grades.pastCourse,
);

// Back buttons
callbacksHandler.callbackQuery("back_to_menu", callbacks.back.toMenu);
callbacksHandler.callbackQuery("back_to_settings", callbacks.back.toSettings);
callbacksHandler.callbackQuery("back_to_grades", callbacks.back.toGrades);

callbacksHandler.callbackQuery("donate", callbacks.other.donate);

export default callbacksHandler;
