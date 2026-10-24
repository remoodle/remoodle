import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import type { ScheduleFilter, ScheduleItem } from "../shared/schedule";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramId: integer("telegram_id").notNull().unique(),
  // Telegram profile shown in the web calendar; refreshed on every web sign-in.
  name: text("name"),
  username: text("username"),
  thresholds: text("thresholds", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(["P1D", "PT3H"]),
  moodleCalendarUrl: text("moodle_calendar_url"),
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
      courses?: Record<
        string,
        { lecture: boolean; practice: boolean; online: boolean; offline: boolean }
      >;
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
      .references(() => users.id, { onDelete: "cascade" }),
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
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull(),
    triggeredAt: integer("triggered_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [unique().on(table.userId, table.eventId, table.triggeredAt)],
);

// Web calendar sessions. Only a SHA-256 hash of the cookie value is stored.
export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

// Telegram deep-link sign-in: the browser polls with its secret while the bot approves the code.
export const loginRequests = sqliteTable("login_requests", {
  code: text("code").primaryKey(),
  pollSecretHash: text("poll_secret_hash").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const icalTokens = sqliteTable("ical_tokens", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  filters: text("filters", { mode: "json" }).$type<ScheduleFilter>().notNull(),
});

export const myDuLoginRequests = sqliteTable("my_du_login_requests", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  state: text("state").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const myDuConnections = sqliteTable("my_du_connections", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // AES-GCM encrypted My DU tokens; null after disconnect or when My DU rejects the refresh.
  credentials: text("credentials"),
  studyYear: integer("study_year").notNull(),
  term: integer("term").notNull(),
  firstWeekStart: text("first_week_start").notNull(),
  events: text("events", { mode: "json" }).$type<ScheduleItem[]>().notNull().default([]),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" }),
  lastAttemptAt: integer("last_attempt_at", { mode: "timestamp_ms" }),
  syncError: text("sync_error"),
  // Sync lease: My DU rotates refresh tokens, so two concurrent syncs would revoke each other.
  lockedUntil: integer("locked_until").notNull().default(0),
});
