ALTER TABLE `settings` ADD `current_project_id` text REFERENCES `projects`(`id`);--> statement-breakpoint
UPDATE `settings` SET `current_project_id` = '00000000-0000-4000-8000-000000000001' WHERE `current_project_id` IS NULL;
