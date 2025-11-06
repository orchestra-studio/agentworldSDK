# 🚀 Guide Rapide de Déploiement Vercel

## Étape 1 : Créer le fichier de variables d'environnement

1. **Copier le template** :
   ```bash
   cp vercel-env-template.txt .env.vercel.local
   ```

2. **Remplir les variables** dans `.env.vercel.local` :

   **OBLIGATOIRES** :
   - `AUTH_SECRET` : Générer avec `openssl rand -base64 32`
   - `SUPABASE_URL` : Déjà rempli (`https://peyboqeuyromlytawzcg.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` : Récupérer depuis [Supabase Dashboard](https://supabase.com/dashboard/project/peyboqeuyromlytawzcg/settings/api) > Settings > API > service_role key
   - `POSTGRES_URL` : 
     - Si Vercel Postgres : sera automatiquement rempli après création
     - Si externe (Neon, etc.) : coller la connection string
   - `CRON_SECRET` : Générer avec `openssl rand -hex 32`

   **OPTIONNELLES** (décommenter si nécessaire) :
   - `MCP_SERVER_URL`
   - `MCP_API_KEY`
   - `STAGEHAND_API_KEY`
   - `STAGEHAND_API_URL`

## Étape 2 : Installer Vercel CLI (si pas déjà fait)

```bash
npm i -g vercel
```

## Étape 3 : Se connecter à Vercel

```bash
vercel login
```

## Étape 4 : Lier le projet (première fois uniquement)

```bash
vercel link
```

Répondre aux questions :
- Link to existing project? → `Y` (si projet existe) ou `N` (créer nouveau)
- What's your project's name? → `agent-world` (ou votre choix)
- In which directory is your code located? → `./`

## Étape 5 : Provisionner Vercel Postgres (si pas déjà fait)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Onglet **"Storage"**
4. Cliquer **"Create Database"** > **"Postgres"**
5. Attendre que la base soit provisionnée
6. Copier la `POSTGRES_URL` et l'ajouter dans `.env.vercel.local`

## Étape 6 : Configurer les variables dans Vercel

**Option A - Script automatique (recommandé)** :
```bash
pnpm vercel:env:setup
```

**Option B - Manuellement** :
```bash
# Pour chaque variable, répéter pour production, preview et development
vercel env add AUTH_SECRET production
vercel env add SUPABASE_URL production
# etc...
```

## Étape 7 : Déployer

**Production** :
```bash
pnpm vercel:deploy
# ou
vercel --prod
```

**Preview** :
```bash
pnpm vercel:preview
# ou
vercel
```

## Vérification

Après le déploiement :

1. **Vérifier l'URL** : Vercel vous donnera une URL (ex: `https://agent-world.vercel.app`)
2. **Tester l'application** :
   - Aller sur `/login` pour créer un compte
   - Aller sur `/alba` pour tester Alba
3. **Vérifier le cron** :
   - Vercel Dashboard > Crons > Vérifier que `/api/scheduler/daily-leads` est actif

## Commandes Utiles

```bash
# Voir les logs en temps réel
vercel logs

# Voir les variables d'environnement configurées
vercel env ls

# Télécharger les variables localement
vercel env pull

# Vérifier la configuration
vercel inspect
```

## Troubleshooting

### "Variables manquantes"
→ Vérifier que `.env.vercel.local` contient toutes les variables obligatoires

### "Build failed"
→ Vérifier les logs Vercel Dashboard > Logs

### "Database connection failed"
→ Vérifier que `POSTGRES_URL` est correcte et accessible

### "Supabase URL is not defined"
→ Vérifier que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configurées dans Vercel

## Fichiers Créés

- `vercel-env-template.txt` : Template des variables
- `.env.vercel.local` : Vos variables (à créer vous-même, ne pas commiter)
- `scripts/setup-vercel-env.js` : Script pour configurer les variables automatiquement
- `scripts/deploy-vercel.sh` : Script bash alternatif

## Support

Voir `DEPLOYMENT.md` pour le guide complet et détaillé.

