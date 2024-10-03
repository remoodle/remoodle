import type { ContextWithSession } from "..";

async function start(ctx: ContextWithSession) {
  if (!ctx.session.role) {
    console.log("Only authorized people can use bot, bye");
  }
}

const commands = {
  start: start,
};

export default commands;
