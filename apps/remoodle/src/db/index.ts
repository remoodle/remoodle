import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config";

const client = createClient({ url: `file:${config.database.url}` });

export const db = drizzle({ client });
