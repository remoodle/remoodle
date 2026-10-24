import { createCallbackData } from "callback-data";

export const menuCallback = createCallbackData("menu", {});

export const setupCallback = createCallbackData("setup", {});

export const settingsCallback = createCallbackData("settings", {});

export const deadlinesSettingsCallback = createCallbackData("deadlines_settings", {});

export const classRemindersCallback = createCallbackData("class_reminders", {});

// `offset` is an ISO duration, or "off" to disable class reminders.
export const setClassReminderCallback = createCallbackData("set_class_reminder", {
  offset: String,
});

export const customClassReminderCallback = createCallbackData("custom_class_reminder", {});

export const digestSettingsCallback = createCallbackData("digest_settings", {});

export const toggleThresholdCallback = createCallbackData("toggle_threshold", {
  threshold: String,
});

export const toggleDeadlinesCallback = createCallbackData("toggle_deadlines", {});

export const deadlinesCallback = createCallbackData("deadlines", {});

export const scheduleCallback = createCallbackData("schedule", {});

export const scheduleViewCallback = createCallbackData("schedule_view", { view: String });

export const updateCalendarCallback = createCallbackData("update_calendar", { from: String });

export const myDuCallback = createCallbackData("my_du", {});

export const myDuPeriodCallback = createCallbackData("my_du_period", {});

export const myDuTermCallback = createCallbackData("my_du_term", { term: Number });

export const myDuSignInCallback = createCallbackData("my_du_sign_in", {});

export const myDuSyncCallback = createCallbackData("my_du_sync", {});

export const myDuDisconnectCallback = createCallbackData("my_du_disconnect", {
  confirmed: String,
});

export const loginCallback = createCallbackData("login", { code: String, confirmed: String });

export const coursesCallback = createCallbackData("courses", {});

export const aboutCallback = createCallbackData("about", {});

export const toggleCourseCallback = createCallbackData("toggle_course", { idx: String });

export const courseScheduleCallback = createCallbackData("course_schedule", { idx: String });

export const toggleCourseScheduleFilterCallback = createCallbackData("toggle_course_filter", {
  idx: String,
  key: String,
});

export const toggleLearnCallback = createCallbackData("toggle_learn", {});

export const toggleScheduleMergeCallback = createCallbackData("toggle_sched_merge", {});

export const toggleDigestCallback = createCallbackData("toggle_digest", {});

export const setDigestTimeCallback = createCallbackData("set_digest_time", {});

export const toggleDigestWeekdayCallback = createCallbackData("toggle_digest_day", {
  day: String,
});

export const accountCallback = createCallbackData("account", {});

export const deleteAccountCallback = createCallbackData("delete_account", {});

export const confirmDeleteAccountCallback = createCallbackData("confirm_delete_account", {
  confirmed: String,
});

export const roomPhotoCallback = createCallbackData("room_photo", { room: String });

export const closeMessageCallback = createCallbackData("close_msg", {});
