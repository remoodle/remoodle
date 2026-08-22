CREATE TABLE `sent_reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`event_id` text NOT NULL,
	`triggered_at` integer NOT NULL,
	CONSTRAINT `fk_sent_reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `sent_reminders_user_id_event_id_triggered_at_unique` UNIQUE(`user_id`,`event_id`,`triggered_at`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`telegram_id` integer NOT NULL UNIQUE,
	`calendar_url` text NOT NULL,
	`thresholds` text DEFAULT '["P1D","PT3H"]' NOT NULL,
	`created_at` integer NOT NULL
);
