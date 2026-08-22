ALTER TABLE `users` ADD `digest_enabled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `digest_time` text DEFAULT '08:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `digest_weekdays` text DEFAULT '[1,2,3,4,5,6,0]' NOT NULL;