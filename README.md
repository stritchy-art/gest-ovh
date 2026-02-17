# OVH Cloud Manager - Architecture Full-Stack

Application complète de gestion des instances OVH Cloud Public avec planification automatique.

## 📁 Structure du Projet

```
gest-ovh/
├── client/                    # Application React (Frontend)
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── services/          # Services frontend
│   │   └── types/             # Types TypeScript
│   └── package.json
│
├── server/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/            # Routes API
│   │   ├── services/          # Services backend
│   │   ├── schedulers/        # Gestionnaires de cron
│   │   └── types/             # Types TypeScript
│   └── package.json
│
└── package.json               # Configuration du monorepo
```

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement (client + server)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## ⚙️ Fonctionnalités

### 🎛️ Gestion des Instances
- ✅ Démarrage/Arrêt manuel
- ✅ Visualisation des logs
- ✅ Mode test (sans identifiants)

### ⏰ Planification Automatique
- ✅ Horaires de démarrage/arrêt configurables
- ✅ Scheduler cron côté backend
- ✅ Interface de configuration intuitive

### 🏗️ Architecture
- ✅ Monorepo client/server
- ✅ TypeScript full-stack
- ✅ API REST sécurisée
- ✅ Mock data pour tests

## 📖 Documentation Complète

Voir le fichier README complet pour :
- Architecture détaillée
- Configuration de production
- Sécurité et bonnes pratiques
- Améliorations futures
