import { InlineKeyboard } from "grammy";

const keyboards = {
  main: new InlineKeyboard()
    .text("Deadlines", "deadlines")
    .row()
    .text("Grades", "grades")
    .row()
    .webApp("Map", "https://yuujiso.github.io/aitumap/")
    .webApp("Schedule", "https://remoodle.app")
    .row()
    .text("⚙️", "settings")
    .text("Others", "others"),

  grades: new InlineKeyboard(),

  deadlines: new InlineKeyboard()
    .text("Back ←", "back_to_menu")
    .text("Refresh", "refresh_deadlines"),

  others: new InlineKeyboard()
    .url("Contact Us", "https://t.me/remoodle")
    .webApp("Docs", "https://ext.remoodle.app/docs")
    // .row()
    // .webApp("Privacy Policy", "https://ext.remoodle.app/privacy-policy")
    // .webApp("Terms of Service", "https://ext.remoodle.app/terms-of-service")
    .row()
    .text("Back ←", "back_to_menu"),

  delete_profile: new InlineKeyboard()
    .text("Yes ✅", "delete_profile_yes")
    .text("No ❌", "back_to_settings"),

  settings: new InlineKeyboard()
    .text("Delete Profile", "delete_profile")
    .row()
    .text("Back ←", "back_to_menu"),

  find_token: new InlineKeyboard().webApp(
    "How to find your token",
    "https://ext.remoodle.app/find-token",
  ),
};

export default keyboards;
