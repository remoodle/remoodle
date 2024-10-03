import type { ContextWithSession } from "..";
import { User } from "../../db/models/User";

async function registerFromGroup(ctx: ContextWithSession) {  
    if (!ctx.from?.id){
        return await ctx.answerCallbackQuery({
            text: "Братан где айди",
            show_alert: true,
        });
    }
    var user = await User.findOne({ telegramId: ctx.from.id });
    if (user) {
        return await ctx.answerCallbackQuery({
            text: "Ты уже зареган бро",
            show_alert: true,
        });
    }
    user = new User({ telegramId: ctx.from.id, role: "user" });
    try {
        await user.save();
    }
    catch (e) {
        return await ctx.answerCallbackQuery({
            text: "Ошибка",
            show_alert: true,
        });
    }
    await user.save();
    return await ctx.answerCallbackQuery({
        text: "Зареган",
        show_alert: true,
    });

}

const callbacks = {
  registerFromGroup: registerFromGroup
};

export default callbacks;
