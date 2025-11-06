# 🚀 Configuration Rapide - Agent World

## ✅ Étapes Complétées

- [x] Dépendances installées (713 packages)
- [x] Fichier `.env.local` créé
- [x] Secrets générés (AUTH_SECRET, CRON_SECRET)

---

## 📝 ÉTAPE 1 : Remplir votre .env.local

Ouvrez le fichier `.env.local` et remplacez les valeurs suivantes :

### 1️⃣ AUTH_SECRET (Généré pour vous)

```bash
AUTH_SECRET=NltN5BNWSzCukIzNFxOb9jwIPTfHaskclcOlxcDrpMk=
```

**✅ Copiez cette ligne exactement dans votre .env.local**

### 2️⃣ POSTGRES_URL (Votre base Neon)

```bash
# Récupérer depuis: https://console.neon.tech/app/projects
# Format: postgresql://user:password@host/database?sslmode=require

POSTGRES_URL=postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
```

**📍 Où trouver :**
1. Aller sur https://console.neon.tech
2. Cliquer sur votre projet
3. Onglet "Connection Details"
4. Copier la "Connection string" (avec password visible)

### 3️⃣ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY

```bash
# Récupérer depuis: Supabase Dashboard > Settings > API

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**📍 Où trouver :**
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Settings (⚙️) > API
4. Copier :
   - **Project URL** → `SUPABASE_URL`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔧 ÉTAPE 2 : Exemple de .env.local Complété

Voici à quoi devrait ressembler votre `.env.local` une fois rempli :

```bash
# AUTHENTICATION
AUTH_SECRET=NltN5BNWSzCukIzNFxOb9jwIPTfHaskclcOlxcDrpMk=

# NEON DATABASE
POSTGRES_URL=postgresql://neondb_owner:AbcDef123@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# SUPABASE
SUPABASE_URL=https://abcdefghijklmno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTg4NjcyMDAsImV4cCI6MjAxNDQ0MzIwMH0.abcd1234...

# FEATURE FLAGS
FEATURE_LEAD_RESEARCH=true
FEATURE_CRM_SYNC=true
FEATURE_MEMORY_ACCESS=true
FEATURE_BROWSER_OUTREACH=false
FEATURE_INSTAGRAM_AUTOMATION=false

# ENVIRONMENT
NODE_ENV=development
LOG_LEVEL=info
```

---

## 🗄️ ÉTAPE 3 : Setup Supabase (Si pas encore fait)

### 3.1 Exécuter le Script SQL

Si vous n'avez pas encore créé les tables dans Supabase :

```bash
# 1. Aller sur Supabase Dashboard
# 2. Votre projet > SQL Editor
# 3. Cliquer "New Query"
# 4. Copier TOUT le contenu de: supabase-setup.sql
# 5. Coller et cliquer "Run" (ou Ctrl+Enter)
# 6. Vérifier qu'il n'y a pas d'erreurs (messages verts)
```

### 3.2 Vérifier les Tables

Dans Supabase Dashboard > Table Editor, vous devriez voir :

- ✅ Organization
- ✅ Client
- ✅ Project
- ✅ Lead
- ✅ LeadEvent
- ✅ Interaction
- ✅ AgentRun
- ✅ Task
- ✅ Memory
- ✅ MemoryLink

---

## 🚀 ÉTAPE 4 : Lancer le Projet

### 4.1 Exécuter les Migrations (Base Postgres/Neon)

```bash
pnpm db:migrate
```

**Résultat attendu :**
```
> Migrating...
> Migration complete!
```

### 4.2 Démarrer en Mode Dev

```bash
pnpm dev
```

**Résultat attendu :**
```
  ▲ Next.js 15.3.0-canary.31 (turbo)
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 4.3 Accéder à l'Application

```
1. Ouvrir: http://localhost:3000
2. Créer un compte: /login ou /register
3. Accéder à Alba: /alba
```

---

## ❌ Résolution de Problèmes

### Erreur : "POSTGRES_URL is not defined"

```bash
# Vérifier que POSTGRES_URL est bien dans .env.local
cat .env.local | grep POSTGRES_URL

# Si absent ou incorrect, récupérer depuis Neon Dashboard
```

### Erreur : "SUPABASE_URL is not defined"

```bash
# Vérifier les credentials Supabase
cat .env.local | grep SUPABASE

# Récupérer depuis: Supabase Dashboard > Settings > API
```

### Erreur : Migration Failed

```bash
# Vérifier la connexion Neon
# La connection string doit avoir: ?sslmode=require à la fin

# Format correct:
# postgresql://user:password@host/database?sslmode=require
```

### Port 3000 déjà utilisé

```bash
# Changer le port:
pnpm dev -- -p 3001

# Ou tuer le processus:
lsof -ti:3000 | xargs kill -9
```

---

## 🧪 ÉTAPE 5 : Tester Alba

Une fois lancé, tester ces commandes avec Alba :

```
1. "Bonjour Alba, peux-tu te présenter ?"
2. "Que sais-tu sur Orchestra Intelligence ?"
3. "Qui est le client Wella ?" (si seed data exécuté)
```

---

## 📊 Checklist Finale

- [ ] ✅ `.env.local` créé avec AUTH_SECRET
- [ ] ✅ POSTGRES_URL (Neon) ajouté
- [ ] ✅ SUPABASE_URL et SERVICE_ROLE_KEY ajoutés
- [ ] ✅ Script SQL Supabase exécuté (tables créées)
- [ ] ✅ `pnpm db:migrate` exécuté sans erreurs
- [ ] ✅ `pnpm dev` lance le serveur
- [ ] ✅ http://localhost:3000 accessible
- [ ] ✅ Compte créé et connexion réussie
- [ ] ✅ Alba répond sur /alba

---

## 🎯 Secrets Générés pour Vous

```bash
# AUTH_SECRET
NltN5BNWSzCukIzNFxOb9jwIPTfHaskclcOlxcDrpMk=

# CRON_SECRET (pour plus tard, production)
3db3b1b4d3bbe9d8f062356731fdd8da08b37f7b304aa58342ef4a64bc11d7c0
```

---

## 📞 Besoin d'Aide ?

Si vous avez des erreurs :

1. **Vérifier les logs** : Dans le terminal où vous avez lancé `pnpm dev`
2. **Vérifier .env.local** : Toutes les variables REQUISES sont remplies ?
3. **Vérifier Supabase** : Les tables sont créées ?
4. **Vérifier Neon** : La connection string est correcte ?

---

**Status Actuel : 🟡 CONFIGURATION REQUISE**

Une fois les credentials ajoutés → 🟢 READY TO GO !

---

*Configuration générée le 6 Novembre 2025*
