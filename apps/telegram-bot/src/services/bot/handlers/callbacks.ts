import { Composer } from "grammy";
import keyboards from "../keyboards";

const callbacksHandler = new Composer();

callbacksHandler.callbackQuery("other", async (ctx) => {
  await ctx.editMessageText("Other", { reply_markup: keyboards.other });
});

export default callbacksHandler;
