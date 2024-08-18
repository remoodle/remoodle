import type { Context } from "telegraf";

export interface ICommand {
  execute(ctx: Context): Promise<void>;
}
