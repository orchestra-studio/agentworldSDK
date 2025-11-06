# Agent World - Alba Orchestrator

**Orchestra Intelligence Agent Platform**

Système d'orchestration d'agents IA pour automatiser les opérations business, développé avec Vercel AI SDK, Next.js, Supabase, MCP Rube et mémoire native Supabase.

---

## 🎯 Vue d'ensemble

Agent World est la plateforme d'orchestration d'agents IA d'Orchestra Intelligence. Au cœur du système se trouve **Alba**, un orchestrateur intelligent qui coordonne des agents spécialisés et des workflows pour gérer :

- 🔍 **Lead Generation** : Recherche automatisée de leads via Exa Search et Apify Instagram
- 💼 **CRM Automation** : Gestion centralisée dans Supabase avec déduplication et scoring
- 🤖 **Social Automation** : Interactions Instagram automatisées via Stagehand
- 🧠 **Memory System** : Mémoire parfaite avec Supabase pour contexte long-terme
- 🔌 **MCP Integration** : Outils unifiés (Slack, Notion, Gmail, Drive, Sheets)
- 🎨 **Gen UI** : Visualisations intelligentes (Leads Board, Runs Timeline, Workflows)

---

## 🏗️ Architecture

### Composants principaux

#### **Alba - L'Orchestrateur**
Agent central qui coordonne tous les autres agents et workflows. Alba :
- Route les requêtes vers les agents appropriés
- Gère les workflows multi-étapes
- Maintient le contexte via le système de mémoire
- Fournit une interface conversationnelle élégante

#### **Agents Spécialisés**

1. **LeadResearch**
   - Recherche de leads via Exa Search (web)
   - Scraping Instagram via Apify
   - Enrichissement automatique des données
   - Sauvegarde dans Supabase CRM

2. **CRMSync**
   - Déduplication intelligente (hash sur nom/email/IG)
   - Normalisation des données
   - Scoring de qualité (engagement, fit, overall)
   - Mise à jour centralisée Supabase

3. **BrowserOutreach**
   - Automatisation Instagram via Stagehand
   - Commentaires et DMs personnalisés
   - Respect des rate limits Instagram ToS
   - Tracking complet des interactions

4. **MemoryAccess**
   - Recherche sémantique dans Supabase
   - Stockage de contexte par entité (client, projet, lead)
   - Rappel parfait pour continuité conversationnelle
   - Support futur pour pgvector (embeddings)

---

## 🛠️ Stack Technique

### Core Framework
- **Next.js 15** : App Router, React Server Components, Server Actions
- **Vercel AI SDK 5/6** : Agents, tools, streamText, Gen UI
- **TypeScript** : Type-safety complète
- **Tailwind CSS 4** : Styling moderne et responsive

### AI & LLM
- **Vercel AI Gateway** : Accès multi-modèles (OpenAI, Anthropic, xAI)
- **AI SDK Tools** : System natif d'outils et d'agents
- **Token Lens** : Tracking usage et coûts

### Data & Storage
- **Supabase** : PostgreSQL hébergé, Row Level Security
- **Postgres (Vercel/Neon)** : Base principale (chat, users, documents)
- **Vercel Blob** : Stockage fichiers (uploads, images)
- **Redis (Vercel KV)** : Caching et resumable streams

### Integrations
- **MCP Rube** : Protocol unifié pour Slack, Notion, Gmail, Drive, Sheets, Apify, Exa
- **Stagehand** : Browser automation pour Instagram
- **Apify** : Web scraping et Instagram data
- **Exa Search** : Recherche web intelligente

### Observability
- **OpenTelemetry** : Tracing distribué
- **Custom Logger** : Logs structurés
- **Rate Limiter** : Protection API

---

## 📦 Installation & Configuration

### Prérequis

```bash
- Node.js 18+
- pnpm 9+
- Compte Supabase (gratuit)
- Compte Vercel (optionnel pour AI Gateway)
- Accès MCP Rube (local ou hébergé)
```

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd agentworldSDK

# Installer les dépendances
pnpm install

# Copier et configurer .env.local
cp .env.example .env.local
# Éditer .env.local avec vos credentials
```

### Configuration Variables d'Environnement

Voir `.env.example` pour la liste complète. Variables essentielles :

```bash
# Authentication
AUTH_SECRET=<générer avec: openssl rand -base64 32>

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# PostgreSQL (chat history)
POSTGRES_URL=postgresql://user:password@host:port/db

# AI Gateway
AI_GATEWAY_API_KEY=<vercel ai gateway key>

# MCP Rube
MCP_SERVER_URL=http://localhost:3001
MCP_API_KEY=<optional>

# Stagehand
STAGEHAND_API_KEY=<browserbase api key>

# Cron Security
CRON_SECRET=<générer avec: openssl rand -hex 32>
```

### Setup Supabase

1. **Créer un projet Supabase**
   - Aller sur https://supabase.com
   - Créer un nouveau projet
   - Récupérer URL et Service Role Key

2. **Exécuter les migrations SQL**

```sql
-- Dans Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Optionnel pour pgvector

