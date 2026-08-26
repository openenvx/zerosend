CREATE TABLE `api_key_domains` (
	`api_key_id` text NOT NULL,
	`domain_id` text NOT NULL,
	PRIMARY KEY(`api_key_id`, `domain_id`),
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
ALTER TABLE `api_keys` ADD `domain_scope` text DEFAULT 'global' NOT NULL;