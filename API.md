# Documentation API

## 🔗 Endpoints Backend

Toutes les routes sont préfixées par `/api` et utilisent le format JSON.

### 📊 Statut & Monitoring

#### `GET /health`

Vérification santé du serveur.

**Réponse**
```json
{
  "status": "ok",
  "redisAvailable": true,
  "testMode": false,
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

#### `GET /status`

Statut détaillé de l'application.

**Réponse**
```json
{
  "testMode": false,
  "redisAvailable": true,
  "ovhConfigured": true
}
```

#### `GET /metrics`

Métriques Prometheus au format texte.

**Réponse** (format Prometheus)
```
# HELP ovh_manager_actions_total Total des actions start/stop
# TYPE ovh_manager_actions_total counter
ovh_manager_actions_total{action="start",mode="manual",status="success"} 42
ovh_manager_actions_total{action="stop",mode="auto",status="success"} 38

# HELP ovh_manager_api_request_duration_seconds Durée des requêtes API
# TYPE ovh_manager_api_request_duration_seconds histogram
ovh_manager_api_request_duration_seconds_bucket{route="/api/instances/list",method="POST",status="200",le="0.05"} 120
...
```

---

### 📁 Projets OVH

#### `GET /api/projects`

Liste tous les projets cloud OVH.

**Réponse**
```json
[
  {
    "id": "1234567890abcdef",
    "description": "Mon Projet Principal"
  },
  {
    "id": "abcdef1234567890",
    "description": "Projet Développement"
  }
]
```

**Codes d'erreur**
- `500` - Erreur API OVH

---

### 🖥️ Instances

#### `POST /api/instances/list`

Liste les instances d'un projet.

**Requête**
```json
{
  "projectId": "1234567890abcdef"
}
```

**Réponse**
```json
[
  {
    "id": "instance-123",
    "name": "web-server-prod",
    "status": "ACTIVE",
    "region": "GRA11",
    "created": "2026-01-15T10:00:00.000Z",
    "flavorName": "s1-2",
    "vcpus": 1,
    "ram": 2048,
    "disk": 10,
    "pricePerHour": 0.0075,
    "imageName": "Ubuntu 22.04",
    "imageType": "linux",
    "ipAddresses": [
      {
        "type": "public",
        "version": 4,
        "ip": "51.210.XXX.XXX"
      }
    ],
    "projectId": "1234567890abcdef"
  }
]
```

**Codes d'erreur**
- `400` - projectId manquant
- `500` - Erreur API OVH

---

#### `POST /api/instances/start`

Démarrer une instance.

**Requête**
```json
{
  "projectId": "1234567890abcdef",
  "instanceId": "instance-123"
}
```

**Réponse**
```json
{
  "success": true,
  "message": "Instance instance-123 démarrée avec succès"
}
```

**Codes d'erreur**
- `400` - Paramètres manquants
- `500` - Erreur démarrage

---

#### `POST /api/instances/stop`

Arrêter une instance.

**Requête**
```json
{
  "projectId": "1234567890abcdef",
  "instanceId": "instance-123"
}
```

**Réponse**
```json
{
  "success": true,
  "message": "Instance instance-123 arrêtée avec succès"
}
```

**Codes d'erreur**
- `400` - Paramètres manquants
- `500` - Erreur arrêt

---

#### `POST /api/instances/logs`

Récupérer les logs d'une instance.

**Requête**
```json
{
  "projectId": "1234567890abcdef",
  "instanceId": "instance-123"
}
```

**Réponse**
```json
[
  {
    "timestamp": "2026-02-19T10:25:30.000Z",
    "message": "[INFO] Instance started successfully",
    "level": "info"
  },
  {
    "timestamp": "2026-02-19T10:20:15.000Z",
    "message": "[INFO] System boot completed",
    "level": "info"
  }
]
```

**Codes d'erreur**
- `400` - Paramètres manquants
- `500` - Erreur récupération logs

---

#### `POST /api/instances/monitoring`

Récupérer les données de monitoring (métriques CPU, RAM, réseau).

**Requête**
```json
{
  "projectId": "1234567890abcdef",
  "instanceId": "instance-123"
}
```

**Réponse**
```json
{
  "cpu": [
    { "timestamp": "2026-02-19T10:30:00.000Z", "value": 45.2 },
    { "timestamp": "2026-02-19T10:25:00.000Z", "value": 38.7 }
  ],
  "memory": [
    { "timestamp": "2026-02-19T10:30:00.000Z", "value": 1536 },
    { "timestamp": "2026-02-19T10:25:00.000Z", "value": 1420 }
  ],
  "network": {
    "rx": [
      { "timestamp": "2026-02-19T10:30:00.000Z", "value": 125000 }
    ],
    "tx": [
      { "timestamp": "2026-02-19T10:30:00.000Z", "value": 89000 }
    ]
  }
}
```

**Note** : Cette fonctionnalité nécessite un agent de monitoring installé sur l'instance.

**Codes d'erreur**
- `400` - Paramètres manquants
- `404` - Données de monitoring non disponibles
- `500` - Erreur serveur

---

#### `POST /api/instances/metadata`

Récupérer les métadonnées d'une instance.

**Requête**
```json
{
  "projectId": "1234567890abcdef",
  "instanceId": "instance-123"
}
```

**Réponse**
```json
{
  "environment": "production",
  "application": "web-server",
  "owner": "team-devops",
  "backup-enabled": "true"
}
```

**Codes d'erreur**
- `400` - Paramètres manquants
- `404` - Métadonnées non disponibles
- `500` - Erreur serveur

---

### ⏰ Planifications

#### `GET /api/schedules`

Récupérer toutes les planifications.

**Réponse**
```json
{
  "instance-123": {
    "instanceId": "instance-123",
    "projectId": "1234567890abcdef",
    "startTime": "08:00",
    "stopTime": "18:00",
    "enabled": true
  },
  "instance-456": {
    "instanceId": "instance-456",
    "projectId": "1234567890abcdef",
    "startTime": "09:00",
    "stopTime": "17:00",
    "enabled": true
  }
}
```

---

#### `POST /api/schedules`

Créer ou mettre à jour une planification.

**Requête**
```json
{
  "instanceId": "instance-123",
  "projectId": "1234567890abcdef",
  "startTime": "08:00",
  "stopTime": "18:00",
  "enabled": true
}
```

**Réponse**
```json
{
  "success": true,
  "message": "Planification enregistrée avec succès",
  "schedule": {
    "instanceId": "instance-123",
    "projectId": "1234567890abcdef",
    "startTime": "08:00",
    "stopTime": "18:00",
    "enabled": true
  }
}
```

**Codes d'erreur**
- `400` - Paramètres invalides ou manquants
- `500` - Erreur sauvegarde

---

#### `DELETE /api/schedules/:instanceId`

Supprimer une planification.

**Exemple**
```
DELETE /api/schedules/instance-123
```

**Réponse**
```json
{
  "success": true,
  "message": "Planification supprimée"
}
```

**Codes d'erreur**
- `400` - instanceId manquant
- `500` - Erreur suppression

---

### 📜 Historique des Actions

#### `GET /api/actions?limit=200`

Récupérer l'historique des actions.

**Paramètres Query**
- `limit` (optionnel, défaut: 200) - Nombre d'entrées à retourner

**Réponse**
```json
[
  {
    "timestamp": "2026-02-19T10:30:00.000Z",
    "action": "start",
    "instanceId": "instance-123",
    "projectId": "1234567890abcdef",
    "mode": "manual",
    "status": "success",
    "message": null
  },
  {
    "timestamp": "2026-02-19T08:00:00.000Z",
    "action": "start",
    "instanceId": "instance-456",
    "projectId": "1234567890abcdef",
    "mode": "auto",
    "status": "success",
    "message": "Planification automatique"
  },
  {
    "timestamp": "2026-02-18T18:00:00.000Z",
    "action": "stop",
    "instanceId": "instance-456",
    "projectId": "1234567890abcdef",
    "mode": "auto",
    "status": "error",
    "message": "Timeout lors de l'arrêt"
  }
]
```

**Types de valeurs**
- `action` : `"start"` | `"stop"`
- `mode` : `"manual"` | `"auto"`
- `status` : `"success"` | `"error"`

**Codes d'erreur**
- `500` - Erreur récupération historique

---

## 🔐 Sécurité

### Authentification

⚠️ **Actuellement, l'API ne requiert pas d'authentification**. Pour un usage en production, il est recommandé d'ajouter :

- **API Key** dans les headers
- **JWT** pour authentification utilisateur
- **Rate limiting** pour éviter les abus
- **CORS** configuré pour limiter les origines autorisées

### Variables d'environnement sensibles

Les credentials OVH ne sont **JAMAIS** exposés via l'API. Ils restent côté serveur uniquement.

---

## 📊 Codes d'erreur HTTP

| Code | Description |
|------|-------------|
| `200` | Succès |
| `400` | Requête invalide (paramètres manquants/incorrects) |
| `404` | Ressource non trouvée |
| `500` | Erreur serveur interne |
| `503` | Service temporairement indisponible |

---

## 🧪 Mode Test

Si les credentials OVH ne sont pas configurés, l'API bascule automatiquement en **mode test** avec données simulées :

- 3 instances fictives
- Logs simulés
- Actions réussies (sans appels OVH réels)

Vérifier le mode via `GET /api/status` :

```json
{
  "testMode": true,
  "redisAvailable": true,
  "ovhConfigured": false
}
```

---

## 📝 Client Frontend (ovhService.ts)

### Méthodes disponibles

```typescript
// Projets
getProjects(): Promise<Project[]>

