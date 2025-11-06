-- ============================================================================
-- ORCHESTRA INTELLIGENCE - SUPABASE SETUP
-- ============================================================================
-- Script d'initialisation pour la base de données Supabase
-- Agent World - Alba Orchestrator
--
-- IMPORTANT: Exécuter ce script dans le Supabase SQL Editor
-- Ordre d'exécution: Extensions → Tables → Seed Data (optionnel)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------

-- Extension pour UUID (généralement déjà activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour pgvector (optionnel - pour recherche sémantique avancée)
-- Décommenter si vous voulez utiliser la recherche sémantique avec embeddings
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- 2. TABLES CRM
-- ----------------------------------------------------------------------------

-- Organization: Représente l'entreprise (Orchestra Intelligence)
CREATE TABLE IF NOT EXISTS "Organization" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client: Clients d'Orchestra Intelligence (ex: Wella)
CREATE TABLE IF NOT EXISTS "Client" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  "igHandle" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project: Projets pour chaque client
CREATE TABLE IF NOT EXISTS "Project" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "clientId" UUID NOT NULL REFERENCES "Client"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TABLES LEAD MANAGEMENT
-- ----------------------------------------------------------------------------

-- Lead: Leads générés par les agents
CREATE TABLE IF NOT EXISTS "Lead" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "clientId" UUID REFERENCES "Client"(id) ON DELETE SET NULL,
  source VARCHAR(100) NOT NULL,
  name VARCHAR(255),
  "igHandle" VARCHAR(255),
  url TEXT,
  location VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  score JSONB, -- { overall: number, engagement: number, fit: number }
  "dedupeHash" VARCHAR(64),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS "lead_dedupe_hash_idx" ON "Lead"("dedupeHash");
CREATE INDEX IF NOT EXISTS "lead_client_id_idx" ON "Lead"("clientId");
CREATE INDEX IF NOT EXISTS "lead_status_idx" ON "Lead"(status);

-- LeadEvent: Événements liés aux leads
CREATE TABLE IF NOT EXISTS "LeadEvent" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "leadId" UUID NOT NULL REFERENCES "Lead"(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  "payloadJson" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interaction: Interactions avec les leads (DM, comments, emails)
CREATE TABLE IF NOT EXISTS "Interaction" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "leadId" UUID REFERENCES "Lead"(id) ON DELETE SET NULL,
  channel VARCHAR(50) NOT NULL, -- 'instagram', 'email', 'linkedin', etc.
  direction VARCHAR(50) DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TABLES AGENT EXECUTION
-- ----------------------------------------------------------------------------

-- AgentRun: Exécutions d'agents
CREATE TABLE IF NOT EXISTS "AgentRun" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent VARCHAR(100) NOT NULL, -- 'LeadResearch', 'CRMSync', 'BrowserOutreach', etc.
  "inputJson" JSONB,
  "outputJson" JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error TEXT,
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "finishedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS "agent_run_status_idx" ON "AgentRun"(status);
CREATE INDEX IF NOT EXISTS "agent_run_agent_idx" ON "AgentRun"(agent);

-- Task: Tâches individuelles au sein d'une exécution d'agent
CREATE TABLE IF NOT EXISTS "Task" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "runId" UUID NOT NULL REFERENCES "AgentRun"(id) ON DELETE CASCADE,
  kind VARCHAR(100) NOT NULL, -- 'exa_search', 'apify_instagram', etc.
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  "inputJson" JSONB,
  "outputJson" JSONB,
  error TEXT,
  "finishedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS "task_run_id_idx" ON "Task"("runId");
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "Task"(status);

-- ----------------------------------------------------------------------------
-- 5. TABLES MEMORY SYSTEM
-- ----------------------------------------------------------------------------

-- Memory: Système de mémoire pour contexte long-terme
CREATE TABLE IF NOT EXISTS "Memory" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding JSONB, -- Pour pgvector: VECTOR(1536) si extension activée
  "entityType" VARCHAR(50), -- 'client', 'project', 'lead', 'conversation', etc.
  "entityId" UUID,
  metadata JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si pgvector est activé, créer un index vectoriel pour recherche sémantique:
-- CREATE INDEX IF NOT EXISTS memory_embedding_idx ON "Memory" USING ivfflat (embedding vector_cosine_ops);

-- MemoryLink: Liens entre mémoires et entités
CREATE TABLE IF NOT EXISTS "MemoryLink" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" UUID NOT NULL,
  "memoryId" UUID NOT NULL REFERENCES "Memory"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS "memory_link_entity_idx" ON "MemoryLink"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "memory_link_memory_idx" ON "MemoryLink"("memoryId");

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
-- À adapter selon vos besoins de sécurité
-- Exemple: isolation par client pour applications multi-tenants

-- Activer RLS sur les tables sensibles
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Memory" ENABLE ROW LEVEL SECURITY;

-- Exemple de politique RLS (à personnaliser selon vos besoins)
-- Permettre à tous les utilisateurs authentifiés de lire/écrire
-- (Ajuster selon votre modèle de sécurité)

-- CREATE POLICY "Allow authenticated users to read leads"
--   ON "Lead" FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Allow authenticated users to insert leads"
--   ON "Lead" FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. SEED DATA (OPTIONNEL)
-- ----------------------------------------------------------------------------

-- Créer Orchestra Intelligence comme organisation par défaut
INSERT INTO "Organization" (name)
VALUES ('Orchestra Intelligence')
ON CONFLICT DO NOTHING;

-- Créer un client Wella pour test
INSERT INTO "Client" (name, "organizationId", "igHandle")
SELECT 'Wella', id, 'wella'
FROM "Organization"
WHERE name = 'Orchestra Intelligence'
ON CONFLICT DO NOTHING;

-- Exemple: Créer une mémoire initiale pour Alba
INSERT INTO "Memory" (content, "entityType", metadata)
VALUES (
  'Orchestra Intelligence est une agence spécialisée dans le développement de SaaS sur-mesure et d''agents IA pour PME. Nous utilisons AI SDK, Next.js, Supabase et Vercel.',
  'organization',
  '{"category": "company_info", "importance": "high"}'
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. FUNCTIONS & TRIGGERS (OPTIONNEL)
-- ----------------------------------------------------------------------------

-- Fonction pour mettre à jour automatiquement les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Si vous ajoutez des colonnes updatedAt, appliquer ce trigger:
-- CREATE TRIGGER update_client_updated_at
--   BEFORE UPDATE ON "Client"
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 9. VERIFICATION
-- ----------------------------------------------------------------------------

-- Vérifier que toutes les tables sont créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vérifier les extensions activées
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');

-- Compter les enregistrements seed
SELECT
  (SELECT COUNT(*) FROM "Organization") as organizations,
  (SELECT COUNT(*) FROM "Client") as clients,
  (SELECT COUNT(*) FROM "Memory") as memories;

-- ----------------------------------------------------------------------------
-- SETUP COMPLET ✅
-- ----------------------------------------------------------------------------
-- Votre base de données Supabase est maintenant prête pour Agent World !
--
-- Prochaines étapes:
-- 1. Copier SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
-- 2. Lancer l'application: pnpm dev
-- 3. Tester avec Alba: http://localhost:3000/alba
--
-- Documentation complète: voir AGENT_WORLD.md
-- ============================================================================
