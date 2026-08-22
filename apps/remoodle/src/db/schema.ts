import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramId: integer("telegram_id").notNull().unique(),
  calendarUrl: text("calendar_url").notNull().default(""),
  thresholds: text("thresholds", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(["P1D", "PT3H"]),
  group: text("group"),
  calendarAccountLinked: integer("calendar_account_linked", { mode: "boolean" })
    .notNull()
    .default(false),
  deadlinesEnabled: integer("deadlines_enabled", { mode: "boolean" }).notNull().default(true),
  scheduleEnabled: integer("schedule_enabled", { mode: "boolean" }).notNull().default(false),
  excludedCourses: text("excluded_courses", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  scheduleFilters: text("schedule_filters", { mode: "json" })
    .$type<{
      eventTypes: { lecture: boolean; practice: boolean; learn: boolean };
      eventFormats: { online: boolean; offline: boolean };
      combineAdjacentPairs?: boolean;
    }>()
    .notNull()
    .default({
      eventTypes: { lecture: true, practice: true, learn: true },
      eventFormats: { online: true, offline: true },
      combineAdjacentPairs: true,
    }),
  scheduleReminderOffset: text("schedule_reminder_offset").notNull().default("PT30M"),
  digestEnabled: integer("digest_enabled", { mode: "boolean" }).notNull().default(false),
  digestTime: text("digest_time").notNull().default("08:00"),
  digestWeekdays: text("digest_weekdays", { mode: "json" })
    .$type<number[]>()
    .notNull()
    .default([1, 2, 3, 4, 5, 6, 0]),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const calendarEvents = sqliteTable(
  "calendar_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    eventId: text("event_id").notNull(),
    summary: text("summary").notNull(),
    timestampMs: integer("timestamp_ms").notNull(),
    categories: text("categories"),
    description: text("description"),
    fetchedAt: integer("fetched_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [unique().on(table.userId, table.eventId)],
);

export const sentNotifications = sqliteTable(
  "sent_notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    eventId: text("event_id").notNull(),
    triggeredAt: integer("triggered_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [unique().on(table.userId, table.eventId, table.triggeredAt)],
);
