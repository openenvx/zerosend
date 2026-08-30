CREATE TABLE `api_keys` (
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
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE TABLE `settings` (
	`current_project_id` text,
	`default_from` text,
	`id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`current_project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `automation_event_idempotency` (
	`created_at` integer NOT NULL,
	`event_name` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`project_id` text NOT NULL,
	`recipient_email` text NOT NULL,
	`response_json` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `automation_event_idempotency_unique` ON `automation_event_idempotency` (`project_id`,`idempotency_key`);--> statement-breakpoint
CREATE TABLE `automation_runs` (
	`automation_id` text NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`current_node_id` text,
	`graph_json` text,
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`recipient_email` text NOT NULL,
	`status` text NOT NULL,
	`trigger_event` text NOT NULL,
	`trigger_payload_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`automation_id`) REFERENCES `automations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `automation_step_runs` (
	`branch` text,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`error` text,
	`id` text PRIMARY KEY NOT NULL,
	`input_json` text,
	`node_id` text NOT NULL,
	`node_type` text NOT NULL,
	`output_json` text,
	`resume_at_ms` integer,
	`run_id` text NOT NULL,
	`started_at` integer,
	`status` text NOT NULL,
	`wait_event` text,
	FOREIGN KEY (`run_id`) REFERENCES `automation_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `automations` (
	`created_at` integer NOT NULL,
	`graph_json` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`project_id` text NOT NULL,
	`published_at` integer,
	`published_graph_json` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `automations_project_name_unique` ON `automations` (`project_id`,`name`);--> statement-breakpoint
CREATE TABLE `domains` (
	`cf_subdomain_id` text,
	`cf_zone_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`dkim_selector` text,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`return_path_domain` text,
	`verified` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domains_name_unique` ON `domains` (`name`);--> statement-breakpoint
CREATE TABLE `email_logs` (
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
	`template_id` text,
	`text_body` text,
	`to_address` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `idempotency_keys` (
	`api_key_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`idempotency_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`status_code` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idempotency_keys_api_key_id_idempotency_key_unique` ON `idempotency_keys` (`api_key_id`,`idempotency_key`);--> statement-breakpoint
CREATE TABLE `projects` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
CREATE TABLE `templates` (
	`created_at` integer NOT NULL,
	`html_snapshot` text,
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`project_id` text NOT NULL,
	`published_at` integer,
	`scene_json` text NOT NULL,
	`text_snapshot` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_project_key_unique` ON `templates` (`project_id`,`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `templates_project_name_unique` ON `templates` (`project_id`,`name`);