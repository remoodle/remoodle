import { InlineKeyboard } from "grammy";

const keyboards = {
  main: new InlineKeyboard()
    .text("Deadlines", "deadlines")
    .row()
    .text("Grades", "grades")
    .row()
    .webApp("Map", "https://yuujiso.github.io/aitumap/")
    .text("Other", "other"),
  other: new InlineKeyboard()
    .url("Contact us", "https://t.me/remoodle")
    .text("Delete profile", "delete_profile")
    .row(),
  // .text("Back ←", "back"),
  delete_profile: new InlineKeyboard()
    .text("Yes", "delete_profile_yes")
    .text("No", "delete_profile_no"),
};

export default keyboards;
