import { ContextWithSession } from '..';

export async function isUser(ctx: ContextWithSession, next: () => Promise<void>) {
    if (ctx.session.role !== 'user' && ctx.session.role !== 'admin') {
        await ctx.reply("You dont have permission to use this command.");
        return; 
    }
    
    return next();
}
