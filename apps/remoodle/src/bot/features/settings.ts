import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { config } from "../../config";
import * as usersRepository from "../../db/repositories/users";
import type { UserWithSchedule } from "../../db/repositories/users";
import { durationToMs, formatDuration } from "../../library/dates";
import { AVAILABLE_THRESHOLDS } from "../../library/deadline-reminders";
import {
  isValidDigestTime,
  normalizeDigestWeekdays,
  normalizeScheduleFilters,
  DIGEST_WEEKDAYS,
} from "../../library/schedule";
import { m } from "../../library/i18n/messages.js";
import { bold, code } from "../../library/telegram-html";
import {
  settingsCallback,
  deadlinesSettingsCallback,
  classRemindersCallback,
  setClassReminderCallback,
  customClassReminderCallback,
  digestSettingsCallback,
  toggleThresholdCallback,
  toggleDeadlinesCallback,
  toggleLearnCallback,
  toggleScheduleMergeCallback,
  toggleDigestCallback,
  setDigestTimeCallback,
  toggleDigestWeekdayCallback,
  updateCalendarCallback,
  menuCallback,
  accountCallback,
  deleteAccountCallback,
  confirmDeleteAccountCallback,
  coursesCallback,
  myDuCallback,
} from "../callback-data";
import { choiceLabel, onOff, settingLabel, shownHidden } from "../keyboards/labels";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

const CLASS_REMINDER_OFFSETS = ["PT5M", "PT10M", "PT15M", "PT30M", "PT1H"] as const;

const MAX_CLASS_REMINDER_MINUTES = 240;

const WORKWEEK = [1, 2, 3, 4, 5];

type Screen = { text: string; keyboard: InlineKeyboard };

type UserContext = Context & { from: { id: number } };

async function show(ctx: Context, mode: "edit" | "reply", { text, keyboard }: Screen) {
  const options = { parse_mode: "HTML" as const, reply_markup: keyboard };

  if (mode === "edit") {
    await ctx.editMessageText(text, options);
  } else {
    await ctx.reply(text, options);
  }
}

async function findUser(ctx: UserContext) {
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());
  }

  return user;
}

function resetPrompts(ctx: Context) {
  ctx.session.awaitingMoodleCalendarUrl = false;
  ctx.session.awaitingClassReminderMinutes = false;
  ctx.session.awaitingDigestTime = false;
  ctx.session.myDuSetup = undefined;
}

// ─── Settings root ───────────────────────────────────────────────────────────
// Every setting is one row showing its current value. Binary settings toggle in
// place; the rest open a screen with their options.

function deadlineRemindersValue(user: UserWithSchedule) {
  if (!user.moodleCalendarUrl || !user.deadlinesEnabled || user.thresholds.length === 0) {
    return m.ui_off();
  }

  return [...user.thresholds]
    .sort((a, b) => durationToMs(a) - durationToMs(b))
    .map((threshold) => formatDuration(threshold, "short"))
    .join(", ");
}

function classRemindersValue(user: UserWithSchedule) {
  if (!user.hasSchedule || !user.scheduleEnabled) {
    return m.ui_off();
  }

  return m.class_reminders_before({ duration: formatDuration(user.scheduleReminderOffset) });
}

function digestDaysLabel(weekdays: number[]) {
  if (weekdays.length === DIGEST_WEEKDAYS.length) {
    return m.digest_every_day();
  }

  if (weekdays.length === WORKWEEK.length && WORKWEEK.every((day) => weekdays.includes(day))) {
    return m.digest_weekdays();
  }

  return m.digest_day_count({ count: weekdays.length });
}

function digestValue(user: UserWithSchedule) {
  const weekdays = normalizeDigestWeekdays(user.digestWeekdays);

  if (!user.hasSchedule || !user.digestEnabled || weekdays.length === 0) {
    return m.ui_off();
  }

  return m.digest_value({ time: user.digestTime, days: digestDaysLabel(weekdays) });
}

function connectionValue(connected: boolean) {
  return connected ? m.ui_connected() : m.ui_not_connected();
}