// Instances
getInstances(projectId: string): Promise<Instance[]>
startInstance(projectId: string, instanceId: string): Promise<void>
stopInstance(projectId: string, instanceId: string): Promise<void>
getInstanceLogs(projectId: string, instanceId: string): Promise<LogEntry[]>

// Planifications
getSchedules(): Promise<Record<string, ScheduleData>>
saveSchedule(schedule: ScheduleData): Promise<void>
deleteSchedule(instanceId: string): Promise<void>

// Historique
getActionLogs(limit?: number): Promise<ActionLogEntry[]>
```

### Exemple d'utilisation

```typescript
import ovhService from './services/ovhService'

// Récupérer les projets
const projects = await ovhService.getProjects()

// Lister les instances
const instances = await ovhService.getInstances('project-123')

// Démarrer une instance
await ovhService.startInstance('project-123', 'instance-456')

// Récupérer l'historique des actions
const logs = await ovhService.getActionLogs(100)
```

---

## 🔄 Flux de données

### Démarrage d'instance

```
User Click "Start"
    ↓
Frontend (ovhService.startInstance)
    ↓
POST /api/instances/start
    ↓
Backend (routes/instances.ts)
    ↓
ovhService.startInstance()
    ↓
OVH API call
    ↓
actionLogService.logAction()
    ↓
