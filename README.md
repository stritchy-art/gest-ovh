# OVH Cloud Manager - Architecture Full-Stack Sécurisée

Application production-ready de gestion des instances OVH Cloud Public avec planification automatique, historique des actions et observabilité.

## 🔒 Sécurité

**Les credentials OVH sont gérés UNIQUEMENT côté serveur** via variables d'environnement ou Docker secrets. Le frontend ne manipule jamais les credentials.

## 📁 Structure du Projet

```
gest-ovh/
├── client/                    # Application React (Frontend)
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── services/          # Services frontend (API backend)
│   │   └── types/             # Types TypeScript
│   └── Dockerfile
│
├── server/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/            # Routes API REST
│   │   ├── services/          # Services backend (OVH, Redis, Logs)
│   │   ├── schedulers/        # Gestionnaires de cron
│   │   ├── config/            # Configuration env (credentials)
│   │   └── types/             # Types TypeScript
│   └── Dockerfile
│
├── docker-compose.yml         # Orchestration complète
├── .env.example               # Template variables d'environnement
└── DEPLOIEMENT.md             # Mode opératoire déploiement
```

## 🚀 Démarrage Rapide

### Configuration

Copier `.env.example` vers `.env` et remplir les credentials OVH:

```bash
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=votre_app_key
OVH_APP_SECRET=votre_app_secret
OVH_CONSUMER_KEY=votre_consumer_key
```

### Développement

```bash
# Installation
npm install

# Mode développement (client + server)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Métriques Prometheus**: http://localhost:3001/metrics

### Production (Docker)

```bash
# Build et démarrage
docker-compose up -d

# Logs
docker-compose logs -f
```

## ⚙️ Fonctionnalités

### 🎛️ Gestion des Instances
- ✅ Liste multi-projets et multi-régions
- ✅ Démarrage/Arrêt manuel
- ✅ Filtres avancés (recherche, statut, région)
- ✅ Tri et pagination
- ✅ Visualisation des logs

### ⏰ Planification Automatique
- ✅ Horaires de démarrage/arrêt configurables
- ✅ Scheduler cron côté backend (toutes les minutes)
- ✅ Stockage persistant Redis + fallback fichier
- ✅ Interface de configuration intuitive

### 📊 Observabilité
- ✅ Métriques Prometheus (actions, latences)
- ✅ Historique complet des actions (Redis + fichier)
- ✅ Notifications Slack + Email
- ✅ Logs structurés

### 🏗️ Architecture Production
- ✅ Docker multi-stage builds optimisés
- ✅ Docker Compose avec Redis
- ✅ Secrets management sécurisé
- ✅ Tests unitaires (Vitest) + e2e (Playwright)
- ✅ CI/CD GitHub Actions
- ✅ Scans sécurité (Trivy + Gitleaks)

### 🧪 Mode Test

Si les credentials OVH ne sont pas configurés, l'application bascule automatiquement en mode test avec données simulées.

## 📖 Documentation

- **[DEPLOIEMENT.md](DEPLOIEMENT.md)** - Guide de déploiement complet (local, VPS, cloud)
- **[scripts/README.md](scripts/README.md)** - Documentation des scripts de déploiement
