ALTER TABLE `users` ADD `group` text;--> statement-breakpoint
ALTER TABLE `users` ADD `calendar_account_linked` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `deadlines_enabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `schedule_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `excluded_courses` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `schedule_filters` text DEFAULT '{"eventTypes":{"lecture":true,"practice":true,"learn":true},"eventFormats":{"online":true,"offline":true}}' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`telegram_id` integer NOT NULL UNIQUE,
	`calendar_url` text DEFAULT '' NOT NULL,
	`thresholds` text DEFAULT '["P1D","PT3H"]' NOT NULL,
	`group` text,
	`calendar_account_linked` integer DEFAULT false NOT NULL,
	`deadlines_enabled` integer DEFAULT true NOT NULL,
	`schedule_enabled` integer DEFAULT false NOT NULL,
	`excluded_courses` text DEFAULT '[]' NOT NULL,
	`schedule_filters` text DEFAULT '{"eventTypes":{"lecture":true,"practice":true,"learn":true},"eventFormats":{"online":true,"offline":true}}' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `telegram_id`, `calendar_url`, `thresholds`, `created_at`) SELECT `id`, `telegram_id`, `calendar_url`, `thresholds`, `created_at` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;