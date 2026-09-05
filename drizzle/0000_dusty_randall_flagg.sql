CREATE TABLE `assets` (
	`id` text NOT NULL,
	`organization_id` text NOT NULL,
	`tag` text NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`organization_id`, `id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_org_tag` ON `assets` (`organization_id`,`tag`);--> statement-breakpoint
CREATE TABLE `work_order_events` (
	`organization_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`work_order_id` text NOT NULL,
	`version` integer NOT NULL,
	`command` text NOT NULL,
	`result` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`organization_id`, `operation_id`),
	FOREIGN KEY (`organization_id`,`work_order_id`) REFERENCES `work_orders`(`organization_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_org_order_version` ON `work_order_events` (`organization_id`,`work_order_id`,`version`);--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` text NOT NULL,
	`organization_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`asset_tag` text NOT NULL,
	`service_location` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`assignee` text,
	`completion_note` text,
	`version` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_operation_id` text NOT NULL,
	PRIMARY KEY(`organization_id`, `id`),
	FOREIGN KEY (`organization_id`,`asset_id`) REFERENCES `assets`(`organization_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "work_order_status" CHECK("work_orders"."status" IN ('requested','assigned','in_progress','completed','closed')),
	CONSTRAINT "work_order_version" CHECK("work_orders"."version" > 0),
	CONSTRAINT "work_order_priority" CHECK("work_orders"."priority" IN ('low','normal','high','urgent')),
	CONSTRAINT "work_order_type" CHECK("work_orders"."type" IN ('corrective','preventive','inspection'))
);
