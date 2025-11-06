# 🔍 Diagnostic et Correction Vercel - Agent World

## 📊 État Actuel Identifié

**Repository :** `orchestra-studio/agentworldSDK`
**Branche :** `claude/finalize-project-011CUrhXtHqSDbPMhErVVQKK`
**Configuration Vercel :** ✅ `vercel.json` présent avec cron

---

## ⚠️ Causes Probables d'Échec de Déploiement

### 1. Variables d'Environnement Manquantes

Le projet **NÉCESSITE** ces variables pour builder :

#### 🔴 CRITIQUES (Build échoue sans elles)
```bash
AUTH_SECRET=****
POSTGRES_URL=****
SUPABASE_URL=****
SUPABASE_SERVICE_ROLE_KEY=****
```

#### 🟡 OPTIONNELLES (Build réussit sans elles)
```bash
REDIS_URL=****
BLOB_READ_WRITE_TOKEN=****
AI_GATEWAY_API_KEY=**** # Pas nécessaire sur Vercel (OIDC auto)
MCP_SERVER_URL=****
STAGEHAND_API_KEY=****
CRON_SECRET=****
```

---

## ✅ SOLUTION : Checklist Variables Vercel

### Étape 1️⃣ : Aller dans Vercel Dashboard

```
1. Ouvrir : https://vercel.com/dashboard
2. Trouver le projet : "agentworldSDK" ou "agent-world"
3. Cliquer sur le projet
4. Onglet "Settings" (⚙️)
5. Section "Environment Variables"
```

### Étape 2️⃣ : Ajouter les Variables OBLIGATOIRES

Pour CHAQUE variable, cliquer "Add New" et remplir :

#### AUTH_SECRET
```
Name: AUTH_SECRET
Value: NltN5BNWSzCukIzNFxOb9jwIPTfHaskclcOlxcDrpMk=
Environment: ✅ Production ✅ Preview ✅ Development
```

#### POSTGRES_URL (Votre base Neon)
```
Name: POSTGRES_URL
Value: postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
Environment: ✅ Production ✅ Preview ✅ Development
```

**📍 Où récupérer :**
- Neon Dashboard : https://console.neon.tech
- Votre projet > Connection Details > Connection string

#### SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development
```

**📍 Où récupérer :**
- Supabase Dashboard : https://supabase.com/dashboard
- Votre projet > Settings > API > Project URL

#### SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: ✅ Production ✅ Preview ✅ Development
```

**📍 Où récupérer :**
- Supabase Dashboard > Settings > API > service_role (secret)
- ⚠️ **ATTENTION : C'est la clé SERVICE ROLE, pas anon !**

### Étape 3️⃣ : Ajouter CRON_SECRET (pour scheduler)

```
Name: CRON_SECRET
Value: 3db3b1b4d3bbe9d8f062356731fdd8da08b37f7b304aa58342ef4a64bc11d7c0
Environment: ✅ Production
```

### Étape 4️⃣ : Setup Storage Vercel (Optionnel mais recommandé)

#### A. Vercel Postgres

Si vous n'utilisez pas Neon, créer une base Vercel Postgres :
```
1. Vercel Dashboard > Votre projet
2. Onglet "Storage"
3. "Create Database" > Postgres
4. POSTGRES_URL sera ajoutée automatiquement
```

#### B. Vercel Blob (pour uploads)

```
1. Vercel Dashboard > Votre projet
2. Onglet "Storage"
3. "Create Store" > Blob
4. BLOB_READ_WRITE_TOKEN sera ajoutée automatiquement
```

#### C. Vercel Redis (pour resumable streams)

```
1. Vercel Dashboard > Votre projet
2. Onglet "Storage"
3. "Create Store" > Redis (KV)
4. REDIS_URL sera ajoutée automatiquement
```

---

## 🔧 Étape 5️⃣ : Redéployer

### Option A : Via Dashboard (Recommandé)

```
1. Vercel Dashboard > Votre projet
2. Onglet "Deployments"
3. Trouver le dernier déploiement échoué
4. Cliquer "..." (menu)
5. Cliquer "Redeploy"
6. Cocher "Use existing Build Cache" si c'est juste les variables qui manquaient
7. Cliquer "Redeploy"
```

