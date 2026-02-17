#!/bin/bash

# Script de déploiement automatisé
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"

echo "🚀 Déploiement OVH Manager - Environnement: $ENVIRONMENT"
echo "================================================"

# Fonction de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction d'erreur
error_exit() {
    echo "❌ Erreur: $1" 1>&2
    exit 1
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    error_exit "Docker n'est pas installé"
fi

if ! command -v docker-compose &> /dev/null; then
    error_exit "Docker Compose n'est pas installé"
fi

# Vérifier que .env existe
if [ ! -f .env ]; then
    error_exit "Le fichier .env n'existe pas. Copiez .env.example et configurez-le."
fi

# Créer un backup
log "📦 Création d'un backup..."
mkdir -p "$BACKUP_DIR"

if [ -f schedules.json ]; then
    cp schedules.json "$BACKUP_DIR/"
    log "✅ Backup des planifications créé"
fi

# Arrêter les conteneurs existants
log "⏸️  Arrêt des conteneurs existants..."
docker-compose down || true

# Pull des dernières modifications (si git)
if [ -d .git ]; then
    log "📥 Récupération des dernières modifications..."
    git pull
fi

# Build des images
log "🔨 Build des images Docker..."
docker-compose build --no-cache

# Démarrer les conteneurs
log "▶️  Démarrage des conteneurs..."
docker-compose up -d

# Attendre que les services soient prêts
log "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier le health check
log "🏥 Vérification de la santé des services..."
for i in {1..10}; do
    if curl -f http://localhost:3001/health &> /dev/null; then
        log "✅ Backend opérationnel"
        break
    fi
    if [ $i -eq 10 ]; then
        error_exit "Le backend ne répond pas"
    fi
    sleep 3
done

for i in {1..10}; do
    if curl -f http://localhost &> /dev/null; then
        log "✅ Frontend opérationnel"
        break
    fi
    if [ $i -eq 10 ]; then
        error_exit "Le frontend ne répond pas"
    fi
    sleep 3
done

# Afficher les logs
log "📋 Derniers logs:"
docker-compose logs --tail=20

log "✅ Déploiement réussi!"
log "🌐 Frontend: http://localhost"
log "🔌 Backend: http://localhost:3001"
log "💾 Backup sauvegardé dans: $BACKUP_DIR"
