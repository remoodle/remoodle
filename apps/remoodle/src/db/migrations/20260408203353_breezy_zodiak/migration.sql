CREATE TABLE `calendar_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`event_id` text NOT NULL,
	`summary` text NOT NULL,
	`timestamp_ms` integer NOT NULL,
	`categories` text,
	`description` text,
	`fetched_at` integer NOT NULL,
	CONSTRAINT `fk_calendar_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	CONSTRAINT `calendar_events_user_id_event_id_unique` UNIQUE(`user_id`,`event_id`)
);
