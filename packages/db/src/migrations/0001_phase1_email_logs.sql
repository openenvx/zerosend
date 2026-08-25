CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`to_address` text NOT NULL,
	`from_address` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`api_key_id` text,
	`api_key_prefix` text,
	`is_test` integer DEFAULT 0 NOT NULL,
	`html_body` text,
	`text_body` text,
	`error` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_logs_created_at_idx` ON `email_logs` (`created_at`);
--> statement-breakpoint
ALTER TABLE `api_keys` ADD `key_type` text DEFAULT 'live' NOT NULL CHECK (`key_type` IN ('test', 'live'));