import { ContextWithSession } from '..';

export async function isAdmin(ctx: ContextWithSession, next: () => Promise<void>) {
    if (ctx.session.role !== 'user') {
        await ctx.reply("You dont have permission to use this command.");
        return; 
    }
    
    return next();
}
