# MODE OPÉRATOIRE - Déploiement OVH Cloud Manager

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Préparation](#préparation)
3. [Déploiement Local (Docker)](#déploiement-local-docker)
4. [Déploiement Production (VPS/Serveur)](#déploiement-production-vpsserveur)
5. [Déploiement Cloud (AWS/Azure/OVH)](#déploiement-cloud)
6. [Configuration Post-Déploiement](#configuration-post-déploiement)
7. [Maintenance et Monitoring](#maintenance-et-monitoring)
8. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Environnement de développement
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** >= 20.10
- **Docker Compose** >= 2.0

### Identifiants OVH
1. Créer une application sur https://api.ovh.com/createToken/
2. Récupérer :
   - Application Key
   - Application Secret
   - Consumer Key
3. Droits nécessaires :
   - GET `/cloud/project/*`
   - POST `/cloud/project/*/instance/*/start`
   - POST `/cloud/project/*/instance/*/stop`

---

## 📦 Préparation

### 1. Cloner et configurer le projet

```bash
# Cloner le repository
git clone https://github.com/votre-repo/gest-ovh.git
cd gest-ovh

# Installer les dépendances
npm install
```

### 2. Configuration des variables d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier .env
nano .env
```

**Contenu du fichier `.env` :**
```env
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=votre_app_key
OVH_APP_SECRET=votre_app_secret
OVH_CONSUMER_KEY=votre_consumer_key
CLIENT_PORT=80
SERVER_PORT=3001
```

### 3. Tester en local (sans Docker)

```bash
# Mode développement
npm run dev

# Vérifier :
# - Frontend : http://localhost:5173
# - Backend : http://localhost:3001
# - Health check : http://localhost:3001/health
```

---

## 🐳 Déploiement Local (Docker)

### 1. Build des images

```bash
# Build toutes les images
docker-compose build

# Ou build individuellement
docker-compose build client
docker-compose build server
```

### 2. Démarrer les conteneurs

```bash
# Démarrer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f server
```

### 3. Vérifier le déploiement

```bash
# Vérifier que les conteneurs tournent
docker-compose ps

# Vérifier la santé
docker-compose ps
# STATUS doit afficher "healthy"

# Tester l'application
curl http://localhost
curl http://localhost:3001/health
```

### 4. Accéder à l'application

- **Frontend** : http://localhost
- **API Backend** : http://localhost:3001

### 5. Arrêter les conteneurs

```bash
# Arrêter
docker-compose stop

# Arrêter et supprimer
docker-compose down

# Arrêter et supprimer avec volumes
docker-compose down -v
```

---

## 🌐 Déploiement Production (VPS/Serveur)

### Option 1 : VPS OVH Cloud

#### 1. Créer une instance OVH

```bash
# Via l'interface OVH ou API
# Recommandations :
# - Image : Ubuntu 22.04 LTS
# - Flavor : d2-4 minimum (2 vCPU, 4GB RAM)
# - Région : Proche de vos utilisateurs
```

#### 2. Connexion SSH et préparation

```bash
# Connexion SSH
ssh ubuntu@votre-ip

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier
docker --version
docker-compose --version
```

#### 3. Déployer l'application

```bash
# Créer le répertoire
mkdir -p /opt/ovh-manager
cd /opt/ovh-manager

# Transférer les fichiers (depuis votre machine locale)
scp -r * ubuntu@votre-ip:/opt/ovh-manager/

# Ou cloner depuis Git
git clone https://github.com/votre-repo/gest-ovh.git .

# Configurer .env
nano .env

# Démarrer
docker-compose up -d

# Vérifier
docker-compose logs -f
```

#### 4. Configuration du pare-feu

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (si SSL)
sudo ufw enable
```

#### 5. Configuration SSL (Recommandé)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat (remplacer votre-domaine.com)
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

**Modifier `client/nginx.conf` pour HTTPS :**
```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # ... reste de la config
}

# Redirection HTTP -> HTTPS
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}
```

---

## ☁️ Déploiement Cloud

### Option AWS (EC2 + ECS)

#### 1. Création d'une instance EC2

```bash
# Via AWS Console
# - Type : t3.medium
# - AMI : Amazon Linux 2
# - Security Group : Ports 22, 80, 443, 3001
```

#### 2. Même procédure que VPS OVH

Suivre les étapes de la section VPS ci-dessus.

### Option Docker Hub + Déploiement automatisé

#### 1. Publier les images

```bash
# Login Docker Hub
docker login

# Tag des images
docker tag ovh-manager-client:latest votre-username/ovh-manager-client:latest
docker tag ovh-manager-server:latest votre-username/ovh-manager-server:latest

# Push
docker push votre-username/ovh-manager-client:latest
docker push votre-username/ovh-manager-server:latest
```

#### 2. Modifier docker-compose.yml

```yaml
services:
  server:
    image: votre-username/ovh-manager-server:latest
    # ... reste config

  client:
    image: votre-username/ovh-manager-client:latest
    # ... reste config
```

---

## ⚙️ Configuration Post-Déploiement

### 1. Variables d'environnement serveur

Créer `/opt/ovh-manager/.env` avec vos vrais identifiants :

```env
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=votre_vraie_app_key
OVH_APP_SECRET=votre_vrai_app_secret
OVH_CONSUMER_KEY=votre_vraie_consumer_key
```

### 2. Persistance des planifications

Le fichier `schedules.json` est automatiquement monté comme volume.

Pour backup manuel :
```bash
docker cp ovh-manager-server:/app/schedules.json ./backup-schedules.json
```

### 3. Configuration Nginx avancée

**Rate limiting** (dans `client/nginx.conf`) :
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20 nodelay;
    # ... reste config
}
```

---

## 📊 Maintenance et Monitoring

### Logs

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service
docker-compose logs -f server

# Dernières 100 lignes
docker-compose logs --tail=100

# Exporter les logs
docker-compose logs > logs-$(date +%Y%m%d).txt
```

### Health Checks

```bash
# Vérifier la santé
docker-compose ps

# Tester manuellement
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2026-02-17T..."}
```

### Mises à jour

```bash
# Arrêter l'application
docker-compose down

# Récupérer les dernières modifications
git pull

# Rebuild
docker-compose build

# Redémarrer
docker-compose up -d
```

### Monitoring avec Grafana (Optionnel)

```bash
# Ajouter au docker-compose.yml
prometheus:
  image: prom/prometheus
  # ... config

grafana:
  image: grafana/grafana
  # ... config
```

### Backup automatique

**Script de backup** (`/opt/ovh-manager/backup.sh`) :
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/ovh-manager"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup schedules
docker cp ovh-manager-server:/app/schedules.json $BACKUP_DIR/schedules-$DATE.json

# Backup logs
docker-compose logs > $BACKUP_DIR/logs-$DATE.txt

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Cron job** :
```bash
# Éditer crontab
crontab -e

# Backup quotidien à 2h du matin
0 2 * * * /opt/ovh-manager/backup.sh
```

---

## 🔥 Dépannage

### Problème : Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier les ressources
docker stats

# Recréer les conteneurs
docker-compose down
docker-compose up -d --force-recreate
```

### Problème : Erreur de connexion à l'API OVH

```bash
# Vérifier les variables d'environnement
docker-compose exec server printenv | grep OVH

# Tester l'API manuellement
docker-compose exec server sh
curl -X GET "https://eu.api.ovh.com/1.0/cloud/project"
```

### Problème : Le frontend ne peut pas joindre le backend

```bash
# Vérifier le réseau Docker
docker network inspect gest-ovh_ovh-network

# Vérifier la config nginx
docker-compose exec client cat /etc/nginx/conf.d/default.conf

# Recharger nginx
docker-compose exec client nginx -s reload
```

### Problème : Le scheduler ne fonctionne pas

```bash
# Vérifier les logs du serveur
docker-compose logs -f server | grep "Cron"

# Vérifier le fichier schedules.json
docker-compose exec server cat schedules.json

# Redémarrer le serveur
docker-compose restart server
```

### Problème : Manque de mémoire

```bash
# Augmenter les limites dans docker-compose.yml
services:
  server:
    mem_limit: 512m
    mem_reservation: 256m
```

---

## 📝 Checklist de déploiement

- [ ] Identifiants OVH configurés dans `.env`
- [ ] Fichier `.env` **non** commité dans Git
- [ ] Docker et Docker Compose installés
- [ ] Images buildées avec succès
- [ ] Conteneurs démarrés (status: healthy)
- [ ] Frontend accessible sur port 80
- [ ] Backend accessible sur port 3001
- [ ] Health check répond OK
- [ ] SSL configuré (production)
- [ ] Pare-feu configuré
- [ ] Backup planifié
- [ ] Logs configurés
- [ ] Monitoring en place (optionnel)

---

## 🔗 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation OVH API](https://api.ovh.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs`
2. Consulter la section Dépannage
3. Vérifier le health check
4. Ouvrir une issue GitHub

---

**Version** : 1.0.0  
**Dernière mise à jour** : 17 février 2026
