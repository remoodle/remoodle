import { Composer, InputFile, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { config } from "../../config";
import { m } from "../../library/i18n/messages.js";
import { database } from "../../db";
import {
  applyScheduleFilters,
  DEFAULT_SCHEDULE_FILTERS,
  normalizeScheduleFilters,
} from "../../library/schedule/filters";
import {
  buildTodayScheduleMessage,
  buildWeeklyScheduleMessage,
  buildNextWeekScheduleMessage,
} from "../../library/schedule/messages";
import {
  getScheduleForDay,
  getScheduleForDays,
  getDayName,
  getRemainingDaysOfWeek,
  hasRemainingClassesThisWeek,
  mergeAdjacentScheduleItems,
  toWeeklySchedule,
} from "../../library/schedule/week";
import { getUniqueRooms, sanitizeRoomFilename } from "../../library/rooms";
import {
  scheduleCallback,
  scheduleViewCallback,
  menuCallback,
  roomPhotoCallback,
  closeMessageCallback,
} from "../callback-data";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

type ScheduleView = "today" | "week" | "next_week";

async function fetchScheduleMessage(
  userId: number,
  excludedCourses: string[],
  scheduleFilters: typeof DEFAULT_SCHEDULE_FILTERS,
  view: ScheduleView,
): Promise<{ message: string; rooms: string[]; hasThisWeek: boolean }> {
  const rawItems = await database.myDu.findSchedule(userId);
  const now = new Date();
  const items = toWeeklySchedule(rawItems, now, view === "next_week" ? 1 : 0);
  const filters = normalizeScheduleFilters(scheduleFilters);
  const filtered = applyScheduleFilters(items, filters, excludedCourses);
  const merged = filters.combineAdjacentPairs ? mergeAdjacentScheduleItems(filtered) : filtered;

  const hasThisWeek = hasRemainingClassesThisWeek(
    applyScheduleFilters(toWeeklySchedule(rawItems, now), filters, excludedCourses),
    now,
  );

  const message =
    view === "week"
      ? buildWeeklyScheduleMessage(merged, now)
      : view === "next_week"
        ? buildNextWeekScheduleMessage(merged)
        : buildTodayScheduleMessage(merged, now);

  const visibleItems =
    view === "today"
      ? getScheduleForDay(merged, getDayName(now))
      : view === "week"
        ? getScheduleForDays(merged, getRemainingDaysOfWeek(now))
        : merged;

  const rooms = getUniqueRooms(visibleItems);

  return { message, rooms, hasThisWeek };
}

function buildScheduleKeyboard(view: ScheduleView, rooms: string[], hasThisWeek: boolean) {
  const keyboard = new InlineKeyboard();

  if (view === "today") {
    if (hasThisWeek) {
      keyboard.text(m.schedule_button_this_week(), scheduleViewCallback.pack({ view: "week" }));
    }

    keyboard.text(m.schedule_button_next_week(), scheduleViewCallback.pack({ view: "next_week" }));
  } else if (view === "week") {
    keyboard
      .text(m.schedule_button_today_back(), scheduleViewCallback.pack({ view: "today" }))
      .text(m.schedule_button_next_week(), scheduleViewCallback.pack({ view: "next_week" }));
  } else {
    keyboard.text(m.schedule_button_today_back(), scheduleViewCallback.pack({ view: "today" }));

    if (hasThisWeek) {
      keyboard.text(
        m.schedule_button_this_week_back(),
        scheduleViewCallback.pack({ view: "week" }),
      );
    }
  }

  if (rooms.length > 0) {
    for (let i = 0; i < rooms.length; i += 2) {
      keyboard.row();

      for (const room of rooms.slice(i, i + 2)) {
        keyboard.text(m.ui_room_map({ room }), roomPhotoCallback.pack({ room }));
      }
    }
  }

  keyboard.row().text(m.ui_back(), menuCallback.pack({}));

  return keyboard;
}

async function replyWithScheduleView(ctx: Context, view: ScheduleView) {
  if (!ctx.from?.id) {
    return;
  }

  const user = await database.users.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.reply(m.not_registered());

    return;
  }

  if (!user.hasSchedule) {
    await ctx.reply(m.no_group_schedule_command());

    return;
  }

  await ctx.replyWithChatAction("typing");

  let result: { message: string; rooms: string[]; hasThisWeek: boolean };

  try {
    result = await fetchScheduleMessage(
      user.id,
      user.excludedCourses,
      user.scheduleFilters ?? DEFAULT_SCHEDULE_FILTERS,
      view,
    );
  } catch {
    await ctx.reply(m.schedule_fetch_failed());

    return;
  }

  await ctx.reply(result.message, {
    parse_mode: "HTML",
    reply_markup: buildScheduleKeyboard(view, result.rooms, result.hasThisWeek),
  });
}

