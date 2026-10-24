CREATE TABLE `ical_tokens` (
	`user_id` integer PRIMARY KEY,
	`token` text NOT NULL UNIQUE,
	`filters` text NOT NULL,
	CONSTRAINT `fk_ical_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `login_requests` (
	`code` text PRIMARY KEY,
	`poll_secret_hash` text NOT NULL,
	`user_id` integer,
	`expires_at` integer NOT NULL,
	CONSTRAINT `fk_login_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `my_du_connections` (
	`user_id` integer PRIMARY KEY,
	`credentials` text,
	`study_year` integer NOT NULL,
	`term` integer NOT NULL,
	`first_week_start` text NOT NULL,
	`events` text DEFAULT '[]' NOT NULL,
	`last_synced_at` integer,
	`last_attempt_at` integer,
	`sync_error` text,
	`locked_until` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_my_du_connections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `my_du_login_requests` (
	`user_id` integer PRIMARY KEY,
	`state` text NOT NULL,
	`expires_at` integer NOT NULL,
	CONSTRAINT `fk_my_du_login_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	CONSTRAINT `fk_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `users` ADD `name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sent_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`event_id` text NOT NULL,
	`triggered_at` integer NOT NULL,
	CONSTRAINT `fk_sent_notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `sent_reminders_user_id_event_id_triggered_at_unique` UNIQUE(`user_id`,`event_id`,`triggered_at`)
);
--> statement-breakpoint
INSERT INTO `__new_sent_notifications`(`id`, `user_id`, `event_id`, `triggered_at`) SELECT `id`, `user_id`, `event_id`, `triggered_at` FROM `sent_notifications`;--> statement-breakpoint
DROP TABLE `sent_notifications`;--> statement-breakpoint
ALTER TABLE `__new_sent_notifications` RENAME TO `sent_notifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_calendar_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`event_id` text NOT NULL,
	`summary` text NOT NULL,
	`timestamp_ms` integer NOT NULL,
	`categories` text,
	`description` text,
	`fetched_at` integer NOT NULL,
	CONSTRAINT `fk_calendar_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `calendar_events_user_id_event_id_unique` UNIQUE(`user_id`,`event_id`)
);
--> statement-breakpoint
INSERT INTO `__new_calendar_events`(`id`, `user_id`, `event_id`, `summary`, `timestamp_ms`, `categories`, `description`, `fetched_at`) SELECT `id`, `user_id`, `event_id`, `summary`, `timestamp_ms`, `categories`, `description`, `fetched_at` FROM `calendar_events`;--> statement-breakpoint
DROP TABLE `calendar_events`;--> statement-breakpoint
ALTER TABLE `__new_calendar_events` RENAME TO `calendar_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `calendar_user_id`;