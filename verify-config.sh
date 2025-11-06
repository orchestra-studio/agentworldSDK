#!/bin/bash

# ============================================================================
# Script de Vérification Configuration - Agent World
# ============================================================================

echo "🔍 Vérification de la configuration Agent World..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
ERRORS=0
WARNINGS=0
SUCCESS=0

# Fonction de vérification
check_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.local 2>/dev/null | cut -d'=' -f2)

    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name : NON DÉFINI${NC}"
        ((ERRORS++))
        return 1
    elif [[ "$var_value" == *"****"* ]] || [[ "$var_value" == *"REMPLACER"* ]]; then
        echo -e "${YELLOW}⚠️  $var_name : PLACEHOLDER (à remplacer)${NC}"
        ((WARNINGS++))
        return 2
    else
        echo -e "${GREEN}✅ $var_name : OK${NC}"
        ((SUCCESS++))
        return 0
    fi
}

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Fichier .env.local introuvable !${NC}"
    echo ""
    echo "Créer le fichier avec :"
    echo "  cp .env.example .env.local"
    exit 1
fi

echo "📝 Vérification des variables REQUISES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Variables requises
check_var "AUTH_SECRET"
check_var "POSTGRES_URL"
check_var "SUPABASE_URL"
check_var "SUPABASE_SERVICE_ROLE_KEY"

echo ""
echo "📝 Vérification des variables OPTIONNELLES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Variables optionnelles
check_var "REDIS_URL" || true
check_var "BLOB_READ_WRITE_TOKEN" || true
check_var "MCP_SERVER_URL" || true
check_var "STAGEHAND_API_KEY" || true
check_var "CRON_SECRET" || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Configurées : $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  À remplacer : $WARNINGS${NC}"
echo -e "${RED}❌ Manquantes : $ERRORS${NC}"
echo ""

# Vérifier node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules : Installé${NC}"
else
    echo -e "${RED}❌ node_modules : Non installé${NC}"
    echo "   Lancer : pnpm install"
    ((ERRORS++))
fi

# Vérifier pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✅ pnpm : v$PNPM_VERSION${NC}"
else
    echo -e "${RED}❌ pnpm : Non installé${NC}"
    echo "   Installer : npm i -g pnpm"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Résultat final
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Configuration INCOMPLÈTE${NC}"
    echo ""
    echo "📖 Consulter : CONFIGURATION_RAPIDE.md"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Configuration PARTIELLE${NC}"
    echo ""
    echo "⚡ Actions requises :"
    echo "   1. Remplacer les placeholders dans .env.local"
    echo "   2. Consulter : CONFIGURATION_RAPIDE.md"
    exit 2
else
    echo -e "${GREEN}✅ Configuration COMPLÈTE !${NC}"
    echo ""
    echo "🚀 Prêt à lancer :"
    echo "   pnpm db:migrate  # Si première fois"
    echo "   pnpm dev"
    exit 0
fi
