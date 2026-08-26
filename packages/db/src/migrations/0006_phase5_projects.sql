CREATE TABLE `projects` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
INSERT INTO `projects` (`id`, `name`, `created_at`) VALUES ('00000000-0000-4000-8000-000000000001', 'Default', 0);--> statement-breakpoint
ALTER TABLE `api_keys` ADD `project_id` text REFERENCES `projects`(`id`);--> statement-breakpoint
ALTER TABLE `email_logs` ADD `project_id` text REFERENCES `projects`(`id`);--> statement-breakpoint
UPDATE `api_keys` SET `project_id` = '00000000-0000-4000-8000-000000000001' WHERE `project_id` IS NULL;--> statement-breakpoint
UPDATE `email_logs` SET `project_id` = (
	SELECT `api_keys`.`project_id` FROM `api_keys` WHERE `api_keys`.`id` = `email_logs`.`api_key_id`
) WHERE `project_id` IS NULL AND `api_key_id` IS NOT NULL;--> statement-breakpoint
UPDATE `email_logs` SET `project_id` = '00000000-0000-4000-8000-000000000001' WHERE `project_id` IS NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_api_keys` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`key_hash` text NOT NULL,
	`key_type` text DEFAULT 'test' NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`project_id` text NOT NULL,
	`revoked_at` integer,
	`scopes` text DEFAULT '["send"]' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_api_keys`("created_at", "id", "key_hash", "key_type", "name", "prefix", "project_id", "revoked_at", "scopes") SELECT "created_at", "id", "key_hash", "key_type", "name", "prefix", "project_id", "revoked_at", "scopes" FROM `api_keys`;--> statement-breakpoint
DROP TABLE `api_keys`;--> statement-breakpoint
ALTER TABLE `__new_api_keys` RENAME TO `api_keys`;--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE TABLE `__new_email_logs` (
	`api_key_id` text,
	`api_key_prefix` text,
	`cloudflare_message_id` text,
	`created_at` integer NOT NULL,
	`error` text,
	`from_address` text NOT NULL,
	`html_body` text,
	`id` text PRIMARY KEY NOT NULL,
	`is_test` integer DEFAULT 0 NOT NULL,
	`project_id` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`subject` text NOT NULL,
	`text_body` text,
	`to_address` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_email_logs`("api_key_id", "api_key_prefix", "cloudflare_message_id", "created_at", "error", "from_address", "html_body", "id", "is_test", "project_id", "status", "subject", "text_body", "to_address") SELECT "api_key_id", "api_key_prefix", "cloudflare_message_id", "created_at", "error", "from_address", "html_body", "id", "is_test", "project_id", "status", "subject", "text_body", "to_address" FROM `email_logs`;--> statement-breakpoint
DROP TABLE `email_logs`;--> statement-breakpoint
ALTER TABLE `__new_email_logs` RENAME TO `email_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