### Option B : Via GitHub

```
# Faire un commit vide pour déclencher un nouveau déploiement
git commit --allow-empty -m "chore: trigger Vercel redeploy"
git push origin claude/finalize-project-011CUrhXtHqSDbPMhErVVQKK
```

### Option C : Via CLI (si connecté)

```bash
# Se connecter à Vercel
vercel login

# Link au projet
vercel link

# Déployer
vercel --prod
```

---

## 🔍 Diagnostic des Erreurs de Build

### Erreur : "SUPABASE_URL is not defined"

**Cause :** Variable d'environnement manquante
**Solution :** Ajouter SUPABASE_URL dans Vercel Dashboard > Settings > Env Variables

### Erreur : "Failed to compile"

**Cause possible :** TypeScript errors ou dépendances manquantes
**Solution :**
```bash
# Tester localement d'abord
pnpm build

# Si ça marche localement mais pas sur Vercel :
# - Vérifier Node version (package.json : "engines")
# - Vérifier que toutes les env vars sont présentes
```

### Erreur : "Database connection failed"

**Cause :** POSTGRES_URL incorrect ou base non accessible
**Solution :**
- Vérifier format : `postgresql://user:password@host/db?sslmode=require`
- Vérifier que la base Neon est bien créée
- Tester la connexion localement avec cette URL

### Erreur : "Module not found"

**Cause :** Dépendance manquante dans package.json
**Solution :** Vérifier que `pnpm-lock.yaml` est commité

---

## 📋 Checklist Vercel Complète

### Configuration Projet
- [ ] Projet existe sur Vercel
- [ ] Repository GitHub connecté
- [ ] Branche de déploiement définie (main ou votre branche)
- [ ] Build Command : `pnpm db:migrate && pnpm build`
- [ ] Output Directory : `.next`
- [ ] Install Command : `pnpm install`

### Variables d'Environnement
- [ ] AUTH_SECRET ajoutée (Production + Preview + Development)
- [ ] POSTGRES_URL ajoutée (Production + Preview + Development)
- [ ] SUPABASE_URL ajoutée (Production + Preview + Development)
- [ ] SUPABASE_SERVICE_ROLE_KEY ajoutée (Production + Preview + Development)
- [ ] CRON_SECRET ajoutée (Production)

### Storage (Optionnel)
- [ ] Vercel Blob créé (pour uploads) OU pas nécessaire
- [ ] Vercel Redis créé (pour caching) OU pas nécessaire

### Déploiement
- [ ] Dernier commit pushé sur GitHub
- [ ] Vercel a détecté le push
- [ ] Build réussi (vert ✅)
- [ ] Déploiement réussi (vert ✅)
- [ ] URL production accessible

### Crons
- [ ] Cron visible dans Vercel Dashboard > Crons
- [ ] Cron actif (schedule : "0 9 * * *")
- [ ] Path correct : "/api/scheduler/daily-leads"

---

## 🎯 Actions Immédiates

1. **Aller dans Vercel Dashboard > Votre projet > Settings > Environment Variables**
2. **Ajouter les 4 variables CRITIQUES** (AUTH_SECRET, POSTGRES_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
3. **Redéployer** (Deployments > Redeploy)
4. **Vérifier les logs** pendant le build
5. **Tester l'URL** une fois déployé

---

## 📊 Comment Vérifier que ça Marche

Une fois redéployé :

```
1. Vercel Dashboard > Deployments
2. Le dernier déploiement doit être ✅ vert "Ready"
3. Cliquer sur l'URL du déploiement
4. Devrait afficher la page d'accueil
5. Aller sur : /alba
6. Devrait afficher l'interface Alba
```

---

## 💡 Secrets Générés pour Vous

```bash
# À copier dans Vercel Dashboard

AUTH_SECRET=NltN5BNWSzCukIzNFxOb9jwIPTfHaskclcOlxcDrpMk=

CRON_SECRET=3db3b1b4d3bbe9d8f062356731fdd8da08b37f7b304aa58342ef4a64bc11d7c0
```

---

**Status : 🟡 ACTION REQUISE**

Une fois les variables ajoutées dans Vercel → 🟢 DÉPLOIEMENT RÉUSSI !

---

*Diagnostic créé le 6 Novembre 2025*
