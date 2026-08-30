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
CREATE TABLE `automation_runs` (
	`automation_id` text NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`current_node_id` text,
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
CREATE UNIQUE INDEX `automation_event_idempotency_unique` ON `automation_event_idempotency` (`project_id`,`idempotency_key`);
