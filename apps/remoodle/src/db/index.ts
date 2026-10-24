import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config";
import { createCalendarEventsRepository } from "./repositories/calendar-events";
import { createIcalTokensRepository } from "./repositories/ical-tokens";
import { createMyDuRepository } from "./repositories/my-du";
import { createSentNotificationsRepository } from "./repositories/sent-notifications";
import { createSessionsRepository } from "./repositories/sessions";
import { createUsersRepository } from "./repositories/users";

const client = createClient({ url: `file:${config.database.url}` });

// SQLite leaves foreign keys off per connection; account deletion relies on cascades.
await client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle({ client });

export type DB = typeof db;

// Repositories take the connection instead of importing a global one. `database` is the
// app's instance, so call sites use one import instead of reaching into repository modules.
export function createDatabase(db: DB) {
  return {
    users: createUsersRepository(db),
    sessions: createSessionsRepository(db),
    myDu: createMyDuRepository(db),
    icalTokens: createIcalTokensRepository(db),
    calendarEvents: createCalendarEventsRepository(db),
    sentNotifications: createSentNotificationsRepository(db),
  };
}

export const database = createDatabase(db);
