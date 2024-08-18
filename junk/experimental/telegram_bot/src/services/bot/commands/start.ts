import type { Context } from "telegraf";
import type { Update } from "@telegraf/types";

import { client } from "../../../library/rpc";
import type { ICommand } from "./types";

export class StartCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    // @ts-ignore
    const messageText = ctx.message.text;

    const otp = messageText.split(" ")[1];

    const response = await client.v1.telegram.otp.verify.$post(
      {
        json: {
          otp,
        },
      },
      {
        headers: {
          Authorization: `Basic aboba::${ctx.from?.id}::0`,
        },
      },
    );

    if (!response.ok) {
      await ctx.reply(
        "Invalid or expired OTP. Please try again from the website.",
      );
    }

    await ctx.reply("✌️");
  };
}