function settingsScreen(user: UserWithSchedule): Screen {
  const filters = normalizeScheduleFilters(user.scheduleFilters);

  const keyboard = new InlineKeyboard()
    .text(
      settingLabel(m.settings_deadline_reminders(), deadlineRemindersValue(user)),
      deadlinesSettingsCallback.pack({}),
    )
    .row()
    .text(
      settingLabel(m.settings_class_reminders(), classRemindersValue(user)),
      classRemindersCallback.pack({}),
    )
    .row()
    .text(settingLabel(m.settings_digest(), digestValue(user)), digestSettingsCallback.pack({}))
    .row()
    .text(
      settingLabel(m.settings_merge_pairs(), onOff(!!filters.combineAdjacentPairs)),
      toggleScheduleMergeCallback.pack({}),
    )
    .row()
    .text(
      settingLabel(m.settings_learn_classes(), shownHidden(filters.eventTypes.learn)),
      toggleLearnCallback.pack({}),
    )
    .row()
    .text(m.settings_courses(), coursesCallback.pack({}))
    .row()
    .text(
      settingLabel(m.settings_moodle(), connectionValue(!!user.moodleCalendarUrl)),
      updateCalendarCallback.pack({ from: "settings" }),
    )
    .row()
    .text(
      settingLabel(m.settings_my_du(), connectionValue(user.hasSchedule)),
      myDuCallback.pack({}),
    )
    .row()
    .text(m.account_header(), accountCallback.pack({}))
    .row()
    .text(m.ui_back(), menuCallback.pack({}));

  return { text: bold(m.settings_header()), keyboard };
}

feature.command("settings", async (ctx) => {
  resetPrompts(ctx);
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.reply(m.not_registered());

    return;
  }

  await show(ctx, "reply", settingsScreen(user));
});

feature.callbackQuery(settingsCallback.filter(), async (ctx) => {
  resetPrompts(ctx);
  const user = await findUser(ctx);

  if (!user) return;

  await show(ctx, "edit", settingsScreen(user));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleScheduleMergeCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  const filters = normalizeScheduleFilters(user.scheduleFilters);
  filters.combineAdjacentPairs = !filters.combineAdjacentPairs;
  await usersRepository.update(user.id, { scheduleFilters: filters });

  await show(ctx, "edit", settingsScreen({ ...user, scheduleFilters: filters }));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleLearnCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  const filters = normalizeScheduleFilters(user.scheduleFilters);
  filters.eventTypes = { ...filters.eventTypes, learn: !filters.eventTypes.learn };
  await usersRepository.update(user.id, { scheduleFilters: filters });

  await show(ctx, "edit", settingsScreen({ ...user, scheduleFilters: filters }));
  await ctx.answerCallbackQuery();
});

// ─── Deadline reminders ──────────────────────────────────────────────────────

function deadlineRemindersScreen(user: UserWithSchedule): Screen {
  const keyboard = new InlineKeyboard().text(
    settingLabel(m.deadline_reminders_toggle(), onOff(user.deadlinesEnabled)),
    toggleDeadlinesCallback.pack({}),
  );

  for (let i = 0; i < AVAILABLE_THRESHOLDS.length; i += 2) {
    const row = keyboard.row();

    for (const threshold of AVAILABLE_THRESHOLDS.slice(i, i + 2)) {
      row.text(
        choiceLabel(user.thresholds.includes(threshold), formatDuration(threshold)),
        toggleThresholdCallback.pack({ threshold }),
      );
    }
  }

  keyboard.row().text(m.ui_back(), settingsCallback.pack({}));

  const text = [
    bold(m.settings_deadline_reminders()),
    "",
    m.deadline_reminders_body({ max: config.reminders.maxThresholds }),
  ].join("\n");

  return { text, keyboard };
}

