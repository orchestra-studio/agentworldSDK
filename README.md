# Agent World - Alba Orchestrator

**Orchestra Intelligence AI Agent Platform**

<p align="center">
  <img src="app/(chat)/opengraph-image.png" alt="Alba - Orchestra Intelligence" />
</p>

<p align="center">
  Système d'orchestration d'agents IA pour automatiser les opérations business<br/>
  Construit avec ❤️ par <strong>Orchestra Intelligence</strong>
</p>

<p align="center">
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="./AGENT_WORLD.md"><strong>Documentation Complète</strong></a> ·
  <a href="#-tech-stack"><strong>Tech Stack</strong></a>
</p>

---

## 🎯 Vue d'ensemble

**Alba** est l'orchestrateur IA d'Orchestra Intelligence qui coordonne des agents spécialisés pour automatiser :

- 🔍 **Lead Generation** - Recherche automatisée via Exa Search + Apify Instagram
- 💼 **CRM Automation** - Gestion centralisée Supabase avec scoring intelligent
- 🤖 **Social Automation** - Instagram automation via Stagehand (comments, DMs)
- 🧠 **Memory System** - Mémoire parfaite avec Supabase pour contexte long-terme
- 🔌 **MCP Integration** - Outils unifiés : Slack, Notion, Gmail, Drive, Sheets
- 🎨 **Gen UI** - Visualisations : Leads Board, Runs Timeline, Workflows Panel

---

## 🚀 Quick Start

### 1. Prérequis

```bash
Node.js 18+ • pnpm 9+ • Compte Supabase (gratuit) • Vercel (optionnel)
```

### 2. Installation

```bash
# Cloner le repo
git clone <repository-url>
cd agentworldSDK

# Installer dépendances
pnpm install

# Configuration environnement
cp .env.example .env.local
```

### 3. Configuration Supabase

**Créer un projet :** https://supabase.com

**Exécuter le script SQL :**
```bash
# Dans Supabase SQL Editor, copier/coller le contenu de:
cat supabase-setup.sql
# Ou exécuter directement dans l'éditeur SQL
```

**Récupérer credentials :**
- SUPABASE_URL : Settings > API > Project URL
- SUPABASE_SERVICE_ROLE_KEY : Settings > API > service_role key (secret)

### 4. Configuration .env.local

```bash
# Authentication
AUTH_SECRET=<openssl rand -base64 32>

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# PostgreSQL (Vercel or Neon)
POSTGRES_URL=postgresql://user:password@host:port/db

# AI Gateway (Vercel - optionnel en local)
# AI_GATEWAY_API_KEY=<vercel_ai_gateway_key>

# MCP Rube (optionnel - pour intégrations avancées)
# MCP_SERVER_URL=http://localhost:3001

# Stagehand (optionnel - pour Instagram automation)
# STAGEHAND_API_KEY=<browserbase_api_key>
```

### 5. Démarrage

```bash
# Migrations database
pnpm db:migrate

# Mode développement
pnpm dev

# Ouvrir http://localhost:3000
```

### 6. Accéder à Alba

1. **S'inscrire :** http://localhost:3000/login
2. **Chat avec Alba :** http://localhost:3000/alba
3. **Tester :**
   ```
   "Recherche des leads pour un salon de coiffure"
   "Que sait-on sur le client Wella ?"
   "Analyse le marché des SaaS beauté en France"
   ```

---

## ✨ Features

### Agents Spécialisés

#### 🔍 LeadResearch
Recherche de leads via Exa Search (web) et Apify (Instagram)
- Auto-enrichissement des données
- Sauvegarde dans Supabase CRM
- Déduplication intelligente

#### 💼 CRMSync
Synchronisation et enrichissement CRM
- Normalisation des données
- Scoring de qualité (engagement, fit, overall)
- Mise à jour centralisée

#### 🤖 BrowserOutreach
Automatisation Instagram via Stagehand
- Commentaires personnalisés
- DMs ciblés
- Respect rate limits & ToS

#### 🧠 MemoryAccess
Système de mémoire long-terme
- Recherche sémantique Supabase
- Contexte par entité (client, projet, lead)
- Rappel parfait multi-sessions

### Workflows Automatisés

#### Daily Lead Research (Cron)
Workflow quotidien automatique :
1. Recherche leads (Exa + Apify)
2. Sauvegarde + déduplication
3. Enrichissement + scoring
4. Rapport Slack (optionnel)

