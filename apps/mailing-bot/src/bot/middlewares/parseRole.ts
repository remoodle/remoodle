import { ContextWithSession } from "..";
import { User } from "../../db/models/User";

export async function parseRole(ctx: ContextWithSession, next: () => Promise<void>) {
    if (!ctx.from?.id){
        return await next();
    }
    var user = await User.findOne({ telegramId: ctx.from.id });
    if (user) {
        ctx.session.role = user.role;
    }
    await next();
}