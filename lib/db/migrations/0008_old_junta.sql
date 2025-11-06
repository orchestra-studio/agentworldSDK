CREATE TABLE IF NOT EXISTS "AgentRun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent" varchar(100) NOT NULL,
	"inputJson" jsonb,
	"outputJson" jsonb,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"startedAt" timestamp,
	"finishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"igHandle" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Interaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leadId" uuid,
	"channel" varchar(50) NOT NULL,
	"direction" varchar DEFAULT 'outbound' NOT NULL,
	"content" text NOT NULL,
	"metadataJson" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Lead" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid,
	"source" varchar(100) NOT NULL,
	"name" varchar(255),
	"igHandle" varchar(255),
	"url" text,
	"location" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"status" varchar DEFAULT 'new' NOT NULL,
	"score" jsonb,
	"dedupeHash" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LeadEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leadId" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"payloadJson" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"embedding" jsonb,
	"entityType" varchar(50),
	"entityId" uuid,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MemoryLink" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityId" uuid NOT NULL,
	"memoryId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"runId" uuid NOT NULL,
	"kind" varchar(100) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"inputJson" jsonb,
	"outputJson" jsonb,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_leadId_Lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_Lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MemoryLink" ADD CONSTRAINT "MemoryLink_memoryId_Memory_id_fk" FOREIGN KEY ("memoryId") REFERENCES "public"."Memory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Task" ADD CONSTRAINT "Task_runId_AgentRun_id_fk" FOREIGN KEY ("runId") REFERENCES "public"."AgentRun"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_run_status_idx" ON "AgentRun" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_run_agent_idx" ON "AgentRun" USING btree ("agent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_dedupe_hash_idx" ON "Lead" USING btree ("dedupeHash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_client_id_idx" ON "Lead" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_status_idx" ON "Lead" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_run_id_idx" ON "Task" USING btree ("runId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "Task" USING btree ("status");