**Configuration :** `vercel.json`
```json
{
  "crons": [{
    "path": "/api/scheduler/daily-leads",
    "schedule": "0 9 * * *"
  }]
}
```

### Gen UI Components

- **LeadsBoard** : Leads récents avec status + scores
- **RunsTimeline** : Historique exécutions agents
- **WorkflowsPanel** : Workflows actifs + status

---

## 🛠️ Tech Stack

### Core
- **Next.js 15** - App Router, RSC, Server Actions
- **Vercel AI SDK 5/6** - Agents, tools, streamText
- **TypeScript** - Type-safety complète
- **Tailwind CSS 4** - Styling moderne

### AI & Data
- **Vercel AI Gateway** - Multi-LLM (OpenAI, Anthropic, xAI)
- **Supabase** - PostgreSQL + Row Level Security
- **Redis (Vercel KV)** - Caching + resumable streams
- **Vercel Blob** - File storage

### Integrations
- **MCP Rube** - Unified protocol (Slack, Notion, Gmail, Drive)
- **Stagehand** - Browser automation (Browserbase)
- **Apify** - Web scraping + Instagram
- **Exa Search** - Intelligent web search

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/alba` | POST | Chat avec Alba |
| `/api/leads` | GET | Liste des leads |
| `/api/runs` | GET | Exécutions agents |
| `/api/scheduler/daily-leads` | GET | Déclencher workflow |

---

## 📚 Documentation

- **[AGENT_WORLD.md](./AGENT_WORLD.md)** - Documentation complète
- **[.env.example](./.env.example)** - Variables d'environnement
- **[supabase-setup.sql](./supabase-setup.sql)** - Setup Supabase

### Guides
- [Installation & Configuration](./AGENT_WORLD.md#-installation--configuration)
- [Utilisation](./AGENT_WORLD.md#-utilisation)
- [Workflows Automatisés](./AGENT_WORLD.md#-workflows-automatisés)
- [Déploiement](./AGENT_WORLD.md#-déploiement)

---

## 🧪 Testing

```bash
# Tests Playwright
pnpm test

# Lint & Format
pnpm lint
pnpm format
```

---

## 🚢 Déploiement Vercel

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel

# Config automatique :
# - AI Gateway OIDC
# - PostgreSQL Vercel
# - Redis Vercel KV
# - Blob Storage

# Variables à configurer dans Dashboard :
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
```

**Crons** sont auto-déployés depuis `vercel.json`

---

## 🔐 Sécurité

### Instagram ToS Compliance
- Rate limiting : 30 actions/heure max
- Délais : 10 secondes min entre actions
- Pas de spam/bulk messages
- Comportement naturel et humain

### Best Practices
- Service Role Key : JAMAIS côté client
- RLS Supabase : activer selon besoins
- Logs : pas de données sensibles
- Auth : cookies httpOnly

---

## 📁 Structure

```
agentworldSDK/
├── app/(chat)/          # Routes & API
│   ├── alba/           # Page Alba
│   └── api/
│       ├── chat/alba/  # Chat API
│       ├── leads/      # Leads API
│       └── scheduler/  # Cron
├── lib/ai/
│   ├── orchestrator/   # Alba
│   ├── tools/          # Agents
│   ├── memory/         # Memory System
│   └── mcp/            # MCP Client
├── components/         # UI + Gen UI
└── supabase-setup.sql  # DB Setup
```

---

## 🎯 Roadmap

### ✅ Phase 1 (Actuel)
Alba Orchestrator • Lead Research • CRM Sync • Browser Outreach • Memory • MCP • Gen UI

### 🚧 Phase 2 (En cours)
DeepResearch Agent • ProjectEngineer • Semantic Search (pgvector) • Multi-Client • Analytics

### 📋 Phase 3 (Planifié)
V0 Integration • Email Campaigns • LinkedIn Automation • Webhooks • Mobile App

---

## 🤝 Support

### Orchestra Intelligence
- **Site** : [orchestraintelligence.fr](https://orchestraintelligence.fr)
- **Services** : SaaS sur-mesure + Agents IA pour PME
- **Contact** : Ouvrir une issue GitHub

### Resources
- **AI SDK** : https://v6.ai-sdk.dev
- **Supabase** : https://supabase.com/docs
- **MCP Rube** : https://github.com/ComposioHQ/Rube

---

## 📝 License

MIT License - Orchestra Intelligence

---

<p align="center">
  <strong>Built with ❤️ by Orchestra Intelligence</strong><br/>
  <em>Orchestrating the future of AI-powered business automation</em>
</p>
