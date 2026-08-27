CREATE TABLE `templates` (
	`created_at` integer NOT NULL,
	`html_snapshot` text,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`project_id` text NOT NULL,
	`published_at` integer,
	`scene_json` text NOT NULL,
	`text_snapshot` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_project_name_unique` ON `templates` (`project_id`,`name`);--> statement-breakpoint
ALTER TABLE `email_logs` ADD `template_id` text;
