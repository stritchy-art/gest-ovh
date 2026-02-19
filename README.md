# OVH Cloud Manager

> 🚀 Application production-ready de gestion des instances OVH Cloud Public avec planification automatique, historique des actions et observabilité Prometheus.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API](#-api)
- [Déploiement](#-déploiement)
- [Tests](#-tests)
- [Sécurité](#-sécurité)
- [Documentation](#-documentation)

## 🎯 Aperçu

OVH Cloud Manager est une application full-stack TypeScript permettant de gérer facilement vos instances OVH Cloud Public. Elle offre une interface web moderne avec un backend sécurisé pour orchestrer vos ressources cloud.

### Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────┐
│  React Client   │─────▶│  Express API     │─────▶│  OVH API    │
│  (Frontend)     │◀─────│  (Backend)       │◀─────│  (Cloud)    │
└─────────────────┘      └──────────────────┘      └─────────────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                    ┌────▼─────┐    ┌─────▼──────┐
                    │  Redis   │    │ Prometheus │
                    │ (Cache)  │    │ (Metrics)  │
                    └──────────┘    └────────────┘
```

### 🔒 Sécurité First

**Les credentials OVH sont EXCLUSIVEMENT gérés côté serveur** via variables d'environnement ou Docker secrets. Le frontend ne manipule jamais les credentials.

## 🏛️ Architecture

### Structure du Projet

```
gest-ovh/
├── client/                          # Application React (Frontend)
│   ├── src/
│   │   ├── components/              # Composants React réutilisables
│   │   │   ├── ActionLogs.tsx       # Modal historique actions
│   │   │   ├── InstanceDetails.tsx  # Détails instance
│   │   │   ├── InstanceFilters.tsx  # Filtres recherche
│   │   │   ├── InstanceList.tsx     # Liste instances principale
│   │   │   ├── InstanceSchedule.tsx # Configuration planification
│   │   │   ├── Pagination.tsx       # Pagination atomique
│   │   │   └── ProjectSelector.tsx  # Sélecteur projets
│   │   ├── hooks/                   # Custom hooks React
│   │   │   ├── useInstances.ts      # Gestion état instances
│   │   │   └── useProjects.ts       # Gestion état projets
│   │   ├── services/
│   │   │   └── ovhService.ts        # Client API backend
│   │   ├── types/                   # Types TypeScript
│   │   │   └── index.ts             # Interfaces métier
│   │   ├── utils/
│   │   │   ├── constants.ts         # Constantes application
│   │   │   └── formatting.ts        # Utilitaires formatage
│   │   ├── App.tsx                  # Composant racine
│   │   └── main.tsx                 # Point d'entrée
│   ├── vitest.config.ts             # Config tests frontend
│   ├── Dockerfile                   # Image Docker client
│   └── package.json
│
├── server/                          # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/                  # Routes API REST
│   │   │   ├── instances.ts         # Endpoints instances (list, start, stop, logs)
│   │   │   ├── projects.ts          # Endpoints projets OVH
│   │   │   ├── schedules.ts         # Endpoints planifications
│   │   │   └── actions.ts           # Endpoint historique actions
│   │   ├── services/                # Logique métier
│   │   │   ├── ovhService.ts        # Client API OVH
│   │   │   ├── redisClient.ts       # Connexion Redis
│   │   │   ├── scheduleService.ts   # Gestion planifications
│   │   │   ├── actionLogService.ts  # Gestion logs actions
│   │   │   ├── metricsService.ts    # Métriques Prometheus
│   │   │   ├── notificationService.ts # Notifications Slack/Email
│   │   │   ├── logger.ts            # Logger structuré
│   │   │   └── mockService.ts       # Données test
│   │   ├── schedulers/
│   │   │   └── cronScheduler.ts     # Scheduler automatique
│   │   ├── config/
│   │   │   └── env.ts               # Configuration environnement
│   │   ├── types/
│   │   │   └── index.ts             # Types backend
│   │   └── server.ts                # Point d'entrée Express
│   ├── vitest.config.ts             # Config tests backend
│   ├── Dockerfile                   # Image Docker serveur
│   └── package.json
│
├── e2e/                             # Tests end-to-end Playwright
│   └── instance-management.spec.ts
├── docker-compose.yml               # Orchestration Docker
├── .env.example                     # Template variables environnement
├── .github/
│   └── workflows/
│       └── ci.yml                   # Pipeline CI/CD
├── DEPLOIEMENT.md                   # Guide déploiement détaillé
├── TESTS.md                         # Documentation tests
└── README.md                        # Ce fichier
```

### Stack Technique

#### Frontend
- **React 18** - Framework UI
- **TypeScript 5** - Typage statique
- **Vite 5** - Build tool ultra-rapide
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Icônes
- **Vitest** - Framework de tests

#### Backend
- **Node.js 20** - Runtime JavaScript
- **Express 4** - Framework web
- **TypeScript 5** - Typage statique
- **OVH API** - SDK officiel OVH
- **Redis** - Cache et persistance
- **prom-client** - Métriques Prometheus
- **Vitest** - Tests unitaires
- **Supertest** - Tests API

#### DevOps
- **Docker & Docker Compose** - Conteneurisation
- **GitHub Actions** - CI/CD
- **Playwright** - Tests E2E
- **Trivy** - Scan vulnérabilités
- **Gitleaks** - Détection secrets

## � Configuration

### Variables d'environnement

#### Credentials OVH (OBLIGATOIRE pour production)

Créez une application OVH sur [api.ovh.com/createApp](https://api.ovh.com/createApp/) :

```env
OVH_ENDPOINT=ovh-eu          # ovh-eu, ovh-ca, ovh-us, etc.
OVH_APP_KEY=xxxxxxxxxx       # Application Key
OVH_APP_SECRET=yyyyyyyyy     # Application Secret
OVH_CONSUMER_KEY=zzzzzzzz    # Consumer Key
```

#### Redis (optionnel)

Si absent, fallback automatique sur fichier JSON local.

```env
REDIS_URL=redis://localhost:6379
# ou pour Redis distant avec authentification
REDIS_URL=redis://:password@host:6379
```

#### Notifications (optionnel)

**Slack**
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

**Email (SMTP)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=mot_de_passe_application
MAIL_FROM=ovh-manager@example.com
MAIL_TO=admin@example.com
```

#### Configuration avancée

```env
# Nombre d'actions conservées dans l'historique
ACTION_LOG_RETENTION=500

# Niveau de logs (error, warn, info, debug)
LOG_LEVEL=info

# Port serveur (défaut: 3001)
PORT=3001

# Port client dev (défaut: 5173)
VITE_PORT=5173
```

### Mode Test

Si `OVH_APP_KEY`, `OVH_APP_SECRET` ou `OVH_CONSUMER_KEY` sont manquants, l'application démarre automatiquement en **mode test** avec données simulées :

- ✅ 3 instances fictives
- ✅ Logs simulés
- ✅ Opérations start/stop sans appels réels
- ⚠️ Badge visible dans l'interface

Parfait pour développement et démonstrations !

---

## 💻 Utilisation

### Interface Web

1. **Sélection du projet**
   - Dropdown en haut de la page
   - Chargement automatique des instances

2. **Liste des instances**
   - Tableau avec informations détaillées
   - Badges colorés pour le statut
   - Actions rapides (start/stop/logs/planification)

3. **Filtres et recherche**
   - Recherche par nom d'instance
   - Filtrage par statut (All, Active, Inactive, Stopped)
   - Filtrage par région
   - Tri par colonnes (nom, statut, région, RAM, CPU)

4. **Pagination**
   - Navigation par page
   - Sélection nombre d'éléments (10, 25, 50, 100)

5. **Planification**
   - Clic sur icône horloge
   - Configuration heure start/stop
   - Activation/désactivation
   - Sauvegarde automatique

6. **Historique des actions**
   - Bouton "Historique" dans la navbar
   - Vue complète des 200-500 dernières actions
   - Filtres par type, statut, mode
   - Actualisation temps réel

### Ligne de commande (API)

Exemples avec `curl` :

```bash
# Lister les projets
curl http://localhost:3001/api/projects

# Lister les instances d'un projet
curl -X POST http://localhost:3001/api/instances/list \
  -H "Content-Type: application/json" \
  -d '{"projectId":"abc123"}'

# Démarrer une instance
curl -X POST http://localhost:3001/api/instances/start \
  -H "Content-Type: application/json" \
  -d '{"projectId":"abc123","instanceId":"inst-456"}'

# Arrêter une instance
curl -X POST http://localhost:3001/api/instances/stop \
  -H "Content-Type: application/json" \
  -d '{"projectId":"abc123","instanceId":"inst-456"}'

# Récupérer les planifications
curl http://localhost:3001/api/schedules

# Historique des actions (100 dernières)
curl http://localhost:3001/api/actions?limit=100

# Métriques Prometheus
curl http://localhost:3001/metrics
```

### Intégration Prometheus

Ajouter dans `prometheus.yml` :

```yaml
scrape_configs:
  - job_name: 'ovh-manager'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

**Métriques disponibles :**
- `ovh_manager_actions_total` - Compteur d'actions
- `ovh_manager_api_request_duration_seconds` - Latences API
- Métriques Node.js standard (mémoire, CPU, event loop, GC)

### Intégration Grafana

Importez le dashboard JSON fourni ou créez vos propres visualisations :

**Requêtes PromQL utiles :**
```promql
# Nombre total d'actions dans les 24h
sum(increase(ovh_manager_actions_total[24h]))

# Taux de succès des actions
sum(ovh_manager_actions_total{status="success"}) / sum(ovh_manager_actions_total) * 100

# Latence P95 des requêtes API
histogram_quantile(0.95, rate(ovh_manager_api_request_duration_seconds_bucket[5m]))

# Actions automatiques vs manuelles
sum by (mode) (ovh_manager_actions_total)
```

---

## 📡 API

Documentation complète dans [API.md](API.md).

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/health` | Santé du serveur |
| `GET` | `/api/status` | Statut application |
| `GET` | `/metrics` | Métriques Prometheus |
| `GET` | `/api/projects` | Liste projets OVH |
| `POST` | `/api/instances/list` | Liste instances projet |
| `POST` | `/api/instances/start` | Démarrer instance |
| `POST` | `/api/instances/stop` | Arrêter instance |
| `POST` | `/api/instances/logs` | Logs instance |
| `GET` | `/api/schedules` | Liste planifications |
| `POST` | `/api/schedules` | Créer/modifier planification |
| `DELETE` | `/api/schedules/:id` | Supprimer planification |
| `GET` | `/api/actions` | Historique actions |

Voir [API.md](API.md) pour exemples de requêtes/réponses détaillés.

---

## 🚢 Déploiement

Documentation complète dans [DEPLOIEMENT.md](DEPLOIEMENT.md).

### Docker Compose (recommandé)

```bash
# Build et démarrage
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Arrêter et supprimer volumes
docker-compose down -v
```

**Services démarrés :**
- `app` - Application principale (frontend + backend)
- `redis` - Cache et persistance

**Ports exposés :**
- `3001` - API backend + frontend
- `6379` - Redis (optionnel, interne uniquement)

### Docker manuel

```bash
# Backend
cd server
docker build -t ovh-manager-server .
docker run -d -p 3001:3001 \
  -e OVH_APP_KEY=xxx \
  -e OVH_APP_SECRET=yyy \
  -e OVH_CONSUMER_KEY=zzz \
  ovh-manager-server

# Frontend (optionnel si build static)
cd client
docker build -t ovh-manager-client .
docker run -d -p 5173:80 ovh-manager-client
```

### VPS / Serveur dédié

```bash
# Installation Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone et installation
git clone https://github.com/votre-org/gest-ovh.git
cd gest-ovh
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Configuration
cp .env.example .env
nano .env  # Éditer credentials

# Build
cd client && npm run build && cd ..
cd server && npm run build && cd ..

# Démarrage avec PM2
npm install -g pm2
pm2 start server/dist/server.js --name ovh-manager
pm2 startup
pm2 save
```

### Kubernetes

Manifests fournis dans `k8s/` :

```bash
# Créer namespace
kubectl create namespace ovh-manager

# Créer secret avec credentials
kubectl create secret generic ovh-credentials \
  --from-literal=app-key=xxx \
  --from-literal=app-secret=yyy \
  --from-literal=consumer-key=zzz \
  -n ovh-manager

# Déployer
kubectl apply -f k8s/ -n ovh-manager

# Vérifier
kubectl get pods -n ovh-manager
kubectl logs -f deployment/ovh-manager -n ovh-manager
```

---

## 🧪 Tests

Documentation complète dans [TESTS.md](TESTS.md).

### Tests unitaires

```bash
# Frontend
cd client
npm test              # Exécution
npm run test:coverage # Avec coverage

# Backend
cd server
npm test              # Exécution
npm run test:coverage # Avec coverage
```

**Coverage actuel :**
- Frontend : 30.9% (18 tests)
- Backend : Tests OK (14 tests)

### Tests E2E

```bash
# Installation Playwright
npm install

# Exécution
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Génération rapport
npm run test:e2e:report
```

### Tests manuels

```bash
# Démarrer en mode test (sans credentials)
cd server
npm run dev

# Tester endpoints
curl http://localhost:3001/api/status
# {"testMode":true,"redisAvailable":true,"ovhConfigured":false}
```

---

## 🔐 Sécurité

### Bonnes pratiques implémentées

✅ **Credentials côté serveur uniquement**
- Variables d'environnement
- Docker secrets support
- Jamais exposés au frontend

✅ **Scans automatiques**
- Trivy (vulnérabilités containers)
- Gitleaks (détection secrets)
- GitHub Dependabot (dépendances)

✅ **Docker**
- Multi-stage builds
- Images Alpine légères
- Non-root user
- .dockerignore complet

✅ **Logs**
- Pas de données sensibles
- Structured logging (JSON)
- Niveaux configurables

### Recommandations production

⚠️ À ajouter pour production :

1. **Authentification API**
   - JWT ou API keys
   - Rate limiting
   - CORS configuré

2. **HTTPS**
   - Certificats SSL/TLS
   - Reverse proxy (nginx/traefik)

3. **Monitoring**
   - Alerting Prometheus
   - Health checks réguliers
   - Log aggregation (ELK, Loki)

4. **Backup**
   - Redis snapshots
   - Export régulier planifications

5. **Firewall**
   - Limiter accès Redis
   - Whitelist IP si possible

---

## ✨ Fonctionnalités

### 🎛️ Gestion des Instances

- **Multi-projets & Multi-régions** - Gérez toutes vos instances depuis une interface unique
- **Contrôle temps réel** - Démarrage/Arrêt instantané avec retour d'état
- **Filtres intelligents** - Recherche par nom, filtrage par statut et région
- **Tri personnalisable** - Par nom, statut, région, RAM, CPU
- **Pagination** - Navigation fluide dans de grandes listes d'instances
- **Détails complets** - CPU, RAM, disque, OS, IP, prix/heure
- **Logs applicatifs** - Consultation des logs des instances

### ⏰ Planification Automatique

- **Horaires configurables** - Définissez heures de démarrage et d'arrêt
- **Scheduler CRON** - Exécution automatique en arrière-plan (vérification chaque minute)
- **Persistance Redis** - Stockage haute performance avec fallback fichier JSON
- **Interface intuitive** - Configuration simple via modal dédiée
- **Multi-instances** - Planifications indépendantes par instance

### 📊 Observabilité & Monitoring

- **Métriques Prometheus**
  - `ovh_manager_actions_total` - Compteur d'actions (start/stop, manual/auto, success/error)
  - `ovh_manager_api_request_duration_seconds` - Histogramme latences API
  - Métriques système Node.js (mémoire, CPU, event loop, GC)
  
- **Historique complet**
  - 500 dernières actions stockées (configurable)
  - Vue détaillée : timestamp, action, instance, projet, mode, statut, message
  - Interface temps réel avec actualisation
  
- **Notifications**
  - Slack webhook pour alertes critiques
  - Email (SMTP) pour notifications importantes
  - Logs structurés JSON

### 🏗️ Architecture Production

- **Docker multi-stage** - Images optimisées (<100MB)
- **Docker Compose** - Orchestration complète (app + Redis)
- **Secrets management** - Gestion sécurisée des credentials
- **Tests automatisés** - Vitest (32 tests, coverage 30%+)
- **CI/CD GitHub Actions** - Build, tests, scans sécurité
- **Sécurité** - Trivy (vulnérabilités) + Gitleaks (secrets)

### 🧪 Mode Test

Démarrage automatique avec données simulées si credentials OVH absents. Parfait pour développement et démo.

## 📚 Documentation

- **[API.md](API.md)** - Documentation complète de l'API REST
- **[DEPLOIEMENT.md](DEPLOIEMENT.md)** - Guide de déploiement détaillé
- **[TESTS.md](TESTS.md)** - Documentation des tests et coverage
- **[scripts/README.md](scripts/README.md)** - Scripts de déploiement

### Ressources externes

- [Documentation OVH API](https://api.ovh.com/)
- [OVH Node.js SDK](https://github.com/ovh/node-ovh)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)

---

## 🤝 Contribution

### Workflow

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Conventions

**Commits (Conventional Commits)**
```
feat: nouvelle fonctionnalité
fix: correction bug
docs: documentation
style: formatage code
refactor: refactoring
test: ajout tests
chore: tâches maintenance
```

**Code**
- ESLint + Prettier configurés
- TypeScript strict mode
- Tests pour nouvelles features
- Documentation inline (JSDoc)

---

## 📝 Changelog

Voir [CHANGELOG-nettoyage.md](CHANGELOG-nettoyage.md) pour l'historique détaillé des modifications.

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Auteurs

- **Damien COUEIGHAS** - Développement initial

---

## 🙏 Remerciements

- [OVH](https://www.ovh.com/) pour l'API Cloud
- [Bootstrap](https://getbootstrap.com/) pour le framework CSS
- [Prometheus](https://prometheus.io/) pour l'observabilité
- Communauté open-source

---

## 📞 Support

Pour toute question ou problème :

1. Consultez la [documentation](#-documentation)
2. Vérifiez les [issues existantes](https://github.com/votre-org/gest-ovh/issues)
3. Ouvrez une [nouvelle issue](https://github.com/votre-org/gest-ovh/issues/new)

---

## 🗺️ Roadmap

- [ ] Authentification utilisateur (JWT)
- [ ] Gestion multi-utilisateurs
- [ ] Dashboard Grafana intégré
- [ ] Support Kubernetes natif
- [ ] Notifications Discord/Teams
- [ ] Export CSV/JSON des instances
- [ ] Gestion groupes d'instances
- [ ] Alertes personnalisées
- [ ] Dark mode interface
- [ ] Application mobile (React Native)

---

<div align="center">

**⭐ Si ce projet vous a aidé, n'hésitez pas à mettre une étoile !**

Made with ❤️ and ☕

</div>
