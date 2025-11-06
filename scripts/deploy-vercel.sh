#!/bin/bash

# Script de déploiement Vercel avec configuration des variables d'environnement
# Usage: ./scripts/deploy-vercel.sh [--prod]

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Déploiement Vercel - Agent World${NC}"
echo ""

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI n'est pas installé${NC}"
    echo "Installez-le avec: npm i -g vercel"
    exit 1
fi

# Vérifier si le fichier .env.vercel.local existe
ENV_FILE=".env.vercel.local"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Fichier $ENV_FILE non trouvé${NC}"
    echo "Créez-le à partir de vercel-env-template.txt et remplissez les valeurs"
    exit 1
fi

# Charger les variables d'environnement
echo -e "${GREEN}📋 Chargement des variables d'environnement...${NC}"
source "$ENV_FILE"

# Vérifier les variables obligatoires
MISSING_VARS=()

if [ -z "$AUTH_SECRET" ]; then
    MISSING_VARS+=("AUTH_SECRET")
fi

if [ -z "$SUPABASE_URL" ]; then
    MISSING_VARS+=("SUPABASE_URL")
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    MISSING_VARS+=("SUPABASE_SERVICE_ROLE_KEY")
fi

if [ -z "$POSTGRES_URL" ]; then
    MISSING_VARS+=("POSTGRES_URL")
fi

if [ -z "$CRON_SECRET" ]; then
    MISSING_VARS+=("CRON_SECRET")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Variables manquantes dans $ENV_FILE:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo -e "${GREEN}✅ Toutes les variables obligatoires sont présentes${NC}"
echo ""

# Vérifier si le projet est lié à Vercel
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}⚠️  Projet non lié à Vercel${NC}"
    echo "Liaison du projet..."
    vercel link
fi

# Configurer les variables d'environnement dans Vercel
echo -e "${GREEN}⚙️  Configuration des variables d'environnement dans Vercel...${NC}"

# Variables obligatoires pour Production, Preview et Development
ENV_TYPES="production preview development"

for env_type in $ENV_TYPES; do
    echo "  → Configuration pour $env_type..."
    
    vercel env add AUTH_SECRET "$env_type" <<< "$AUTH_SECRET" 2>/dev/null || \
    vercel env rm AUTH_SECRET "$env_type" --yes 2>/dev/null; \
    echo "$AUTH_SECRET" | vercel env add AUTH_SECRET "$env_type"
    
    vercel env add SUPABASE_URL "$env_type" <<< "$SUPABASE_URL" 2>/dev/null || \
    vercel env rm SUPABASE_URL "$env_type" --yes 2>/dev/null; \
    echo "$SUPABASE_URL" | vercel env add SUPABASE_URL "$env_type"
    
    vercel env add SUPABASE_SERVICE_ROLE_KEY "$env_type" <<< "$SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null || \
    vercel env rm SUPABASE_SERVICE_ROLE_KEY "$env_type" --yes 2>/dev/null; \
    echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY "$env_type"
    
    vercel env add POSTGRES_URL "$env_type" <<< "$POSTGRES_URL" 2>/dev/null || \
    vercel env rm POSTGRES_URL "$env_type" --yes 2>/dev/null; \
    echo "$POSTGRES_URL" | vercel env add POSTGRES_URL "$env_type"
    
    vercel env add CRON_SECRET "$env_type" <<< "$CRON_SECRET" 2>/dev/null || \
    vercel env rm CRON_SECRET "$env_type" --yes 2>/dev/null; \
    echo "$CRON_SECRET" | vercel env add CRON_SECRET "$env_type"
done

# Variables optionnelles (seulement si définies)
if [ ! -z "$MCP_SERVER_URL" ]; then
    for env_type in production preview; do
        echo "$MCP_SERVER_URL" | vercel env add MCP_SERVER_URL "$env_type" 2>/dev/null || true
    done
fi

if [ ! -z "$MCP_API_KEY" ]; then
    for env_type in production preview; do
        echo "$MCP_API_KEY" | vercel env add MCP_API_KEY "$env_type" 2>/dev/null || true
    done
fi

if [ ! -z "$STAGEHAND_API_KEY" ]; then
    for env_type in production preview; do
        echo "$STAGEHAND_API_KEY" | vercel env add STAGEHAND_API_KEY "$env_type" 2>/dev/null || true
    done
fi

if [ ! -z "$STAGEHAND_API_URL" ]; then
    for env_type in production preview; do
        echo "$STAGEHAND_API_URL" | vercel env add STAGEHAND_API_URL "$env_type" 2>/dev/null || true
    done
fi

# Feature flags
for env_type in $ENV_TYPES; do
    echo "$FEATURE_LEAD_RESEARCH" | vercel env add FEATURE_LEAD_RESEARCH "$env_type" 2>/dev/null || true
    echo "$FEATURE_BROWSER_OUTREACH" | vercel env add FEATURE_BROWSER_OUTREACH "$env_type" 2>/dev/null || true
    echo "$FEATURE_CRM_SYNC" | vercel env add FEATURE_CRM_SYNC "$env_type" 2>/dev/null || true
    echo "$FEATURE_MEMORY_ACCESS" | vercel env add FEATURE_MEMORY_ACCESS "$env_type" 2>/dev/null || true
    echo "$FEATURE_INSTAGRAM_AUTOMATION" | vercel env add FEATURE_INSTAGRAM_AUTOMATION "$env_type" 2>/dev/null || true
done

echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"
echo ""

# Déployer
if [ "$1" == "--prod" ]; then
    echo -e "${GREEN}🚀 Déploiement en production...${NC}"
    vercel --prod
else
    echo -e "${GREEN}🚀 Déploiement en preview...${NC}"
    vercel
fi

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"