feature.callbackQuery(deadlinesSettingsCallback.filter(), async (ctx) => {
  resetPrompts(ctx);
  const user = await findUser(ctx);

  if (!user) return;

  await show(ctx, "edit", deadlineRemindersScreen(user));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleDeadlinesCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  const deadlinesEnabled = !user.deadlinesEnabled;
  await usersRepository.update(user.id, { deadlinesEnabled });

  await show(ctx, "edit", deadlineRemindersScreen({ ...user, deadlinesEnabled }));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleThresholdCallback.filter(), async (ctx) => {
  const { threshold } = toggleThresholdCallback.unpack(ctx.callbackQuery.data);
  const user = await findUser(ctx);

  if (!user) return;

  const isActive = user.thresholds.includes(threshold);

  if (!isActive && user.thresholds.length >= config.reminders.maxThresholds) {
    await ctx.answerCallbackQuery({
      text: m.max_thresholds({ max: config.reminders.maxThresholds }),
      show_alert: true,
    });

    return;
  }

  const thresholds = isActive
    ? user.thresholds.filter((t) => t !== threshold)
    : [...user.thresholds, threshold].sort((a, b) => durationToMs(a) - durationToMs(b));

  await usersRepository.update(user.id, { thresholds });

  await show(ctx, "edit", deadlineRemindersScreen({ ...user, thresholds }));
  await ctx.answerCallbackQuery();
});

// ─── Class reminders ─────────────────────────────────────────────────────────

function classRemindersScreen(user: UserWithSchedule): Screen {
  const enabled = user.hasSchedule && user.scheduleEnabled;
  const currentMs = durationToMs(user.scheduleReminderOffset);
  const isCustom = enabled && !CLASS_REMINDER_OFFSETS.some((o) => durationToMs(o) === currentMs);

  const keyboard = new InlineKeyboard().text(
    choiceLabel(!enabled, m.class_reminders_off()),
    setClassReminderCallback.pack({ offset: "off" }),
  );

  for (const offset of CLASS_REMINDER_OFFSETS) {
    keyboard
      .row()
      .text(
        choiceLabel(
          enabled && durationToMs(offset) === currentMs,
          m.class_reminders_before({ duration: formatDuration(offset) }),
        ),
        setClassReminderCallback.pack({ offset }),
      );
  }

  // A custom offset is shown with its value, so the selected marker always lands on a row.
  keyboard
    .row()
    .text(
      isCustom
        ? choiceLabel(
            true,
            m.class_reminders_custom_value({
              duration: formatDuration(user.scheduleReminderOffset),
            }),
          )
        : m.class_reminders_custom(),
      customClassReminderCallback.pack({}),
    )
    .row()
    .text(m.ui_back(), settingsCallback.pack({}));

  const text = [bold(m.settings_class_reminders()), "", m.class_reminders_body()].join("\n");

  return { text, keyboard };
}

feature.callbackQuery(classRemindersCallback.filter(), async (ctx) => {
  resetPrompts(ctx);
  const user = await findUser(ctx);

  if (!user) return;

  await show(ctx, "edit", classRemindersScreen(user));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(setClassReminderCallback.filter(), async (ctx) => {
  const { offset } = setClassReminderCallback.unpack(ctx.callbackQuery.data);
  const user = await findUser(ctx);

  if (!user) return;

  if (offset === "off") {
    await usersRepository.update(user.id, { scheduleEnabled: false });
    await show(ctx, "edit", classRemindersScreen({ ...user, scheduleEnabled: false }));
    await ctx.answerCallbackQuery();

    return;
  }

  if (!CLASS_REMINDER_OFFSETS.some((option) => option === offset)) {
    await ctx.answerCallbackQuery();

    return;
  }

  if (!user.hasSchedule) {
    await ctx.answerCallbackQuery({ text: m.no_group_for_schedule(), show_alert: true });

    return;
  }

  const patch = { scheduleEnabled: true, scheduleReminderOffset: offset };
  await usersRepository.update(user.id, patch);

  await show(ctx, "edit", classRemindersScreen({ ...user, ...patch }));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(customClassReminderCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  if (!user.hasSchedule) {
    await ctx.answerCallbackQuery({ text: m.no_group_for_schedule(), show_alert: true });

    return;
  }

  resetPrompts(ctx);
  ctx.session.awaitingClassReminderMinutes = true;

  const text = [bold(m.class_reminders_custom_header()), "", m.class_reminders_custom_body()].join(
    "\n",
  );

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(m.ui_cancel(), classRemindersCallback.pack({})),
  });
  await ctx.answerCallbackQuery();
});

feature.on("message:text", async (ctx, next) => {
  if (!ctx.session.awaitingClassReminderMinutes) {
    return next();
  }

  const raw = ctx.message.text.trim();
  const minutes = Number(raw);

  if (!/^\d+$/.test(raw) || minutes < 1 || minutes > MAX_CLASS_REMINDER_MINUTES) {
    await ctx.reply(m.class_reminders_custom_invalid());

    return;
  }

  ctx.session.awaitingClassReminderMinutes = false;
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    return;
  }

  const patch = { scheduleEnabled: true, scheduleReminderOffset: `PT${minutes}M` };
  await usersRepository.update(user.id, patch);

  const screen = classRemindersScreen({ ...user, ...patch });

  const saved = m.class_reminders_saved({
    duration: bold(formatDuration(patch.scheduleReminderOffset)),
  });

  await show(ctx, "reply", { ...screen, text: `${saved}\n\n${screen.text}` });
});

// ─── Daily digest ────────────────────────────────────────────────────────────

function digestScreen(user: UserWithSchedule): Screen {
  const weekdays = new Set(normalizeDigestWeekdays(user.digestWeekdays));

  const keyboard = new InlineKeyboard()
    .text(settingLabel(m.digest_toggle(), onOff(user.digestEnabled)), toggleDigestCallback.pack({}))
    .row()
    .text(settingLabel(m.digest_time_label(), user.digestTime), setDigestTimeCallback.pack({}));

  for (let i = 0; i < DIGEST_WEEKDAYS.length; i += 2) {
    const row = keyboard.row();

    for (const day of DIGEST_WEEKDAYS.slice(i, i + 2)) {
      row.text(
        choiceLabel(weekdays.has(day.value), day.shortLabel),
        toggleDigestWeekdayCallback.pack({ day: String(day.value) }),
      );
    }
  }

  keyboard.row().text(m.ui_back(), settingsCallback.pack({}));

  const text = [bold(m.settings_digest()), "", m.digest_body()].join("\n");

  return { text, keyboard };
}

feature.callbackQuery(digestSettingsCallback.filter(), async (ctx) => {
  resetPrompts(ctx);
  const user = await findUser(ctx);

  if (!user) return;

  await show(ctx, "edit", digestScreen(user));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleDigestCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  if (!user.hasSchedule && !user.digestEnabled) {
    await ctx.answerCallbackQuery({ text: m.no_group_for_schedule(), show_alert: true });

    return;
  }

  const digestEnabled = !user.digestEnabled;
  await usersRepository.update(user.id, { digestEnabled });

  await show(ctx, "edit", digestScreen({ ...user, digestEnabled }));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleDigestWeekdayCallback.filter(), async (ctx) => {
  const day = Number(toggleDigestWeekdayCallback.unpack(ctx.callbackQuery.data).day);
  const user = await findUser(ctx);

  if (!user) return;

  const weekdays = normalizeDigestWeekdays(user.digestWeekdays);

  const digestWeekdays = normalizeDigestWeekdays(
    weekdays.includes(day) ? weekdays.filter((weekday) => weekday !== day) : [...weekdays, day],
  );

  await usersRepository.update(user.id, { digestWeekdays });

  await show(ctx, "edit", digestScreen({ ...user, digestWeekdays }));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(setDigestTimeCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  resetPrompts(ctx);
  ctx.session.awaitingDigestTime = true;

  const text = [
    bold(m.digest_time_header()),
    "",
    m.digest_time_body({ time: bold(user.digestTime) }),
  ].join("\n");

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(m.ui_cancel(), digestSettingsCallback.pack({})),
  });
  await ctx.answerCallbackQuery();
});

feature.on("message:text", async (ctx, next) => {
  if (!ctx.session.awaitingDigestTime) {
    return next();
  }

  const digestTime = ctx.message.text.trim();

  if (!isValidDigestTime(digestTime)) {
    await ctx.reply(m.digest_time_invalid());

    return;
  }

  ctx.session.awaitingDigestTime = false;
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    return;
  }

  await usersRepository.update(user.id, { digestTime });

  const screen = digestScreen({ ...user, digestTime });
  const text = `${m.digest_time_saved({ time: bold(digestTime) })}\n\n${screen.text}`;
  await show(ctx, "reply", { ...screen, text });
});

