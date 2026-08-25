PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`prefix` text NOT NULL,
	`key_type` text DEFAULT 'test' NOT NULL,
	`scopes` text DEFAULT '["send"]' NOT NULL,
	`created_at` integer NOT NULL,
	`revoked_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_api_keys`("id", "name", "key_hash", "prefix", "key_type", "scopes", "created_at", "revoked_at") SELECT "id", "name", "key_hash", "prefix", "key_type", "scopes", "created_at", "revoked_at" FROM `api_keys`;--> statement-breakpoint
DROP TABLE `api_keys`;--> statement-breakpoint
ALTER TABLE `__new_api_keys` RENAME TO `api_keys`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
ALTER TABLE `email_logs` ADD `cloudflare_message_id` text;