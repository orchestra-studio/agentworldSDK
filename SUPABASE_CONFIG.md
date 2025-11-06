# Configuration Supabase - Agent World

## ✅ Setup Complété via MCP Supabase

Le setup Supabase a été effectué avec succès via l'intégration MCP Supabase.

### Projet Supabase

- **Nom du projet** : Agent World
- **Project ID** : `peyboqeuyromlytawzcg`
- **Région** : `eu-west-3` (Paris)
- **Status** : ACTIVE_HEALTHY
- **URL du projet** : `https://peyboqeuyromlytawzcg.supabase.co`

### Credentials Supabase

**⚠️ IMPORTANT : Pour Vercel, vous devez utiliser la SERVICE_ROLE_KEY, pas l'anon key !**

Pour obtenir la `SERVICE_ROLE_KEY` :
1. Aller dans Supabase Dashboard : https://supabase.com/dashboard/project/peyboqeuyromlytawzcg
2. **Settings** > **API**
3. Copier la **`service_role` key** (secret, pas l'anon key)

### Tables Créées

Toutes les tables CRM et mémoire ont été créées :

- ✅ **Organization** (1 ligne seed : "Orchestra Intelligence")
- ✅ **Client** (1 ligne seed : "Wella")
- ✅ **Lead**
- ✅ **LeadEvent**
- ✅ **Interaction**
- ✅ **Project**
- ✅ **AgentRun**
- ✅ **Task**
- ✅ **Memory** (1 ligne seed sur Orchestra Intelligence)
- ✅ **MemoryLink**

### Données Seed Créées

Les données initiales ont été insérées avec succès :

1. **Organization** : "Orchestra Intelligence"
   - ID : `dee8d880-f627-4eb3-affc-ed4c0b31c22e`
   - Créée le : 2025-11-06 13:47:29

2. **Client** : "Wella"
   - ID : `2e751874-00e1-46d1-8859-dda41592192b`
   - Lié à Organization : `dee8d880-f627-4eb3-affc-ed4c0b31c22e`
   - Créé le : 2025-11-06 13:47:29

3. **Memory** : Introduction sur Orchestra Intelligence
   - ID : `3c012f0e-0388-49bd-9544-dc5fe5e0ba90`
   - Entity Type : Organization
   - Entity ID : `dee8d880-f627-4eb3-affc-ed4c0b31c22e`
   - Créée le : 2025-11-06 13:47:29

## Variables d'Environnement pour Vercel

Ajouter ces variables dans Vercel Dashboard > Settings > Environment Variables :

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | `https://peyboqeuyromlytawzcg.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | [Récupérer depuis Supabase Dashboard > Settings > API] | Production, Preview, Development |

**⚠️ Ne jamais utiliser l'anon key pour SUPABASE_SERVICE_ROLE_KEY !**

## Vérification

Pour vérifier que tout fonctionne, exécuter cette requête dans Supabase SQL Editor :

```sql
-- Vérifier les données seed
SELECT 
  'Organization' as table_name, 
  "id"::text as id, 
  "name", 
  "createdAt" 
FROM "Organization" 
WHERE "name" = 'Orchestra Intelligence'
UNION ALL
SELECT 
  'Client' as table_name, 
  "id"::text, 
  "name", 
  "createdAt" 
FROM "Client" 
WHERE "name" = 'Wella'
UNION ALL
SELECT 
  'Memory' as table_name, 
  "id"::text, 
  LEFT("content", 50) as "name", 
  "createdAt" 
FROM "Memory" 
WHERE "entityType" = 'Organization';
```

## Prochaines Étapes

1. ✅ Supabase setup complété
2. ⏭️ Provisionner Vercel Postgres (voir `DEPLOYMENT.md`)
3. ⏭️ Configurer les variables d'environnement dans Vercel
4. ⏭️ Déployer avec `vercel --prod`

Voir `DEPLOYMENT.md` pour les instructions complètes de déploiement.

