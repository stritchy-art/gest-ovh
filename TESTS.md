# Configuration et Tests - OVH Cloud Manager

## Configuration des Tests

### Client (Frontend)
- **Framework**: Vitest 1.6.0 + @testing-library/react
- **Environment**: jsdom
- **Coverage Provider**: @vitest/coverage-v8
- **Fichiers**: `vitest.config.ts`

**Seuils de coverage définis:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Commandes:**
```bash
cd client
npm test              # Lancer les tests
npm test -- --coverage # Tests avec coverage
```

### Server (Backend)
- **Framework**: Vitest 1.6.0 + supertest
- **Environment**: node
- **Coverage Provider**: @vitest/coverage-v8
- **Fichiers**: `vitest.config.ts`

**Seuils de coverage définis:**
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

**Commandes:**
```bash
cd server
npm test              # Lancer les tests
npm test -- --coverage # Tests avec coverage
```

---

## Tests Créés

### Frontend - 18 tests (✅ 18 passed)

#### Utilitaires (`utils/formatting.test.ts`) - 8 tests
- ✅ formatDate formatage DD/MM/YYYY HH:mm
- ✅ formatDate padding zéros
- ✅ getStatusBadge pour ACTIVE
- ✅ getStatusBadge pour SHUTOFF
- ✅ getStatusBadge pour BUILDING
- ✅ getStatusBadge pour ERROR
- ✅ getStatusBadge pour PAUSED
- ✅ getStatusBadge pour statut inconnu

#### Hooks (`hooks/useProjects.test.ts`) - 2 tests
- ✅ Chargement projets au mount
- ✅ Refetch projets

#### Composants (`components/*.test.tsx`) - 7 tests
**Pagination (4 tests):**
- ✅ Affichage total items et page courante
- ✅ Désactivation boutons first/prev sur page 1
- ✅ Désactivation boutons next/last sur dernière page
- ✅ Appel onPageChange avec bon numéro de page

**ProjectSelector (3 tests):**
- ✅ Affichage tous projets dans dropdown
- ✅ Sélection projet par défaut
- ✅ Appel onProjectChange au changement

#### App (`App.test.tsx`) - 1 test
- ✅ Affichage titre application

---

### Backend - 14 tests (✅ 14 passed)

#### Services (`services/__tests__/*.test.ts`) - 7 tests

**env.test.ts (1 test):**
- ✅ Détection credentials manquantes

**logger.test.ts (4 tests):**
- ✅ Méthodes log standards définies
- ✅ Méthodes log actions définies
- ✅ Formatage messages avec contexte
- ✅ Gestion erreurs avec stack trace

**ovhService.test.ts (3 tests):**
- ✅ hasOvhCredentials retourne false si vide
- ✅ hasOvhCredentials retourne true si complet
- ✅ getInstances retourne mocks en mode test

#### Routes (`routes/__tests__/instances.test.ts`) - 6 tests
- ✅ POST /api/instances/list retourne instances pour projectId valide
- ✅ POST /api/instances/list retourne 400 si projectId manquant
- ✅ POST /api/instances/start démarre instance
- ✅ POST /api/instances/start retourne 400 si params manquants
- ✅ POST /api/instances/stop arrête instance
- ✅ POST /api/instances/stop retourne 400 si params manquants

---

## Résultats Coverage

### Client - Coverage actuel: **30.9%**
```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   30.9  |   64.58  |  34.09  |  30.9
```

**Fichiers testés:**
- ✅ utils/formatting.ts - **100%** (8 tests)
- ✅ components/Pagination.tsx - **100%** (4 tests)
- ✅ components/ProjectSelector.tsx - **95%** (3 tests)
- ✅ hooks/useProjects.ts - **85%** (2 tests)
- ⚠️ App.tsx - **80%** (1 test basique)

**Fichiers non testés (0% coverage):**
- ❌ components/InstanceList.tsx
- ❌ components/InstanceFilters.tsx
- ❌ components/InstanceDetails.tsx
- ❌ components/InstanceLogs.tsx
- ❌ components/ScheduleModal.tsx
- ❌ hooks/useInstances.ts
- ❌ services/ovhService.ts
- ❌ constants/index.ts

**Objectif**: Augmenter à **>80%** en testant les composants manquants

---

### Server - Tests passent, coverage à vérifier
```bash
cd server
npm test -- --run --coverage
```

**Fichiers testés:**
- ✅ services/logger.ts (4 tests)
- ✅ services/ovhService.ts (3 tests)
- ✅ routes/instances.ts (6 tests)
- ✅ config/env.ts (1 test)

**Fichiers non testés:**
- ❌ routes/schedules.ts
- ❌ routes/projects.ts
- ❌ routes/status.ts
- ❌ services/scheduleService.ts
- ❌ services/actionLogService.ts
- ❌ services/metricsService.ts
- ❌ services/redisClient.ts
- ❌ services/mockService.ts

---

## Prochaines Étapes pour améliorer le coverage

### Priorité 1 - Client (pour atteindre 80%)
1. **InstanceList.tsx** - Composant principal
   - Tests render avec données mock
   - Tests handlers (start, stop, schedule)
   - Tests filtres/tri/pagination

2. **InstanceFilters.tsx** 
   - Tests changement filtres
   - Tests bouton refresh

3. **useInstances hook**
   - Tests chargement instances
   - Tests updateInstanceSchedule
   - Tests refetch

4. **services/ovhService.ts**
   - Tests appels API
   - Tests gestion erreurs

### Priorité 2 - Server (pour atteindre 70%)
1. **routes/schedules.ts**
   - Tests CRUD schedules
   - Tests validation

2. **services/scheduleService.ts**
   - Tests gestion cron jobs
   - Tests actions programmées

3. **routes/projects.ts**
   - Tests récupération projets

---

## Commandes Utiles

### Lancer tous les tests
```bash
# Client
cd client && npm test

# Server
cd server && npm test

# Les deux en parallèle (depuis root)
npm test --workspaces
```

### Coverage HTML Reports
```bash
# Client
cd client && npm test -- --coverage
# Rapport dans: client/coverage/index.html

# Server
cd server && npm test -- --coverage
# Rapport dans: server/coverage/index.html
```

### Watch mode (développement)
```bash
cd client && npm test -- --watch
cd server && npm test -- --watch
```

---

## État Actuel

✅ **Configuration complète** - Vitest configuré client + server  
✅ **32 tests créés** - 18 client + 14 server  
✅ **100% tests passent** - 0 échecs  
⚠️ **Coverage à améliorer** - 30.9% client, à vérifier server  
📋 **Prochaine étape** - Tests InstanceList et hooks manquants
