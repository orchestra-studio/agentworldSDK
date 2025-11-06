-- ============================================
-- Agent World - Supabase Setup Script
-- ============================================
-- Ce script crée toutes les tables nécessaires pour le CRM et la mémoire
-- Exécuter ce script dans Supabase Dashboard > SQL Editor
-- ============================================

-- Extension pgvector (optionnel, pour recherche sémantique avancée)
-- Décommentez la ligne suivante si vous souhaitez activer pgvector
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Tables CRM
-- ============================================

-- Table Organization
CREATE TABLE IF NOT EXISTS "Organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Table Client
CREATE TABLE IF NOT EXISTS "Client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"igHandle" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Table Lead
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

-- Table LeadEvent
CREATE TABLE IF NOT EXISTS "LeadEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leadId" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"payloadJson" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Table Interaction
CREATE TABLE IF NOT EXISTS "Interaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leadId" uuid,
	"channel" varchar(50) NOT NULL,
	"direction" varchar DEFAULT 'outbound' NOT NULL,
	"content" text NOT NULL,
	"metadataJson" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Table Project
CREATE TABLE IF NOT EXISTS "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- Tables Agent & Tasks
-- ============================================

-- Table AgentRun
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

-- Table Task
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

-- ============================================
-- Tables Mémoire
-- ============================================

-- Table Memory
CREATE TABLE IF NOT EXISTS "Memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"embedding" jsonb,
	"entityType" varchar(50),
	"entityId" uuid,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Table MemoryLink
CREATE TABLE IF NOT EXISTS "MemoryLink" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityId" uuid NOT NULL,
	"memoryId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- Contraintes de Clés Étrangères
-- ============================================

DO $$ BEGIN
	ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_Organization_id_fk" 
		FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_Client_id_fk" 
		FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_Lead_id_fk" 
		FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_leadId_Lead_id_fk" 
		FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_Client_id_fk" 
		FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "Task" ADD CONSTRAINT "Task_runId_AgentRun_id_fk" 
		FOREIGN KEY ("runId") REFERENCES "public"."AgentRun"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "MemoryLink" ADD CONSTRAINT "MemoryLink_memoryId_Memory_id_fk" 
		FOREIGN KEY ("memoryId") REFERENCES "public"."Memory"("id") 
		ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Index pour Performance
-- ============================================

CREATE INDEX IF NOT EXISTS "agent_run_status_idx" ON "AgentRun" USING btree ("status");
CREATE INDEX IF NOT EXISTS "agent_run_agent_idx" ON "AgentRun" USING btree ("agent");
CREATE INDEX IF NOT EXISTS "lead_dedupe_hash_idx" ON "Lead" USING btree ("dedupeHash");
CREATE INDEX IF NOT EXISTS "lead_client_id_idx" ON "Lead" USING btree ("clientId");
CREATE INDEX IF NOT EXISTS "lead_status_idx" ON "Lead" USING btree ("status");
CREATE INDEX IF NOT EXISTS "task_run_id_idx" ON "Task" USING btree ("runId");
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "Task" USING btree ("status");

-- ============================================
-- Seed Data - Données Initiales
-- ============================================

-- Insert Organization "Orchestra Intelligence", Client "Wella" et Memory
DO $$
DECLARE
	org_id_var uuid;
	wella_id_var uuid;
	memory_id_var uuid;
BEGIN
	-- Récupérer ou créer Organization "Orchestra Intelligence"
	SELECT "id" INTO org_id_var FROM "Organization" WHERE "name" = 'Orchestra Intelligence' LIMIT 1;
	
	IF org_id_var IS NULL THEN
		INSERT INTO "Organization" ("name")
		VALUES ('Orchestra Intelligence')
		RETURNING "id" INTO org_id_var;
		RAISE NOTICE 'Organization "Orchestra Intelligence" créée avec ID: %', org_id_var;
	ELSE
		RAISE NOTICE 'Organization "Orchestra Intelligence" existe déjà avec ID: %', org_id_var;
	END IF;
	
	-- Insert Client "Wella" lié à Orchestra Intelligence
	SELECT "id" INTO wella_id_var FROM "Client" WHERE "name" = 'Wella' LIMIT 1;
	
	IF wella_id_var IS NULL THEN
		INSERT INTO "Client" ("organizationId", "name")
		VALUES (org_id_var, 'Wella')
		RETURNING "id" INTO wella_id_var;
		RAISE NOTICE 'Client "Wella" créé avec ID: %', wella_id_var;
	ELSE
		RAISE NOTICE 'Client "Wella" existe déjà avec ID: %', wella_id_var;
	END IF;
	
	-- Vérifier si la mémoire existe déjà
	SELECT "id" INTO memory_id_var FROM "Memory" 
	WHERE "entityType" = 'Organization' 
		AND "entityId" = org_id_var
		AND "content" LIKE 'Orchestra Intelligence est un orchestrateur%'
	LIMIT 1;
	
	IF memory_id_var IS NULL THEN
		-- Insert Memory sur Orchestra Intelligence
		INSERT INTO "Memory" ("content", "entityType", "entityId", "metadata")
		VALUES (
			'Orchestra Intelligence est un orchestrateur d''agents IA spécialisé dans l''automatisation des opérations business. Il gère la recherche de leads, la synchronisation CRM, l''automatisation Instagram et l''accès à la mémoire via Supabase.',
			'Organization',
			org_id_var,
			'{"source": "seed", "type": "organization_intro"}'::jsonb
		)
		RETURNING "id" INTO memory_id_var;
		
		-- Créer le lien MemoryLink entre Organization et Memory
		INSERT INTO "MemoryLink" ("entityType", "entityId", "memoryId")
		VALUES ('Organization', org_id_var, memory_id_var)
		ON CONFLICT DO NOTHING;
		
		RAISE NOTICE 'Memory créée avec ID: %', memory_id_var;
	ELSE
		RAISE NOTICE 'Memory existe déjà avec ID: %', memory_id_var;
	END IF;
	
	RAISE NOTICE '✅ Seed data terminé: Organization ID=%, Client ID=%, Memory ID=%', org_id_var, wella_id_var, memory_id_var;
END $$;

-- ============================================
-- Vérification des données
-- ============================================

-- Afficher les données créées (pour vérification)
SELECT 'Organization' as table_name, "id", "name", "createdAt" FROM "Organization" WHERE "name" = 'Orchestra Intelligence'
UNION ALL
SELECT 'Client' as table_name, "id"::text, "name", "createdAt" FROM "Client" WHERE "name" = 'Wella'
UNION ALL
SELECT 'Memory' as table_name, "id"::text, LEFT("content", 50) as "name", "createdAt" FROM "Memory" WHERE "entityType" = 'Organization';

