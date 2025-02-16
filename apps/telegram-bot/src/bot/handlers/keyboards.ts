import { InlineKeyboard } from "grammy";

const keyboards = {
  main: new InlineKeyboard()
    .text("Deadlines", "deadlines")
    .row()
    .text("Courses", "grades")
    .row()
    .webApp("Map", "https://aitumap.remoodle.app")
    // .webApp("Schedule", "https://remoodle.app/schedule")
    .text("Schedule", "schedule_coming_soon")
    .row()
    .text("⚙️", "settings")
    .text("More", "others")
    .row(),

  single_grade: new InlineKeyboard().row().text("Back ←", "back_to_grades"),

  deadlines: new InlineKeyboard()
    .text("Back ←", "back_to_menu")
    .text("Refresh", "refresh_deadlines_menu"),

  single_deadline: new InlineKeyboard().text(
    "Refresh",
    "refresh_deadlines_single",
  ),

  others: new InlineKeyboard()
    .url("Contact Us", "https://t.me/remoodle")
    .url("Docs", "https://ext.remoodle.app/docs")
    .row()
    .url("Privacy Policy", "https://ext.remoodle.app/privacy-policy")
    .text("Donate 💵", "donate")
    .row()
    .text("Back ←", "back_to_menu"),

  delete_profile: new InlineKeyboard()
    .text("Yes", "delete_profile_yes")
    .text("Cancel", "account"),

  settings: new InlineKeyboard()
    .text("Notifications", "notifications")
    .text("Account", "account")
    .row()
    .text("Back ←", "back_to_menu"),

  account: new InlineKeyboard()
    .text("⚠️ Delete Profile ⚠️", "delete_profile")
    .row()
    .text("Back ←", "settings"),

  find_token: new InlineKeyboard().url(
    "How to find your token",
    "https://ext.remoodle.app/find-token",
  ),
};

export default keyboards;
