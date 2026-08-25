CREATE TABLE `idempotency_keys` (
	`api_key_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`status_code` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idempotency_keys_api_key_id_idempotency_key_unique` ON `idempotency_keys` (`api_key_id`,`idempotency_key`);
