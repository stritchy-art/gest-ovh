# Nettoyage du code et sécurisation - Changelog

## 🗑️ Fichiers supprimés

### Fichiers dupliqués/obsolètes
- `config.example.json` → remplacé par `.env.example`
- `playwright.config.ts` (racine) → déplacé dans `e2e/` (déjà existant)

### Ancienne architecture frontend non sécurisée
- `client/src/components/OVHConfig.tsx` → composant de saisie credentials (faille sécurité)
- `client/src/services/apiClient.ts` → couche d'abstraction devenue inutile
- `client/src/services/mockData.ts` → données mock déplacées dans backend

## 🔐 Sécurisation majeure

### Avant
- ❌ Frontend demandait credentials OVH à l'utilisateur
- ❌ Frontend envoyait credentials au backend dans chaque requête
- ❌ Risque d'exposition des credentials dans le navigateur/réseau

### Après
- ✅ Credentials OVH **uniquement côté serveur**
- ✅ Lecture depuis variables d'environnement ou Docker secrets
- ✅ Frontend n'a jamais accès aux credentials
- ✅ Mode test automatique si credentials manquants

## 🔄 Refactoring backend

### `server/src/services/ovhService.ts`
- Suppression du paramètre `config: OVHConfig` de toutes les fonctions
- Ajout de `createOVHClient()` qui utilise `getServerEnvConfig()`
- Ajout de `isTestMode()` pour détection automatique mode test
- **Avant**: `getProjects(config)` → **Après**: `getProjects()`

### Routes API simplifiées
- `POST /api/projects/list` → plus de body requis
- `POST /api/instances/list` → body: `{ projectId }` (sans config)
- `POST /api/instances/start` → body: `{ projectId, instanceId }` (sans config)
- `POST /api/instances/stop` → body: `{ projectId, instanceId }` (sans config)
- `POST /api/instances/logs` → body: `{ projectId, instanceId }` (sans config)

### `server/src/schedulers/cronScheduler.ts`
- Suppression de la construction manuelle du `ovhConfig`
- Appels directs: `startInstance(projectId, instanceId)`

## 🎨 Simplification frontend

### `client/src/App.tsx`
- Suppression de l'état `config`
- Suppression du composant `OVHConfig`
- Suppression du mode test badge
- Affichage direct de `<InstanceList />`

### `client/src/components/InstanceList.tsx`
- Suppression de la prop `config: OVHConfig`
- Appels API sans config:
  - `ovhService.getProjects()` au lieu de `ovhService.getProjects(config)`
  - `ovhService.getInstances(projectId)` au lieu de `ovhService.getInstances(config, projectId)`
  - etc.

### `client/src/components/InstanceLogs.tsx`
- Suppression de la prop `config: OVHConfig`
- Appels API simplifiés

### `client/src/services/ovhService.ts`
- Suppression du paramètre `config` de toutes les méthodes
- Méthodes simplifiées: `getProjects()`, `getInstances(projectId)`, etc.

## 📦 Nettoyage des types

### `client/src/types/index.ts`
- Suppression de l'interface `OVHConfig` (plus utilisée côté client)

### `server/src/types/index.ts`
- Suppression de l'interface `OVHConfig` (remplacée par `ServerEnvConfig` dans `config/env.ts`)

## ✅ Résultats

### Sécurité
- ✅ **Faille de sécurité corrigée**: credentials ne transitent plus par le frontend
- ✅ Architecture conforme aux bonnes pratiques de sécurité
- ✅ Respect du principe de séparation des responsabilités

### Code
- ✅ **-350 lignes** de code mort supprimées
- ✅ **-3 fichiers** frontend obsolètes
- ✅ **-2 fichiers** racine dupliqués
- ✅ Simplification des signatures de fonctions
- ✅ Meilleure lisibilité

### Maintenabilité
- ✅ Architecture plus claire et logique
- ✅ Moins de props à passer entre composants
- ✅ Configuration centralisée côté serveur
- ✅ Mode test automatique (pas de configuration manuelle)

## 🚀 Migration

Pour les déploiements existants, il suffit de:

1. Configurer les variables d'environnement serveur (`.env` ou Docker secrets)
2. Redéployer l'application
3. Le frontend fonctionne directement sans demander de credentials

### Variables d'environnement requises

```bash
OVH_ENDPOINT=ovh-eu
OVH_APP_KEY=votre_app_key
OVH_APP_SECRET=votre_app_secret
OVH_CONSUMER_KEY=votre_consumer_key
```

### Docker Secrets (recommandé en production)

```yaml
# docker-compose.yml
secrets:
  ovh_app_key:
    file: ./secrets/ovh_app_key.txt
  ovh_app_secret:
    file: ./secrets/ovh_app_secret.txt
  ovh_consumer_key:
    file: ./secrets/ovh_consumer_key.txt
```

## 📝 Note importante

Si aucun credential n'est configuré côté serveur, l'application bascule automatiquement en **mode test** avec données simulées. Aucune erreur n'est levée, permettant de tester l'application sans compte OVH.