// ─── Account ─────────────────────────────────────────────────────────────────

function accountScreen(user: UserWithSchedule): Screen {
  const text = [
    bold(m.account_header()),
    "",
    m.account_user_id({ id: code(user.id) }),
    m.account_telegram_id({ telegramId: code(user.telegramId) }),
  ].join("\n");

  const keyboard = new InlineKeyboard()
    .text(m.account_button_delete(), deleteAccountCallback.pack({}))
    .row()
    .text(m.ui_back(), settingsCallback.pack({}));

  return { text, keyboard };
}

feature.callbackQuery(accountCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  await show(ctx, "edit", accountScreen(user));
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(deleteAccountCallback.filter(), async (ctx) => {
  const user = await findUser(ctx);

  if (!user) return;

  await ctx.editMessageText(
    [bold(m.delete_account_header()), "", m.delete_account_body()].join("\n"),
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text(
          m.account_button_confirm_delete(),
          confirmDeleteAccountCallback.pack({ confirmed: "yes" }),
        )
        .text(m.ui_cancel(), accountCallback.pack({})),
    },
  );
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(confirmDeleteAccountCallback.filter(), async (ctx) => {
  const { confirmed } = confirmDeleteAccountCallback.unpack(ctx.callbackQuery.data);
  const user = await findUser(ctx);

  if (!user) return;

  if (confirmed !== "yes") {
    await show(ctx, "edit", accountScreen(user));
    await ctx.answerCallbackQuery();

    return;
  }

  await usersRepository.remove(user.id);
  resetPrompts(ctx);

  await ctx.editMessageText(m.account_deleted());
  await ctx.answerCallbackQuery({ text: m.account_deleted() });
});

export { composer as settingsFeature };
