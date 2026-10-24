import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import * as myDuRepository from "../../db/repositories/my-du";
import * as usersRepository from "../../db/repositories/users";
import { UserFacingError } from "../../library/errors";
import { m } from "../../library/i18n/messages.js";
import {
  MY_DU_TERMS,
  parseFirstWeekStart,
  type MyDuPeriod,
  type MyDuTerm,
} from "../../library/my-du/schemas";
import {
  changePeriod,
  completeLogin,
  disconnect,
  readSchedule,
  requestSync,
  startLogin,
} from "../../library/my-du/service";
import { START_PAYLOADS } from "../../library/telegram";
import { bold, italic } from "../../library/telegram-html";
import {
  myDuCallback,
  myDuDisconnectCallback,
  myDuPeriodCallback,
  myDuSignInCallback,
  myDuSyncCallback,
  myDuTermCallback,
  scheduleSettingsCallback,
} from "../callback-data";

type Schedule = Awaited<ReturnType<typeof readSchedule>>;

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Almaty",
  dateStyle: "medium",
  timeStyle: "short",
});

function termLabel(term: number) {
  return term === -1 ? m.my_du_term_additional() : m.my_du_term_number({ term });
}

function buildStatusMessage({ connection, events }: Schedule) {
  if (!connection) {
    return [bold(m.my_du_header()), "", m.my_du_intro()].join("\n");
  }

  const lines = [
    bold(m.my_du_header()),
    "",
    connection.connected ? m.my_du_status_connected() : m.my_du_status_paused(),
    m.my_du_period({
      years: `${connection.studyYear}–${connection.studyYear + 1}`,
      term: termLabel(connection.term),
    }),
    m.my_du_week_start({ date: connection.firstWeekStart }),
    m.my_du_classes({ count: events.length }),
  ];

  if (connection.lastSyncedAt) {
    lines.push(m.my_du_last_synced({ date: dateTimeFormat.format(connection.lastSyncedAt) }));
  }

  if (connection.syncError) {
    lines.push("", italic(m.my_du_sync_error({ error: connection.syncError })));
  }

  return lines.join("\n");
}

function buildStatusKeyboard({ connection }: Schedule) {
  const keyboard = new InlineKeyboard();

  if (!connection) {
    keyboard.text(m.my_du_button_connect(), myDuPeriodCallback.pack({}));
  } else if (connection.connected) {
    keyboard
      .text(m.my_du_button_sync(), myDuSyncCallback.pack({}))
      .text(m.my_du_button_change_period(), myDuPeriodCallback.pack({}))
      .row()
      .text(m.my_du_button_disconnect(), myDuDisconnectCallback.pack({ confirmed: "ask" }));
  } else {
    keyboard
      .text(m.my_du_button_reconnect(), myDuSignInCallback.pack({}))
      .text(m.my_du_button_change_period(), myDuPeriodCallback.pack({}));
  }

  return keyboard.row().text(m.ui_back(), scheduleSettingsCallback.pack({}));
}

function buildTermKeyboard() {
  const keyboard = new InlineKeyboard();

  for (const term of MY_DU_TERMS) {
    keyboard
      .text(
        term === -1 ? m.my_du_button_term_additional() : m.my_du_button_term({ term }),
        myDuTermCallback.pack({ term }),
      )
      .row();
  }

  return keyboard.text(m.ui_back(), myDuCallback.pack({}));
}

function backToStatusKeyboard() {
  return new InlineKeyboard().text(m.ui_back(), myDuCallback.pack({}));
}

function isTerm(value: number): value is MyDuTerm {
  return MY_DU_TERMS.some((term) => term === value);
}

// Opening My DU from setup is how many users register, so the account is created here.
async function findUserId(ctx: Context & { from: { id: number } }) {
  const { id } = await usersRepository.upsertByTelegramId(ctx.from.id);

  return id;
}

function clearOtherPrompts(ctx: Context) {
  ctx.session.awaitingMoodleCalendarUrl = false;
  ctx.session.awaitingScheduleReminderMinutes = false;
  ctx.session.awaitingDigestTime = false;
}

async function showStatus(ctx: Context & { from: { id: number } }, mode: "edit" | "reply") {
  ctx.session.myDuSetup = undefined;
  const schedule = await readSchedule(await findUserId(ctx));
  const options = { parse_mode: "HTML" as const, reply_markup: buildStatusKeyboard(schedule) };

  if (mode === "edit") {
    await ctx.editMessageText(buildStatusMessage(schedule), options);
  } else {
    await ctx.reply(buildStatusMessage(schedule), options);
  }
}

