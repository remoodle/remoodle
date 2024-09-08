import { InlineKeyboard } from "grammy";

const keyboards = {
  main: new InlineKeyboard()
    .text("Deadlines", "deadlines")
    .row()
    .text("Courses", "grades")
    .row()
    .webApp("Map", "https://yuujiso.github.io/aitumap/")
    .webApp("Schedule", "https://remoodle.app")
    .row()
    .text("⚙️", "settings")
    .text("More", "others"),

  single_grade: new InlineKeyboard().text("Back ←", "back_to_grades"),

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
    .url("Terms of Service", "https://ext.remoodle.app/terms-of-service")
    .row()
    .text("Back ←", "back_to_menu"),

  delete_profile: new InlineKeyboard()
    .text("Yes ✅", "delete_profile_yes")
    .text("No ❌", "back_to_settings"),

  settings: new InlineKeyboard()
    .text("Notifications", "notifications")
    .text("⚠️ Delete Profile ⚠️", "delete_profile")
    .row()
    .text("Back ←", "back_to_menu"),

  find_token: new InlineKeyboard().url(
    "How to find your token",
    "https://ext.remoodle.app/find-token",
  ),
};

export default keyboards;
