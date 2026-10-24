import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config";

const client = createClient({ url: `file:${config.database.url}` });

// SQLite leaves foreign keys off per connection; account deletion relies on cascades.
await client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle({ client });

export type DB = typeof db;
