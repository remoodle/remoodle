import { ContextWithSession } from "..";
import { User } from "../../db/models/User";

async function register(ctx: ContextWithSession) {
  if (ctx.chat?.type !== "private") {
    return sendRegistrationMessage(ctx)
    
  }
  if (!ctx.message || !ctx.message.text) {
    await ctx.reply("Invalid message format.");
    return;
  }
  const commandParts = ctx.message.text.split(" ");
  if (commandParts.length < 2) {
    await ctx.reply("Please provide a valid username. Example: /register @username");
    return;
  }

  const username = commandParts[1].replace("@", ""); 

  const user = await User.findOne({ username }); 

  if (!user) {
    await ctx.reply("This user has not interacted with the bot yet or is not found.");
    return;
  }

  user.role = "user"; 
  await user.save();

  await ctx.reply(`User ${username} has been successfully registered with role ${user.role}.`);
}

async function sendRegistrationMessage(ctx: ContextWithSession) {
  return await ctx.reply("inGroup registration process...", {
    reply_markup: {
      inline_keyboard: [[{ text: "Register", callback_data: "registerFromGroup" }]],
    },
  });
}

const adminCommands = {
  register: register,
};

export default adminCommands;