feature.command("today", async (ctx) => {
  await replyWithScheduleView(ctx, "today");
});

feature.command("schedule", async (ctx) => {
  await replyWithScheduleView(ctx, "next_week");
});

feature.callbackQuery(scheduleCallback.filter(), async (ctx) => {
  const user = await database.users.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  if (!user.hasSchedule) {
    await ctx.answerCallbackQuery({
      text: m.no_group_schedule_callback(),
      show_alert: true,
    });

    return;
  }

  await ctx.answerCallbackQuery();

  let result: { message: string; rooms: string[]; hasThisWeek: boolean };

  try {
    result = await fetchScheduleMessage(
      user.id,
      user.excludedCourses,
      user.scheduleFilters ?? DEFAULT_SCHEDULE_FILTERS,
      "today",
    );
  } catch {
    await ctx.editMessageText(m.schedule_fetch_failed_short(), {
      reply_markup: buildScheduleKeyboard("today", [], false),
    });

    return;
  }

  await ctx.editMessageText(result.message, {
    parse_mode: "HTML",
    reply_markup: buildScheduleKeyboard("today", result.rooms, result.hasThisWeek),
  });
});

feature.callbackQuery(scheduleViewCallback.filter(), async (ctx) => {
  const { view } = scheduleViewCallback.unpack(ctx.callbackQuery.data);

  if (view !== "today" && view !== "week" && view !== "next_week") {
    await ctx.answerCallbackQuery();

    return;
  }

  const user = await database.users.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  if (!user.hasSchedule) {
    await ctx.answerCallbackQuery({
      text: m.no_group_schedule_callback(),
      show_alert: true,
    });

    return;
  }

  await ctx.answerCallbackQuery();

  let result: { message: string; rooms: string[]; hasThisWeek: boolean };

  try {
    result = await fetchScheduleMessage(
      user.id,
      user.excludedCourses,
      user.scheduleFilters ?? DEFAULT_SCHEDULE_FILTERS,
      view,
    );
  } catch {
    await ctx.editMessageText(m.schedule_fetch_failed_short(), {
      reply_markup: buildScheduleKeyboard(view, [], false),
    });

    return;
  }

  await ctx.editMessageText(result.message, {
    parse_mode: "HTML",
    reply_markup: buildScheduleKeyboard(view, result.rooms, result.hasThisWeek),
  });
});

feature.callbackQuery(roomPhotoCallback.filter(), async (ctx) => {
  const { room } = roomPhotoCallback.unpack(ctx.callbackQuery.data);
  const url = `${config.roomsCdnUrl}/${sanitizeRoomFilename(room)}.png`;

  await ctx.answerCallbackQuery();

  const closeKeyboard = new InlineKeyboard().text(m.ui_close(), closeMessageCallback.pack({}));

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await ctx.replyWithPhoto(new InputFile(buffer, `${sanitizeRoomFilename(room)}.png`), {
      caption: room,
      reply_markup: closeKeyboard,
    });
  } catch {
    await ctx.reply(m.room_no_photo({ room }), {
      reply_markup: closeKeyboard,
    });
  }
});

feature.callbackQuery(closeMessageCallback.filter(), async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();
});

export { composer as scheduleFeature };
