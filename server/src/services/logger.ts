// Service de logging centralisé
import fs from 'fs/promises'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const DEBUG_LOG = path.join(LOG_DIR, 'debug.log')
const ERROR_LOG = path.join(LOG_DIR, 'error.log')

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: unknown
}

const isDebugMode = process.env.DEBUG_MODE === 'true'

// Couleurs console
const colors = {
  debug: '\x1b[36m',   // Cyan
  info: '\x1b[32m',    // Vert
  warn: '\x1b[33m',    // Jaune
  error: '\x1b[31m',   // Rouge
  reset: '\x1b[0m'
}

const icons = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌'
}

async function writeToFile(filename: string, content: string): Promise<void> {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true })
    await fs.appendFile(filename, content + '\n', 'utf-8')
  } catch (error) {
    console.error('Erreur écriture log:', error)
  }
}

function formatLogEntry(entry: LogEntry): string {
  const dataStr = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : ''
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}${dataStr}`
}

function getLocalTimestamp(): string {
  return new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function log(level: LogLevel, category: string, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: getLocalTimestamp(),
    level,
    category,
    message,
    data
  }

  const formatted = formatLogEntry(entry)
  const color = colors[level]
  const icon = icons[level]
  
  // Console avec couleurs
  if (level === 'debug' && !isDebugMode) {
    // Ne pas afficher les debug si DEBUG_MODE !== true
    return
  }
  
  console.log(`${color}${icon} [${entry.timestamp}] [${category}] ${message}${colors.reset}`)
  if (data && isDebugMode) {
    console.log(color + JSON.stringify(data, null, 2) + colors.reset)
  }

  // Fichiers (async non-bloquant)
  if (level === 'error') {
    writeToFile(ERROR_LOG, formatted).catch(() => {})
  }
  
  if (isDebugMode) {
    writeToFile(DEBUG_LOG, formatted).catch(() => {})
  }
}

export const logger = {
  debug: (category: string, message: string, data?: unknown) => log('debug', category, message, data),
  info: (category: string, message: string, data?: unknown) => log('info', category, message, data),
  warn: (category: string, message: string, data?: unknown) => log('warn', category, message, data),
  error: (category: string, message: string, data?: unknown) => log('error', category, message, data),
  
  // Helpers spécifiques
  api: {
    request: (method: string, path: string, params?: unknown) => {
      log('debug', 'OVH_API', `→ ${method} ${path}`, params)
    },
    response: (method: string, path: string, data: unknown, duration: number) => {
      log('debug', 'OVH_API', `← ${method} ${path} (${duration}ms)`, data)
    },
    warn: (method: string, path: string, error: unknown, duration: number) => {
      log('warn', 'OVH_API', `✗ ${method} ${path} (${duration}ms) — non disponible (droits insuffisants ?)`, error)
    },
    error: (method: string, path: string, error: unknown, duration: number) => {
      log('error', 'OVH_API', `✗ ${method} ${path} (${duration}ms)`, error)
    }
  },
  
  action: {
    start: (instanceId: string, projectId: string, mode: 'manual' | 'auto') => {
      log('info', 'ACTION', `Démarrage instance ${instanceId}`, { projectId, mode })
    },
    stop: (instanceId: string, projectId: string, mode: 'manual' | 'auto') => {
      log('info', 'ACTION', `Arrêt instance ${instanceId}`, { projectId, mode })
    },
    success: (action: string, instanceId: string) => {
      log('info', 'ACTION', `✓ ${action} réussi: ${instanceId}`)
    },
    failure: (action: string, instanceId: string, error: unknown) => {
      log('error', 'ACTION', `✗ ${action} échoué: ${instanceId}`, error)
    }
  },
  
  scheduler: {
    run: (instanceCount: number) => {
      log('info', 'SCHEDULER', `Exécution planifiée (${instanceCount} instances)`)
    },
    error: (error: unknown) => {
      log('error', 'SCHEDULER', 'Erreur scheduler', error)
    }
  }
}
