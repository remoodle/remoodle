import { migrate } from "drizzle-orm/libsql/migrator";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { db } from "./index";

const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), "migrations");

console.log("Running migrations...");

const run = async () => {
  await migrate(db, { migrationsFolder });
  console.log("Migrations complete!");
  process.exit(0);
};

run().catch((err) => {
  console.error("Error running migrations:", err);
  process.exit(1);
});
