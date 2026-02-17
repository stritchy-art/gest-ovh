#!/bin/bash

# Script de rollback
# Usage: ./scripts/rollback.sh [backup-timestamp]
# Example: ./scripts/rollback.sh 20260217_140000

set -e

BACKUP_DIR="/opt/backups/ovh-manager"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "📦 Backups disponibles:"
    ls -lh "$BACKUP_DIR"/backup-*.tar.gz | tail -10
    echo ""
    echo "Usage: ./scripts/rollback.sh [timestamp]"
    echo "Example: ./scripts/rollback.sh 20260217_140000"
    exit 1
fi

BACKUP_PATH="$BACKUP_DIR/backup-$BACKUP_FILE.tar.gz"

if [ ! -f "$BACKUP_PATH" ]; then
    echo "❌ Backup non trouvé: $BACKUP_PATH"
    exit 1
fi

echo "🔄 Rollback vers le backup: $BACKUP_FILE"
echo "========================================"

# Arrêter les conteneurs
echo "⏸️  Arrêt des conteneurs..."
docker-compose down

# Extraire le backup
echo "📂 Extraction du backup..."
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_PATH" -C "$TEMP_DIR"

# Restaurer schedules.json
if [ -f "$TEMP_DIR/schedules-$BACKUP_FILE.json" ]; then
    echo "💾 Restauration des planifications..."
    cp "$TEMP_DIR/schedules-$BACKUP_FILE.json" ./schedules.json
fi

# Redémarrer
echo "▶️  Redémarrage des conteneurs..."
docker-compose up -d

# Nettoyage
rm -rf "$TEMP_DIR"

echo "✅ Rollback terminé!"
docker-compose ps
