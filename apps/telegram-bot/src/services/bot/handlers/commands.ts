import { Composer } from "grammy";
import { request, getAuthHeaders } from "../../../helpers/hc";
import { MyContext as Context } from "../types";

const commandsHandler = new Composer();

commandsHandler.command("start", async (ctx: Context) => {
  if (ctx.from === undefined) {
    return;
  }

  const userId = ctx.from.id;

  const [data, error] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!error) {
    // User is already connected
    // Send START keyboard
  }

  await ctx.reply(
    `Welcome to ReMoodle! ✨\nTo start using bot, send your Moodle token by typing ~~~/token YOUR_TOKEN~~~`,
  );
});

export default commandsHandler;
