#!/bin/bash

# Script de backup automatique
# À exécuter via cron: 0 2 * * * /opt/ovh-manager/scripts/backup.sh

set -e

BACKUP_DIR="/opt/backups/ovh-manager"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Backup OVH Manager - $(date)"
echo "================================"

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"

# Backup schedules.json
if docker ps | grep -q ovh-manager-server; then
    echo "💾 Backup des planifications..."
    docker cp ovh-manager-server:/app/schedules.json "$BACKUP_DIR/schedules-$TIMESTAMP.json" 2>/dev/null || \
        echo "⚠️  Pas de fichier schedules.json à sauvegarder"
fi

# Backup des logs
echo "📋 Backup des logs..."
docker-compose logs > "$BACKUP_DIR/logs-$TIMESTAMP.txt" 2>/dev/null || \
    echo "⚠️  Impossible de récupérer les logs"

# Backup de la configuration
echo "⚙️  Backup de la configuration..."
cp .env "$BACKUP_DIR/env-$TIMESTAMP.txt" 2>/dev/null || \
    echo "⚠️  Pas de fichier .env à sauvegarder"

# Compression
echo "🗜️  Compression du backup..."
cd "$BACKUP_DIR"
tar -czf "backup-$TIMESTAMP.tar.gz" *-$TIMESTAMP.* 2>/dev/null || true
rm -f *-$TIMESTAMP.txt *-$TIMESTAMP.json 2>/dev/null || true

# Nettoyage des anciens backups
echo "🧹 Nettoyage des backups de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Backup terminé: $BACKUP_DIR/backup-$TIMESTAMP.tar.gz"
echo "📊 Backups disponibles:"
ls -lh "$BACKUP_DIR"/backup-*.tar.gz | tail -5
