CREATE TABLE `moodle_connections` (
	`user_id` text PRIMARY KEY,
	`encrypted_url` text NOT NULL,
	`events` text DEFAULT '[]' NOT NULL,
	`last_synced_at` integer,
	`last_attempt_at` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	`lock_until` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_moodle_connections_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
