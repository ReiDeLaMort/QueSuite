CREATE TABLE `asset_locations` (
	`organization_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`location_id` text NOT NULL,
	PRIMARY KEY(`organization_id`, `asset_id`),
	FOREIGN KEY (`organization_id`,`asset_id`) REFERENCES `assets`(`organization_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`,`location_id`) REFERENCES `locations`(`organization_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL,
	`kind` text NOT NULL,
	`parent_id` text,
	`path` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`organization_id`, `id`),
	FOREIGN KEY (`organization_id`,`parent_id`) REFERENCES `locations`(`organization_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "location_kind" CHECK("locations"."kind" IN ('site','building','area')),
	CONSTRAINT "location_parent" CHECK(("locations"."kind" = 'site' AND "locations"."parent_id" IS NULL) OR ("locations"."kind" IN ('building','area') AND "locations"."parent_id" IS NOT NULL)),
	CONSTRAINT "location_not_self" CHECK("locations"."parent_id" IS NULL OR "locations"."parent_id" <> "locations"."id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `locations_root_name` ON `locations` (`organization_id`,`name_key`) WHERE "locations"."parent_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `locations_child_name` ON `locations` (`organization_id`,`parent_id`,`name_key`) WHERE "locations"."parent_id" IS NOT NULL;