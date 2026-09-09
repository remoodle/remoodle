ALTER TABLE `moodle_connections` DROP COLUMN `events`;--> statement-breakpoint
ALTER TABLE `moodle_connections` DROP COLUMN `last_synced_at`;--> statement-breakpoint
ALTER TABLE `moodle_connections` DROP COLUMN `last_attempt_at`;--> statement-breakpoint
ALTER TABLE `moodle_connections` DROP COLUMN `sync_error`;--> statement-breakpoint
ALTER TABLE `moodle_connections` DROP COLUMN `lock_until`;