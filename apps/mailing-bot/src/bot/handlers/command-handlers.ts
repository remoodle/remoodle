import type { ContextWithSession } from "..";

async function start(ctx: ContextWithSession) {
  if (!ctx.session.role) {
    return await ctx.reply("You are not registered. Please contact the admin.");
  }
  
}

const commands = {
  start: start,
};

export default commands;
