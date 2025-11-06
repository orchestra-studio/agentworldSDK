#!/usr/bin/env node

/**
 * Script pour configurer les variables d'environnement Vercel
 * depuis un fichier .env.vercel.local
 * 
 * Usage: node scripts/setup-vercel-env.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(process.cwd(), '.env.vercel.local');
const TEMPLATE_FILE = path.join(process.cwd(), 'vercel-env-template.txt');

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    log(`❌ Fichier ${ENV_FILE} non trouvé`, 'red');
    log(`📝 Créez-le à partir de ${TEMPLATE_FILE}`, 'yellow');
    process.exit(1);
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const envVars = {};

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value) {
          envVars[key.trim()] = value;
        }
      }
    }
  }

  return envVars;
}

function checkRequiredVars(envVars) {
  const required = [
    'AUTH_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'POSTGRES_URL',
    'CRON_SECRET',
  ];

  const missing = required.filter(key => !envVars[key]);

  if (missing.length > 0) {
    log(`❌ Variables manquantes: ${missing.join(', ')}`, 'red');
    process.exit(1);
  }

  log('✅ Toutes les variables obligatoires sont présentes', 'green');
}

function setVercelEnvForEnvironment(key, value, env) {
  return new Promise((resolve, reject) => {
    // Essayer de supprimer d'abord (ignore les erreurs si n'existe pas)
    try {
      execSync(`vercel env rm ${key} ${env} --yes`, { stdio: 'ignore' });
    } catch {
      // Ignore
    }

    // Ajouter la variable en utilisant spawn pour passer la valeur via stdin
    const proc = spawn('vercel', ['env', 'add', key, env], {
      stdio: ['pipe', 'inherit', 'inherit'],
    });

    proc.stdin.write(value);
    proc.stdin.end();

    proc.on('close', (code) => {
      if (code === 0) {
        log(`  ✓ ${key} → ${env}`, 'green');
        resolve();
      } else {
        log(`  ✗ ${key} → ${env} (code: ${code})`, 'red');
        resolve(); // Continue même en cas d'erreur
      }
    });

    proc.on('error', (error) => {
      log(`  ✗ ${key} → ${env} (erreur: ${error.message})`, 'red');
      resolve(); // Continue même en cas d'erreur
    });
  });
}

async function setVercelEnv(key, value, environments) {
  for (const env of environments) {
    await setVercelEnvForEnvironment(key, value, env);
  }
}

async function main() {
  log('🚀 Configuration des variables d\'environnement Vercel', 'green');
  console.log('');

  // Vérifier Vercel CLI
  if (!checkVercelCLI()) {
    log('❌ Vercel CLI n\'est pas installé', 'red');
    log('Installez-le avec: npm i -g vercel', 'yellow');
    process.exit(1);
  }

  // Charger les variables
  log('📋 Chargement des variables d\'environnement...', 'green');
  const envVars = loadEnvFile();
  checkRequiredVars(envVars);

  console.log('');

  // Configurer les variables obligatoires
  log('⚙️  Configuration des variables obligatoires...', 'green');
  const allEnvs = ['production', 'preview', 'development'];

  await setVercelEnv('AUTH_SECRET', envVars.AUTH_SECRET, allEnvs);
  await setVercelEnv('SUPABASE_URL', envVars.SUPABASE_URL, allEnvs);
  await setVercelEnv('SUPABASE_SERVICE_ROLE_KEY', envVars.SUPABASE_SERVICE_ROLE_KEY, allEnvs);
  await setVercelEnv('POSTGRES_URL', envVars.POSTGRES_URL, allEnvs);
  await setVercelEnv('CRON_SECRET', envVars.CRON_SECRET, allEnvs);

  // Variables optionnelles
  const optionalVars = {
    MCP_SERVER_URL: ['production', 'preview'],
    MCP_API_KEY: ['production', 'preview'],
    STAGEHAND_API_KEY: ['production', 'preview'],
    STAGEHAND_API_URL: ['production', 'preview'],
  };

  log('⚙️  Configuration des variables optionnelles...', 'green');
  for (const [key, envs] of Object.entries(optionalVars)) {
    if (envVars[key]) {
      await setVercelEnv(key, envVars[key], envs);
    }
  }

  // Feature flags
  const featureFlags = [
    'FEATURE_LEAD_RESEARCH',
    'FEATURE_BROWSER_OUTREACH',
    'FEATURE_CRM_SYNC',
    'FEATURE_MEMORY_ACCESS',
    'FEATURE_INSTAGRAM_AUTOMATION',
  ];

  log('⚙️  Configuration des feature flags...', 'green');
  for (const flag of featureFlags) {
    const value = envVars[flag] || 'true';
    await setVercelEnv(flag, value, allEnvs);
  }

  console.log('');
  log('✅ Configuration terminée !', 'green');
  log('💡 Exécutez "vercel --prod" pour déployer en production', 'yellow');
}

main().catch(error => {
  log(`❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});

