CREATE TABLE `personal_ical_tokens` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`token` text NOT NULL UNIQUE,
	`filters` text,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_personal_ical_tokens_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `my_du_connections` (
	`user_id` text PRIMARY KEY,
	`credentials` text,
	`study_year` integer NOT NULL,
	`term` integer NOT NULL,
	`first_week_start` text NOT NULL,
	`events` text DEFAULT '[]' NOT NULL,
	`last_synced_at` integer,
	`last_attempt_at` integer,
	`sync_error` text,
	`lock_until` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_my_du_connections_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `my_du_login_requests` (
	`user_id` text PRIMARY KEY,
	`state` text NOT NULL,
	`expires_at` integer NOT NULL,
	CONSTRAINT `fk_my_du_login_requests_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_remoodle_connect_tokens` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`token` text NOT NULL UNIQUE,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `remoodle_connect_tokens_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_remoodle_connect_tokens`(`id`, `user_id`, `token`, `expires_at`, `created_at`) SELECT `id`, `user_id`, `token`, `expires_at`, `created_at` FROM `remoodle_connect_tokens`;--> statement-breakpoint
DROP TABLE `remoodle_connect_tokens`;--> statement-breakpoint
ALTER TABLE `__new_remoodle_connect_tokens` RENAME TO `remoodle_connect_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_session`(`id`, `expires_at`, `token`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `user_id`) SELECT `id`, `expires_at`, `token`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `user_id` FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`(`id`, `name`, `email`, `email_verified`, `image`, `created_at`, `updated_at`) SELECT `id`, `name`, `email`, `email_verified`, `image`, `created_at`, `updated_at` FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `ical_tokens_token_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `ical_tokens_user_group_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `remoodle_connect_tokens_token_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `session_token_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `user_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `ical_tokens_user_unique` ON `personal_ical_tokens` (`user_id`);--> statement-breakpoint
DROP TABLE `ical_tokens`;