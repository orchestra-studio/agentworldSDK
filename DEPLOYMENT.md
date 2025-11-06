# Guide de Déploiement Vercel - Agent World

Ce guide vous accompagne pour déployer Agent World sur Vercel avec Vercel Postgres et Supabase.

## Prérequis

- Compte Vercel (https://vercel.com)
- Projet Supabase existant "Agent World"
- Vercel CLI installé (`npm i -g vercel`)

## Étape 1 : Setup Supabase

### 1.1 Exécuter le Script SQL

1. Dans votre projet Supabase, aller dans **"SQL Editor"**
2. Cliquer **"New Query"**
3. Ouvrir le fichier `supabase-setup.sql` dans ce projet
4. **Copier TOUT le contenu** du fichier
5. **Coller** dans l'éditeur SQL de Supabase
6. Cliquer **"Run"** (ou `Ctrl+Enter` / `Cmd+Enter`)
7. Vérifier que tout s'est bien passé (messages de succès dans les logs)

### 1.2 Vérifier les Données Seed

Exécuter cette requête pour vérifier que les données ont été créées :

```sql
SELECT 'Organization' as table_name, "id", "name", "createdAt" 
FROM "Organization" 
WHERE "name" = 'Orchestra Intelligence'
UNION ALL
SELECT 'Client' as table_name, "id"::text, "name", "createdAt" 
FROM "Client" 
WHERE "name" = 'Wella'
UNION ALL
SELECT 'Memory' as table_name, "id"::text, LEFT("content", 50) as "name", "createdAt" 
FROM "Memory" 
WHERE "entityType" = 'Organization';
```

Vous devriez voir :
- 1 Organization "Orchestra Intelligence"
- 1 Client "Wella"
- 1 Memory liée à l'Organization

### 1.3 Récupérer les Credentials Supabase

Dans Supabase Dashboard :

1. **Settings** > **API**
2. Copier ces 2 valeurs (vous en aurez besoin pour Vercel) :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **service_role key** (secret) : `eyJhbGc...` (le secret, pas l'anon key)

## Étape 2 : Provisionner Vercel Postgres

### 2.1 Créer la Base de Données

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet (ou créer un nouveau projet)
3. Onglet **"Storage"**
4. Cliquer **"Create Database"** > **"Postgres"**
5. Suivre les instructions (choisir un nom, région, etc.)
6. Attendre que la base soit provisionnée (quelques secondes)

### 2.2 Vérifier POSTGRES_URL

1. Dans Vercel Dashboard > **Settings** > **Environment Variables**
2. Vérifier que `POSTGRES_URL` est automatiquement créée
3. Vérifier qu'elle est disponible pour **Production**, **Preview** et **Development**

Si `POSTGRES_URL` n'est pas automatiquement créée :
- Aller dans **Storage** > votre base Postgres
- Copier la **Connection string**
- L'ajouter manuellement comme variable d'environnement `POSTGRES_URL`

## Étape 3 : Configurer les Variables d'Environnement

### 3.1 Générer les Secrets

Dans votre terminal local :

```bash
# Générer AUTH_SECRET
openssl rand -base64 32

# Générer CRON_SECRET
openssl rand -hex 32
```

**Copier les résultats** - vous en aurez besoin pour Vercel.

### 3.2 Ajouter les Variables dans Vercel

Dans Vercel Dashboard > **Settings** > **Environment Variables**, ajouter :

#### Variables OBLIGATOIRES

| Name | Value | Environment |
|------|-------|-------------|
| `AUTH_SECRET` | [résultat de `openssl rand -base64 32`] | Production, Preview, Development |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` (de Supabase) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service_role key de Supabase) | Production, Preview, Development |
| `POSTGRES_URL` | [automatique si Vercel Postgres, sinon connection string] | Production, Preview, Development |
| `CRON_SECRET` | [résultat de `openssl rand -hex 32`] | Production, Preview, Development |

#### Variables OPTIONNELLES (pour plus tard)

| Name | Value | Environment |
|------|-------|-------------|
| `MCP_SERVER_URL` | `http://your-mcp-server.com` | Production, Preview |
| `MCP_API_KEY` | [votre clé MCP] | Production, Preview |
| `STAGEHAND_API_KEY` | [votre clé Browserbase] | Production, Preview |
| `STAGEHAND_API_URL` | `https://api.stagehand.ai/v1` (par défaut) | Production, Preview |
| `FEATURE_LEAD_RESEARCH` | `true` ou `false` | Production, Preview |
| `FEATURE_BROWSER_OUTREACH` | `true` ou `false` | Production, Preview |
| `FEATURE_CRM_SYNC` | `true` ou `false` | Production, Preview |
| `FEATURE_MEMORY_ACCESS` | `true` ou `false` | Production, Preview |
| `FEATURE_INSTAGRAM_AUTOMATION` | `true` ou `false` | Production, Preview |

**Important** : Cochez **Production**, **Preview** et **Development** pour toutes les variables obligatoires.

## Étape 4 : Déployer le Projet

### 4.1 Installer Vercel CLI (si pas déjà fait)

```bash
npm i -g vercel
```

### 4.2 Login Vercel

```bash
vercel login
```

Choisir votre méthode (GitHub, Email, etc.) et suivre les instructions.

### 4.3 Lier le Projet (si première fois)

```bash
cd /path/to/agentworldSDK
vercel link
```

Répondre aux questions :
- **Link to existing project?** → `Y` (si projet existe déjà) ou `N` (créer nouveau)
- **What's your project's name?** → `agent-world` (ou votre choix)
- **In which directory is your code located?** → `./`

### 4.4 Déployer en Production

```bash
vercel --prod
```

Vercel va :
1. Créer/mettre à jour le projet
2. Détecter Next.js automatiquement
3. Installer les dépendances (`pnpm install`)
4. Exécuter les migrations (`tsx lib/db/migrate`)
5. Builder le projet (`next build`)
6. Déployer !

À la fin, vous aurez une URL de production :
```
✅ Production: https://agent-world.vercel.app
```

## Étape 5 : Tester l'Application

### 5.1 Accéder à l'Application

URL de production :
```
https://agent-world.vercel.app
```
(ou l'URL custom que Vercel vous a donnée)

### 5.2 Créer un Compte

1. Aller sur : `https://votre-app.vercel.app/login`
2. Cliquer **"Sign Up"** ou **"Register"**
3. Créer un compte avec email/password
4. Se connecter

### 5.3 Accéder à Alba

1. Aller sur : `https://votre-app.vercel.app/alba`
2. Vous verrez l'interface Alba avec :
   - Chat au centre
   - Panneau latéral droite avec :
     * LeadsBoard
     * RunsTimeline
     * WorkflowsPanel

### 5.4 Tests Fonctionnels

#### Test 1 : Mémoire
**Vous** : "Bonjour Alba, peux-tu te présenter ?"
**Alba** : [Devrait se présenter comme orchestrateur Orchestra Intelligence]

#### Test 2 : Memory Access
**Vous** : "Que sais-tu sur Orchestra Intelligence ?"
**Alba** : [Va chercher dans la mémoire Supabase et devrait trouver la mémoire seed]

#### Test 3 : API Endpoints
Tester les endpoints API :
```bash
# Liste des leads
curl https://votre-app.vercel.app/api/leads

# Liste des runs
curl https://votre-app.vercel.app/api/runs
```

## Étape 6 : Vérifier Supabase

### 6.1 Vérifier les Tables

1. Aller dans Supabase Dashboard
2. Cliquer **"Table Editor"**
3. Vérifier que les tables existent :
   - ✅ Organization
   - ✅ Client
   - ✅ Lead
   - ✅ LeadEvent
   - ✅ Interaction
   - ✅ AgentRun
   - ✅ Task
   - ✅ Memory
   - ✅ MemoryLink
   - ✅ Project

### 6.2 Vérifier le Seed Data

Exécuter dans Supabase SQL Editor :

```sql
-- Vérifier Organization
SELECT * FROM "Organization" WHERE "name" = 'Orchestra Intelligence';

-- Vérifier Client
SELECT * FROM "Client" WHERE "name" = 'Wella';

-- Vérifier Memory
SELECT * FROM "Memory" WHERE "entityType" = 'Organization';
```

## Étape 7 : Activer le Cron (Workflow Daily)

### 7.1 Vérifier que le Cron est Déployé

Dans Vercel Dashboard :

1. Aller dans votre projet
2. Onglet **"Crons"**
3. Vous devriez voir :
   - **Path** : `/api/scheduler/daily-leads`
   - **Schedule** : `0 9 * * *` (tous les jours à 9h UTC)
   - **Status** : Active ✅

### 7.2 Tester le Cron Manuellement

Dans votre terminal :

```bash
# Remplacer VOTRE_CRON_SECRET et votre URL
curl -X GET https://votre-app.vercel.app/api/scheduler/daily-leads \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

Devrait retourner :
```json
{
  "success": true,
  "processed": 1,
  "results": [...]
}
```

## Étape 8 : Monitoring & Logs

### 8.1 Voir les Logs Vercel

Dans Vercel Dashboard :

1. Onglet **"Logs"**
2. Vous verrez tous les logs en temps réel
3. Filtrer par fonction si besoin

### 8.2 Voir les Données Supabase

Dans Supabase Dashboard :

1. **Table Editor** > **Lead**
2. Voir les nouveaux leads créés (si le cron a tourné)
3. **Table Editor** > **AgentRun**
4. Voir les exécutions d'agents

## Checklist de Test Complet

- [ ] Projet Supabase créé
- [ ] Script SQL `supabase-setup.sql` exécuté sans erreurs
- [ ] Credentials Supabase copiés (URL + service_role key)
- [ ] Vercel Postgres provisionné
- [ ] `POSTGRES_URL` disponible dans Vercel (3 environnements)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Projet déployé sur Vercel (`vercel --prod`)
- [ ] Application accessible via URL
- [ ] Compte utilisateur créé
- [ ] Alba accessible sur `/alba`
- [ ] Interface affiche LeadsBoard, RunsTimeline, WorkflowsPanel
- [ ] Alba répond aux messages
- [ ] Tables Supabase contiennent le seed data
- [ ] Cron configuré (visible dans Dashboard Vercel)
- [ ] Test manuel du cron réussi

## Troubleshooting

### Problème : Build Fail

**Cause probable** : Variables d'environnement manquantes

**Solution** :
1. Vérifier toutes les variables OBLIGATOIRES dans Settings > Env Variables
2. Vérifier qu'elles sont actives pour **Production** ET **Preview** ET **Development**
3. Redéployer : `vercel --prod`

### Problème : "Supabase URL is not defined"

**Solution** :
1. Vérifier que `SUPABASE_URL` est dans Vercel Env Variables
2. Vérifier qu'elle est active pour **Production** ET **Preview** ET **Development**
3. Redéployer

### Problème : "Database connection failed" ou "POSTGRES_URL is not defined"

**Solution** :
1. Vérifier `POSTGRES_URL` dans Vercel Env Variables
2. Si Vercel Postgres : attendre que la DB soit complètement provisionnée
3. Si Neon/externe : vérifier que la connection string est correcte
4. Tester la connexion depuis Supabase SQL Editor ou un client PostgreSQL

### Problème : Alba ne répond pas

**Solution** :
1. Vérifier les logs Vercel (onglet Logs)
2. Vérifier que vous êtes bien connecté (session valide)
3. Vérifier que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont corrects
4. Pour Vercel deployments, pas besoin de `AI_GATEWAY_API_KEY` (OIDC auto)

### Problème : Cron ne fonctionne pas

**Solution** :
1. Vérifier que `CRON_SECRET` est configuré dans Vercel
2. Vérifier dans Vercel Dashboard > Crons que le cron est actif
3. Tester manuellement avec curl (voir Étape 7.2)
4. Vérifier les logs Vercel pour les erreurs

### Problème : Migrations échouent au build

**Solution** :
1. Vérifier que `POSTGRES_URL` est correcte et accessible
2. Vérifier que la base de données est bien provisionnée
3. Vérifier les logs de build dans Vercel pour voir l'erreur exacte
4. Tester les migrations localement : `pnpm db:migrate`

## Pour Aller Plus Loin

### Setup MCP Rube (Intégrations Slack, Notion, etc.)

1. Déployer un serveur MCP Rube sur Vercel/Railway/Render
2. Configurer les API keys pour Slack, Notion, Gmail, etc.
3. Ajouter `MCP_SERVER_URL` et `MCP_API_KEY` dans Vercel Env Variables
4. Redéployer

### Setup Stagehand (Instagram Automation)

1. Créer compte sur https://browserbase.com
2. Récupérer API Key
3. Ajouter `STAGEHAND_API_KEY` dans Vercel
4. Tester avec : "Envoie un DM à @handle"

### Custom Domain

1. Dans Vercel Dashboard > Settings > Domains
2. Ajouter votre domaine (ex: `alba.orchestraintelligence.fr`)
3. Suivre les instructions DNS
4. SSL automatique via Vercel

## Commandes Utiles

```bash
# Déployer en production
vercel --prod

# Déployer en preview
vercel

# Voir les logs en temps réel
vercel logs

# Télécharger les variables d'environnement localement
vercel env pull

# Vérifier la configuration
vercel inspect
```

## Support

En cas de problème, vérifier :
1. Les logs Vercel (Dashboard > Logs)
2. Les logs Supabase (Dashboard > Logs)
3. Les variables d'environnement (Dashboard > Settings > Env Variables)
4. Le statut du cron (Dashboard > Crons)

