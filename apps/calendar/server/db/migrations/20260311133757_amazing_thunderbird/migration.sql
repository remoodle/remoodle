DROP TABLE `user_filters`;--> statement-breakpoint
ALTER TABLE `ical_tokens` ADD `filters` text;--> statement-breakpoint
CREATE UNIQUE INDEX `ical_tokens_user_group_unique` ON `ical_tokens` (`user_id`,`group`);