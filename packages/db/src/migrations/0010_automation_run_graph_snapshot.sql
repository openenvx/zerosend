ALTER TABLE `automation_runs` ADD `graph_json` text;
--> statement-breakpoint
UPDATE `automation_runs`
SET `graph_json` = (
  SELECT `published_graph_json`
  FROM `automations`
  WHERE `automations`.`id` = `automation_runs`.`automation_id`
)
WHERE `graph_json` IS NULL;