-- Tables créées automatiquement par Drizzle migrations
-- Voir lib/db/schema.ts pour la structure complète

-- Tables principales:
-- - Organization, Client, Project (CRM)
-- - Lead, LeadEvent, Interaction (Lead Management)
-- - AgentRun, Task (Agent Execution)
-- - Memory, MemoryLink (Memory System)

-- Configuration Row Level Security (RLS)
-- À adapter selon vos besoins de sécurité
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentRun" ENABLE ROW LEVEL SECURITY;
-- etc.
```

3. **Seed data (optionnel)**

```sql
-- Créer une organisation de test
INSERT INTO "Organization" (name)
VALUES ('Orchestra Intelligence');

-- Créer un client Wella
INSERT INTO "Client" (name, "organizationId")
VALUES ('Wella', (SELECT id FROM "Organization" LIMIT 1));
```

### Setup MCP Rube

```bash
# Cloner et configurer Rube
git clone https://github.com/ComposioHQ/Rube
cd Rube

# Suivre instructions README pour configurer
# Slack, Notion, Gmail, Drive, Sheets, Apify, Exa

# Démarrer le serveur MCP
npm run start
# Serveur disponible sur http://localhost:3001
```

### Migrations Database

```bash
# Générer migrations Drizzle
pnpm db:generate

# Appliquer migrations
pnpm db:migrate

# Studio Drizzle (GUI)
pnpm db:studio
```

---

## 🚀 Utilisation

### Démarrage Local

```bash
# Mode développement avec Turbo
pnpm dev

# Ouvrir http://localhost:3000
```

### Accéder à Alba

1. **S'inscrire/Connecter** : http://localhost:3000/login
2. **Chat avec Alba** : http://localhost:3000/alba
3. **Nouveau chat** : http://localhost:3000

### Exemples d'interactions avec Alba

#### Recherche de Leads
```
"Recherche des leads pour Wella : personnes ouvrant un salon de coiffure ou cherchant une marque"
```

Alba va :
1. Utiliser `leadResearch` (Exa + Apify)
2. Sauvegarder dans Supabase
3. Afficher LeadsBoard avec résultats
4. Proposer actions suivantes (enrichissement, outreach)

#### Outreach Instagram
```
"Envoie un DM personnalisé aux 5 meilleurs leads de cette semaine"
```

Alba va :
1. Requêter leads avec meilleurs scores
2. Utiliser `browserOutreach` avec délais
3. Tracker interactions dans CRM
4. Afficher RunsTimeline

#### Deep Research
```
"Analyse le marché des SaaS pour PME dans la beauté en France"
```

Alba va :
1. Utiliser Exa Search via MCP
2. Synthétiser findings
3. Stocker dans `memoryAccess`
4. Présenter résumé structuré

#### Rappel Mémoire
```
"Que sait-on sur le client Wella ?"
```

Alba va :
1. Utiliser `memoryAccess` avec entityType='client'
2. Récupérer tout le contexte lié
3. Présenter résumé chronologique

---

## 🔄 Workflows Automatisés

### Daily Lead Research (Cron)

Workflow automatique configuré dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/scheduler/daily-leads",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Ce que fait le workflow** :
1. S'exécute chaque jour à 9h
2. Pour chaque client dans Supabase :
   - Lance `leadResearch` avec query spécifique
   - Sauvegarde nouveaux leads
   - Execute `crmSync` pour enrichissement
   - Calcule scores de qualité
3. Envoie rapport via Slack (optionnel, via MCP)

**Déclenchement manuel** :
```bash
curl -X GET http://localhost:3000/api/scheduler/daily-leads \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 🎨 Gen UI Components

Alba utilise des composants Gen UI pour visualiser les données :

### LeadsBoard
```tsx
<LeadsBoard limit={10} />
```
Affiche les leads récents avec status, scores, actions

### RunsTimeline
```tsx
<RunsTimeline limit={10} />
```
Affiche l'historique des exécutions d'agents

### WorkflowsPanel
```tsx
<WorkflowsPanel />
```
Affiche les workflows actifs et leur status

---

## 📡 API Endpoints

### Chat
- `POST /api/chat/alba` : Chat avec Alba
- `DELETE /api/chat/alba?id=<chatId>` : Supprimer chat

### Leads
- `GET /api/leads?limit=10` : Liste des leads

### Agent Runs
- `GET /api/runs?limit=10` : Liste des exécutions

### Scheduler
- `GET /api/scheduler/daily-leads` : Déclencher workflow daily-leads

---

## 🧪 Testing

```bash
# Tests Playwright
pnpm test

# Tests spécifiques
pnpm exec playwright test tests/chat.spec.ts
```

---

## 🚢 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel

# Configuration automatique:
# - AI Gateway OIDC (pas de clé API nécessaire)
# - PostgreSQL Vercel
# - Redis Vercel KV
# - Blob Storage

# Configurer variables d'environnement dans Vercel Dashboard:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - STAGEHAND_API_KEY
# - MCP_SERVER_URL
# - CRON_SECRET
```

### Configuration Cron (Vercel)

Les crons sont automatiquement déployés depuis `vercel.json`. Vérifier dans Vercel Dashboard > Crons.

---

## 🔐 Sécurité & Conformité

### Instagram ToS
- Rate limiting : max 30 actions/heure
- Délais entre actions : min 10 secondes
- Pas de spam ou messages bulk non sollicités
- Comportement naturel et humain

### Données Sensibles
- Service Role Key Supabase : JAMAIS côté client
- Auth tokens : stockés en cookies httpOnly
- Logs : pas de données personnelles
- RLS Supabase : activer selon besoins

### Rate Limiting
- Configuration dans `.env` :
```bash
INSTAGRAM_MAX_ACTIONS_PER_HOUR=30
INSTAGRAM_MIN_DELAY_SECONDS=10
API_RATE_LIMIT_PER_MINUTE=60
```

---

## 📚 Structure du Projet

```
agentworldSDK/
├── app/
│   ├── (auth)/           # Authentication (NextAuth)
│   ├── (chat)/           # Chat routes et API
│   │   ├── alba/         # Page Alba
│   │   └── api/
│   │       ├── chat/alba/   # Route chat Alba
│   │       ├── leads/       # API Leads
│   │       ├── runs/        # API Agent Runs
│   │       └── scheduler/   # Cron endpoints
│   └── layout.tsx
├── lib/
│   ├── ai/
│   │   ├── orchestrator/
│   │   │   └── alba.ts      # Alba Orchestrator
│   │   ├── tools/           # AI SDK Tools
│   │   │   ├── lead-research.ts
│   │   │   ├── crm-sync.ts
│   │   │   ├── browser-outreach.ts
│   │   │   └── memory-access.ts
│   │   ├── memory/
│   │   │   └── supabase.ts  # Memory Client
│   │   ├── mcp/
│   │   │   └── rube.ts      # MCP Client
│   │   ├── prompts/
│   │   │   └── alba.ts      # System Prompt
│   │   ├── models.ts        # Model configs
│   │   └── providers.ts     # AI providers
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema
│   │   ├── queries.ts       # DB queries
│   │   └── migrations/      # SQL migrations
│   ├── supabase/
│   │   └── server.ts        # Supabase client
│   └── observability/
│       ├── logger.ts        # Structured logging
│       └── rate-limiter.ts  # Rate limiting
├── components/
│   ├── chat-alba.tsx        # Alba chat component
│   └── elements/
│       ├── leads-board.tsx
│       ├── runs-timeline.tsx
│       └── workflows-panel.tsx
├── .env.example
├── AGENT_WORLD.md
├── vercel.json
└── package.json
```

---

## 🎯 Roadmap

### Phase 1 (Actuel) ✅
- [x] Alba Orchestrator
- [x] Lead Research Agent
- [x] CRM Sync Agent
- [x] Browser Outreach Agent
- [x] Memory System
- [x] MCP Integration
- [x] Gen UI Components
- [x] Daily Workflow Automation

### Phase 2 (En cours) 🚧
- [ ] **DeepResearch Agent** : Recherche approfondie de marchés
- [ ] **ProjectEngineer Agent** : Setup structure de projets SaaS
- [ ] **Semantic Search** : pgvector embeddings pour memory
- [ ] **Multi-Client Support** : Isolation complète par client
- [ ] **Advanced Analytics** : Dashboards et métriques

### Phase 3 (Planifié) 📋
- [ ] **V0 Integration** : Génération UI directe
- [ ] **Email Campaigns** : Automation Gmail via MCP
- [ ] **LinkedIn Automation** : Extension Stagehand
- [ ] **Webhook System** : Événements temps réel
- [ ] **Mobile App** : React Native + Alba

---

## 🤝 Support & Contribution

### Orchestra Intelligence
- **Site Web** : [orchestraintelligence.fr](https://orchestraintelligence.fr)
- **Services** : SaaS sur-mesure, Agents IA pour PME
- **Tech Stack** : AI SDK, Next.js, Supabase, Vercel

### Documentation
- **AI SDK** : https://v6.ai-sdk.dev
- **Supabase** : https://supabase.com/docs
- **MCP Rube** : https://github.com/ComposioHQ/Rube
- **Stagehand** : https://github.com/browserbase/stagehand

### Aide
- Ouvrir une issue sur GitHub
- Consulter AGENT_WORLD.md
- Vérifier .env.example

---

## 📝 License

MIT License - Orchestra Intelligence

---

**Built with ❤️ by Orchestra Intelligence**

*Orchestrating the future of AI-powered business automation*