Redis storage + Prometheus metrics
    ↓
Response to Frontend
    ↓
UI Update + Notification
```

### Planification automatique

```
Cron Job (every minute)
    ↓
cronScheduler.checkSchedules()
    ↓
scheduleService.getSchedules()
    ↓
Redis fetch
    ↓
Compare current time
    ↓
ovhService.startInstance() / stopInstance()
    ↓
actionLogService.logAction(mode: 'auto')
    ↓
notificationService.notify()
```

---

## 🧰 Outils de développement

### Tester l'API avec curl

```bash
# Santé du serveur
curl http://localhost:3001/health

# Lister les projets
curl http://localhost:3001/api/projects

# Lister les instances
curl -X POST http://localhost:3001/api/instances/list \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1234567890abcdef"}'

# Démarrer une instance
curl -X POST http://localhost:3001/api/instances/start \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1234567890abcdef","instanceId":"instance-123"}'

# Historique des actions
curl http://localhost:3001/api/actions?limit=50
```

### Postman Collection

Importez ce fichier dans Postman pour tester rapidement :

```json
{
  "info": {
    "name": "OVH Cloud Manager API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Get Projects",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/projects"
      }
    },
    {
      "name": "List Instances",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/instances/list",
        "body": {
          "mode": "raw",
          "raw": "{\"projectId\":\"{{projectId}}\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    },
    {
      "key": "projectId",
      "value": "1234567890abcdef"
    }
  ]
}
```

---

## 📚 Ressources

- [Documentation OVH API](https://api.ovh.com/)
- [OVH Node.js SDK](https://github.com/ovh/node-ovh)
- [Prometheus Metrics Format](https://prometheus.io/docs/instrumenting/exposition_formats/)
