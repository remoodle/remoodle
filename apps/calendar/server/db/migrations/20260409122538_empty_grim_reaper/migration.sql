CREATE TABLE `remoodle_connect_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `remoodle_connect_tokens_token_unique` ON `remoodle_connect_tokens` (`token`);--> statement-breakpoint
ALTER TABLE `user` ADD `primary_group` text;