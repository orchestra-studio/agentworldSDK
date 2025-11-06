# Agent World - Alba Orchestrator

Système d'orchestration d'agents IA pour automatiser les opérations business, développé avec Vercel AI SDK, Next.js, Supabase, MCP Rube et mémoire Supabase (pgvector).

## Architecture

### Composants principaux

- **Alba** : Orchestrateur principal qui gère les agents spécialisés et les workflows
- **LeadResearch** : Agent de recherche de leads via Exa Search et Apify Instagram
- **CRMSync** : Agent de synchronisation et enrichissement CRM
- **BrowserOutreach** : Agent d'automatisation Instagram via Stagehand
- **MemoryAccess** : Agent d'accès à la mémoire Supabase

### Stack technique

- **Framework** : Next.js 15 avec App Router
- **AI SDK** : Vercel AI SDK 5/6 avec OpenAI via AI Gateway
- **Base de données** : Supabase (PostgreSQL)
- **Mémoire** : Supabase avec pgvector (recherche sémantique native)
- **MCP** : Rube pour intégration unifiée (Slack, Notion, Gmail, Drive, Sheets, Apify, Exa)
- **Browser Automation** : Stagehand (Browserbase)

## Configuration

### Variables d'environnement

Voir `.env.example` pour la liste complète des variables nécessaires.

Variables essentielles :
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` : Configuration Supabase
- `MCP_SERVER_URL` : URL du serveur MCP Rube
- `STAGEHAND_API_KEY` : Clé API Stagehand pour l'automatisation navigateur
- `CRON_SECRET` : Secret pour sécuriser les endpoints cron

Note : La mémoire est stockée directement dans Supabase. Cognee peut être intégré plus tard (Sprint 5+) si besoin de graph memory avancé.

### Feature Flags

Les feature flags permettent d'activer/désactiver des fonctionnalités :
- `FEATURE_LEAD_RESEARCH`
- `FEATURE_BROWSER_OUTREACH`
- `FEATURE_CRM_SYNC`
- `FEATURE_MEMORY_ACCESS`
- `FEATURE_INSTAGRAM_AUTOMATION`

## Utilisation

### Chat avec Alba

Accéder à `/api/chat/alba` pour utiliser le chat avec Alba. Alba peut :
- Rechercher des leads
- Synchroniser et enrichir les données CRM
- Automatiser les interactions Instagram
- Accéder à la mémoire Supabase

### Workflows automatisés

#### Daily Lead Research

Le workflow `lead_daily` s'exécute automatiquement chaque jour à 9h (configuré dans `vercel.json`). Il :
1. Recherche des leads via Exa et Apify
2. Enregistre les leads dans Supabase
3. Synchronise et enrichit les données
4. Calcule les scores de qualité

### API Endpoints

- `GET /api/leads` : Liste des leads
- `GET /api/runs` : Liste des exécutions d'agents
- `GET /api/scheduler/daily-leads` : Déclenchement manuel du workflow daily-leads

## Développement

### Migrations de base de données

```bash
pnpm db:generate  # Générer les migrations
pnpm db:migrate   # Appliquer les migrations
```

### Configuration pgvector (optionnel pour recherche sémantique avancée)

Pour activer la recherche sémantique avec pgvector dans Supabase :

1. Aller dans le SQL Editor de Supabase
2. Exécuter : `CREATE EXTENSION IF NOT EXISTS vector;`
3. (Optionnel) Ajouter un index vectoriel sur la colonne `embedding` de la table `Memory`

Note : La recherche mémoire fonctionne actuellement avec une recherche textuelle simple. L'intégration de pgvector pour la recherche sémantique peut être ajoutée plus tard si nécessaire.

### Structure des fichiers

- `lib/ai/orchestrator/alba.ts` : Orchestrateur principal
- `lib/ai/tools/` : Tools AI SDK (LeadResearch, CRMSync, BrowserOutreach, MemoryAccess)
- `lib/ai/memory/supabase.ts` : Client mémoire Supabase
- `lib/ai/mcp/rube.ts` : Client MCP Rube
- `lib/supabase/server.ts` : Client Supabase côté serveur
- `components/elements/` : Composants GEN UI (LeadsBoard, RunsTimeline, WorkflowsPanel)

## Conformité et sécurité

- Respect des ToS Instagram : rate limiting et délais entre actions
- Logs structurés pour l'observabilité
- Feature flags pour contrôler les fonctionnalités sensibles
- Authentification via NextAuth

## Prochaines étapes

- Agent ProjectEngineer pour la préparation de structures de projets
- Intégration complète Slack/Notion via MCP
- Dashboards étendus avec visualisations avancées