async function sendSignIn(ctx: Context & { from: { id: number } }, period: MyDuPeriod) {
  clearOtherPrompts(ctx);
  const { url } = await startLogin(await findUserId(ctx));
  ctx.session.myDuSetup = { step: "link", period };

  await ctx.reply(m.my_du_sign_in_prompt(), {
    reply_markup: new InlineKeyboard()
      .url(m.my_du_button_sign_in(), url)
      .row()
      .text(m.ui_cancel(), myDuCallback.pack({})),
  });
}

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("mydu", (ctx) => showStatus(ctx, "reply"));

feature.command("start", async (ctx, next) => {
  if (ctx.match !== START_PAYLOADS.myDu) return next();
  await showStatus(ctx, "reply");
});

feature.callbackQuery(myDuCallback.filter(), async (ctx) => {
  await showStatus(ctx, "edit");
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(myDuPeriodCallback.filter(), async (ctx) => {
  ctx.session.myDuSetup = undefined;
  await ctx.editMessageText(m.my_du_term_prompt(), { reply_markup: buildTermKeyboard() });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(myDuTermCallback.filter(), async (ctx) => {
  const { term } = myDuTermCallback.unpack(ctx.callbackQuery.data);

  if (!isTerm(term)) {
    await ctx.answerCallbackQuery();

    return;
  }

  clearOtherPrompts(ctx);
  ctx.session.myDuSetup = { step: "week_start", term };
  await ctx.editMessageText(m.my_du_week_prompt(), { reply_markup: backToStatusKeyboard() });
  await ctx.answerCallbackQuery();
});

// Reconnecting keeps the saved period; a failed attempt retries with the period being set up.
feature.callbackQuery(myDuSignInCallback.filter(), async (ctx) => {
  const setup = ctx.session.myDuSetup;
  const connection = await myDuRepository.findConnection(await findUserId(ctx));

  const period =
    setup?.step === "link"
      ? setup.period
      : connection && isTerm(connection.term)
        ? { term: connection.term, firstWeekStart: connection.firstWeekStart }
        : undefined;

  await ctx.answerCallbackQuery();

  if (!period) {
    await ctx.editMessageText(m.my_du_term_prompt(), { reply_markup: buildTermKeyboard() });

    return;
  }

  await sendSignIn(ctx, period);
});

feature.callbackQuery(myDuSyncCallback.filter(), async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(m.my_du_importing());

  try {
    await requestSync(await findUserId(ctx));
  } catch (error) {
    if (!(error instanceof UserFacingError)) throw error;
  }

  await showStatus(ctx, "edit");
});

feature.callbackQuery(myDuDisconnectCallback.filter(), async (ctx) => {
  const { confirmed } = myDuDisconnectCallback.unpack(ctx.callbackQuery.data);

  if (confirmed === "ask") {
    await ctx.editMessageText(m.my_du_disconnect_prompt(), {
      reply_markup: new InlineKeyboard()
        .text(
          m.my_du_button_confirm_disconnect(),
          myDuDisconnectCallback.pack({ confirmed: "yes" }),
        )
        .text(m.ui_cancel(), myDuCallback.pack({})),
    });
    await ctx.answerCallbackQuery();

    return;
  }

  await disconnect(await findUserId(ctx));
  await showStatus(ctx, "edit");
  await ctx.answerCallbackQuery();
});

feature.on("message:text", async (ctx, next) => {
  const setup = ctx.session.myDuSetup;

  // Commands keep working mid-setup; `start` and `update` clear the setup themselves.
  if (!setup || ctx.message.text.startsWith("/")) return next();

  const text = ctx.message.text.trim();
  const userId = await findUserId(ctx);

  if (setup.step === "week_start") {
    const firstWeekStart = parseFirstWeekStart(text);

    if (!firstWeekStart) {
      await ctx.reply(m.my_du_week_invalid(), { reply_markup: backToStatusKeyboard() });

      return;
    }

    const period = { term: setup.term, firstWeekStart };
    const connection = await myDuRepository.findConnection(userId);

    if (!connection?.credentials) {
      await sendSignIn(ctx, period);

      return;
    }

    ctx.session.myDuSetup = undefined;
    const progress = await ctx.reply(m.my_du_importing());
    await changePeriod(userId, period);
    await progress.delete().catch(() => {});
    await showStatus(ctx, "reply");

    return;
  }

  // The pasted address carries a one-time login code; keep it out of the chat history.
  await ctx.deleteMessage().catch(() => {});
  const progress = await ctx.reply(m.my_du_importing());

  try {
    await completeLogin(userId, text, setup.period);
  } catch (error) {
    if (!(error instanceof UserFacingError)) throw error;

    await progress.editText(error.message, {
      reply_markup: new InlineKeyboard()
        .text(m.my_du_button_sign_in_again(), myDuSignInCallback.pack({}))
        .row()
        .text(m.ui_cancel(), myDuCallback.pack({})),
    });

    return;
  }

  await progress.editText(m.my_du_connected());
  await showStatus(ctx, "reply");
});

export { composer as myDuFeature };
