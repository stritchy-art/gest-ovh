// Service pour interagir avec l'API OVH depuis le backend
import { createRequire } from 'node:module'
import type { Instance, LogEntry, StartStopResponse, ProjectCurrentUsage } from '../types/index.js'
import { getServerEnvConfig } from '../config/env.js'
import { logger } from './logger.js'

const require = createRequire(import.meta.url)
const ovh = require('ovh')
import { getMockInstances, getMockLogs, getMockProjectUsage, simulateDelay } from './mockService.js'

// Mode test activé si les credentials sont manquantes
function isTestMode(): boolean {
  const config = getServerEnvConfig()
  const testMode = !config.ovhAppKey || !config.ovhAppSecret || !config.ovhConsumerKey
  if (testMode) {
    logger.debug('OVH', 'Mode test activé - Credentials manquantes')
  }
  return testMode
}

// Créer le client OVH avec les credentials du serveur
function createOVHClient() {
  const config = getServerEnvConfig()
  
  return ovh({
    endpoint: config.ovhEndpoint,
    appKey: config.ovhAppKey,
    appSecret: config.ovhAppSecret,
    consumerKey: config.ovhConsumerKey,
    timeout: 30000 // 30 secondes max (l'API OVH peut être lente)
  })
}

// Wrapper avec timeout global pour éviter les appels bloquants
async function withTimeout<T>(promise: Promise<T>, ms = 35000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  )
  return Promise.race([promise, timeout])
}

// Registry des réponses mock pour le mode test
type MockHandler = (...args: any[]) => any | Promise<any>

const mockRegistry: Record<string, MockHandler> = {
  'GET /cloud/project': async () => {
    await simulateDelay(300, 800)
    return ['projet-demo-1', 'projet-demo-2']
  },
  'GET /cloud/project/:id': async (projectId: string) => {
    await simulateDelay(200, 500)
    return {
      description: `Projet ${projectId}`,
      projectName: `Projet ${projectId}`
    }
  },
  'GET /cloud/project/:id/instance': async () => {
    await simulateDelay(500, 1500)
    return getMockInstances()
  },
  'POST /cloud/project/:id/instance/:id/start': async () => {
    await simulateDelay(1000, 2000)
    return { status: 'Instance starting' }
  },
  'POST /cloud/project/:id/instance/:id/stop': async () => {
    await simulateDelay(1000, 2000)
    return { status: 'Instance stopping' }
  },
  'POST /cloud/project/:id/instance/:id/unshelve': async () => {
    await simulateDelay(1000, 2000)
    return { status: 'Instance unshelving' }
  },
  'GET /cloud/project/:id/flavor/:id': async () => {
    await simulateDelay(200, 400)
    return null // Les mocks d'instances ont déjà les infos flavor
  },
  'GET /cloud/project/:id/image/:id': async () => {
    await simulateDelay(200, 400)
    return null // Les mocks d'instances ont déjà les infos image
  },
  'GET /cloud/project/:id/sshkey': async () => {
    await simulateDelay(300, 600)
    return [
      {
        id: 'key-1',
        name: 'admin-key',
        publicKey: 'ssh-rsa AAAAB3NzaC1yc2E... admin@example.com',
        fingerprint: '2048 SHA256:abcd1234... admin@example.com (RSA)',
        regions: ['GRA11', 'SBG5']
      }
    ]
  },
  'GET /cloud/project/:id/usage/current': async () => {
    await simulateDelay(300, 700)
    return getMockProjectUsage()
  }
}

// Normalise un path en remplaçant les IDs par :id pour le matching
function normalizePath(path: string): string {
  return path
    .replace(/\/cloud\/project\/[^/]+/, '/cloud/project/:id')
    .replace(/\/instance\/[^/]+/, '/instance/:id')
    .replace(/\/flavor\/[^/]+/, '/flavor/:id')
    .replace(/\/image\/[^/]+/, '/image/:id')
    .replace(/\/sshkey\/[^/]+/, '/sshkey/:id')
}

// Wrapper pour appels API avec logging automatique et gestion du mode test
async function apiCall<T>(method: string, path: string, params?: unknown): Promise<T> {
  // Mode test : utiliser le mock registry
  if (isTestMode()) {
    const normalizedPath = normalizePath(path)
    const mockKey = `${method} ${normalizedPath}`
    const mockHandler = mockRegistry[mockKey]
    
    if (mockHandler) {
      logger.info('OVH', `Mode Test - ${method} ${path}`)
      const result = await mockHandler(params)
      return result as T
    }
    
    // Si pas de mock défini, logger un warning et retourner un objet vide
    logger.warn('OVH', `Mode Test - Pas de mock pour ${method} ${path}`)
    return {} as T
  }

  // Mode production : appel API réel
  const client = createOVHClient()
  const startTime = Date.now()
  
  logger.api.request(method, path, params)
  
  try {
    const result = await withTimeout(
      params 
        ? client.requestPromised(method, path, params)
        : client.requestPromised(method, path)
    ) as T
    const duration = Date.now() - startTime
    logger.api.response(method, path, result, duration)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.api.error(method, path, error, duration)
    throw error
  }
}

/**
 * Récupère la liste des projets cloud
 */
export async function getProjects(): Promise<string[]> {
  try {
    const projects = await apiCall<string[]>('GET', '/cloud/project')
    logger.info('OVH', `${projects.length} projets récupérés`)
    return projects
  } catch (error) {
    logger.error('OVH', 'Erreur getProjects', error)
    throw error
  }
}

/**
 * Récupère les détails d'un projet
 */
export async function getProjectDetails(projectId: string): Promise<{ id: string; description: string } | null> {
  try {
    const project = await apiCall<any>('GET', `/cloud/project/${projectId}`)
    return {
      id: projectId,
      description: project.description || project.projectName || projectId
    }
  } catch (error) {
    logger.warn('OVH', `Erreur récupération détails projet ${projectId}`, error)
    return { id: projectId, description: projectId }
  }
}

/**
 * Récupère la liste des instances d'un projet
 */
// Statuts OVH non retournés par défaut dans la liste, à requêter séparément
const EXTRA_STATUSES = ['REBOOT', 'HARD_REBOOT', 'RESCUE', 'VERIFY_RESIZE', 'SHELVED']

export async function getInstances(projectId: string): Promise<Instance[]> {
  try {
    // L'API OVH n'inclut pas certains états transitoires dans la liste par défaut
    // On fusionne la liste principale avec les requêtes par statut
    const [defaultInstances, ...extraResults] = await Promise.all([
      apiCall<Instance[]>('GET', `/cloud/project/${projectId}/instance`),
      ...EXTRA_STATUSES.map(status =>
        apiCall<Instance[]>('GET', `/cloud/project/${projectId}/instance`, { status }).catch(() => [] as Instance[])
      )
    ])

    // Dédoublonner par ID
    const instanceMap = new Map<string, Instance>()
    for (const inst of [...defaultInstances, ...extraResults.flat()]) {
      instanceMap.set(inst.id, inst)
    }
    const instances = Array.from(instanceMap.values())

    logger.info('OVH', `${instances.length} instances récupérées pour projet ${projectId}`)
    
    // Enrichir avec les infos flavor et image (en parallèle)
    const enrichedInstances = await Promise.all(
      instances.map(async (instance) => {
        const [flavorInfo, imageInfo] = await Promise.all([
          getFlavor(projectId, instance.flavorId).catch(() => null),
          getImage(projectId, instance.imageId).catch(() => null)
        ])
        
        // Calcul du coût mensuel (prix horaire * 730h)
        const monthlyCost = flavorInfo?.pricePerHour ? (flavorInfo.pricePerHour * 730).toFixed(2) : undefined
        const outgoingTraffic =
          'currentMonthOutgoingTraffic' in instance
            ? (instance as { currentMonthOutgoingTraffic?: number }).currentMonthOutgoingTraffic ?? 0
            : 0
        
        return {
          ...instance,
          flavorName: flavorInfo?.name,
          vcpus: flavorInfo?.vcpus,
          ram: flavorInfo?.ram,
          disk: flavorInfo?.disk,
          monthlyCost: monthlyCost,
          imageName: imageInfo?.name,
          imageType: imageInfo?.type,
          outgoingTraffic: outgoingTraffic
        }
      })
    )
    
    return enrichedInstances
  } catch (error) {
    logger.error('OVH', `Erreur getInstances projet ${projectId}`, error)
    throw error
  }
}

/**
 * Démarre une instance
 */
export async function startInstance(
  projectId: string,
  instanceId: string
): Promise<StartStopResponse> {
  logger.action.start(instanceId, projectId, 'manual')
  
  try {
    const result = await apiCall<StartStopResponse>('POST', `/cloud/project/${projectId}/instance/${instanceId}/start`)
    logger.action.success('start', instanceId)
    return result
  } catch (error) {
    logger.action.failure('start', instanceId, error)
    throw error
  }
}

/**
 * Arrête une instance
 */
export async function stopInstance(
  projectId: string,
  instanceId: string
): Promise<StartStopResponse> {
  logger.action.stop(instanceId, projectId, 'manual')
  
  try {
    const result = await apiCall<StartStopResponse>('POST', `/cloud/project/${projectId}/instance/${instanceId}/stop`)
    logger.action.success('stop', instanceId)
    return result
  } catch (error) {
    logger.action.failure('stop', instanceId, error)
    throw error
  }
}

/**
 * Réactive une instance SHELVED (unshelve)
 */
export async function unshelveInstance(
  projectId: string,
  instanceId: string
): Promise<StartStopResponse> {
  logger.action.start(instanceId, projectId, 'manual')

  try {
    const result = await apiCall<StartStopResponse>('POST', `/cloud/project/${projectId}/instance/${instanceId}/unshelve`)
    logger.action.success('unshelve', instanceId)
    return result
  } catch (error) {
    logger.action.failure('unshelve', instanceId, error)
    throw error
  }
}

/**
 * Récupère les logs d'actions pour une instance (start/stop)
 */
export async function getInstanceLogs(
  projectId: string,
  instanceId: string
): Promise<LogEntry[]> {
  // Mode test
  if (isTestMode()) {
    logger.info('OVH', 'Mode Test - getInstanceLogs')
    return getMockLogs()
  }

  // En production, on retourne les logs d'actions depuis notre système
  // plutôt que d'essayer d'accéder aux logs console OVH qui nécessitent
  // une configuration VNC/console plus complexe
  const { getActionLogs } = await import('./actionLogService.js')
  const allLogs = await getActionLogs(500)
  
  // Filtrer uniquement les logs pour cette instance
  const instanceLogs = allLogs
    .filter(log => log.instanceId === instanceId)
    .map(log => ({
      timestamp: log.timestamp,
      message: `${log.action.toUpperCase()} - ${log.status} - ${log.message || ''}`
    }))
  
  logger.info('OVH', `${instanceLogs.length} logs d'actions pour instance ${instanceId}`)
  return instanceLogs
}

/**
 * Récupère les détails d'un flavor
 */
async function getFlavor(projectId: string, flavorId: string): Promise<{ name: string; vcpus: number; ram: number; disk: number; pricePerHour: number } | null> {
  try {
    const flavor = await apiCall<any>('GET', `/cloud/project/${projectId}/flavor/${flavorId}`)
    
    // En mode test, apiCall retourne null ou objet vide
    if (!flavor || Object.keys(flavor).length === 0) {
      return null
    }
    
    logger.info('OVH', `Flavor complet pour ${flavorId}:`, {
      name: flavor.name,
      vcpus: flavor.vcpus,
      ram: flavor.ram,
      disk: flavor.disk,
      osType: flavor.osType,
      type: flavor.type,
      planCodes: flavor.planCodes,
      fullFlavor: flavor
    })
    return {
      name: flavor.name || flavorId,
      vcpus: flavor.vcpus || 0,
      ram: flavor.ram || 0, // En GB (pas MB!)
      disk: flavor.disk || 0,
      pricePerHour: flavor.planCodes?.hourly?.price || 0
    }
  } catch (error) {
    logger.warn('OVH', `Erreur récupération flavor ${flavorId}`, error)
    return null
  }
}

/**
 * Récupère les détails d'une image
 */
async function getImage(projectId: string, imageId: string): Promise<{ name: string; type: string } | null> {
  try {
    const image = await apiCall<any>('GET', `/cloud/project/${projectId}/image/${imageId}`)
    
    // En mode test, apiCall retourne null ou objet vide
    if (!image || Object.keys(image).length === 0) {
      return null
    }
    
    return {
      name: image.name || imageId,
      type: image.type || 'linux'
    }
  } catch (error) {
    logger.warn('OVH', `Erreur récupération image ${imageId}`, error)
    return null
  }
}

/**
 * Récupère les données de monitoring d'une instance
 * Note: L'endpoint /monitoring n'existe pas dans l'API OVH Cloud Public standard.
 * Pour obtenir des métriques, il faudrait utiliser:
 * - Un agent de monitoring installé sur l'instance (Prometheus, etc.)
 * - Les services OVH Metrics Data Platform
 * - Une solution externe
 */
export async function getInstanceMonitoring(projectId: string, instanceId: string): Promise<any> {
  // En mode test, retourner des données mockées
  if (isTestMode()) {
    return {
      cpu: [
        { timestamp: Date.now() - 3600000, value: 25.5 },
        { timestamp: Date.now() - 1800000, value: 45.2 },
        { timestamp: Date.now(), value: 32.8 }
      ],
      memory: [
        { timestamp: Date.now() - 3600000, value: 2048 },
        { timestamp: Date.now() - 1800000, value: 3072 },
        { timestamp: Date.now(), value: 2560 }
      ],
      disk: [
        { timestamp: Date.now() - 3600000, value: 15.5 },
        { timestamp: Date.now() - 1800000, value: 16.2 },
        { timestamp: Date.now(), value: 16.8 }
      ]
    }
  }
  
  // L'endpoint /monitoring n'existe pas dans l'API OVH Cloud Public
  logger.debug('OVH', `Monitoring non disponible via API pour instance ${instanceId}`)
  return null
}

/**
 * Récupère les metadata d'une instance
 * Note: L'API OVH Cloud Public ne propose pas d'endpoint /metadata direct.
 * Les metadata OpenStack sont accessibles depuis l'instance elle-même via http://169.254.169.254/
 */
export async function getInstanceMetadata(projectId: string, instanceId: string): Promise<Record<string, string>> {
  // En mode test, retourner des metadata mockées
  if (isTestMode()) {
    return {
      'instance-id': instanceId,
      'instance-type': 'd2-8',
      'local-ipv4': '192.168.1.10',
      'public-ipv4': '51.68.123.45'
    }
  }
  
  // L'endpoint /metadata n'existe pas dans l'API OVH Cloud Public
  // Les metadata sont accessibles depuis l'instance via le service de metadata OpenStack (169.254.169.254)
  logger.debug('OVH', `Metadata non disponibles via API pour instance ${instanceId}`)
  return {}
}

/**
 * Récupère les clés SSH d'un projet
 */
export async function getProjectSSHKeys(projectId: string) {
  try {
    logger.debug('OVH', `Récupération liste clés SSH pour projet ${projectId}`)
    const keys = await apiCall<any[]>('GET', `/cloud/project/${projectId}/sshkey`)
    
    if (!keys || keys.length === 0) {
      return []
    }
    
    logger.info('OVH', `${keys.length} clé(s) SSH trouvée(s) pour projet ${projectId}`)
    
    // L'API renvoie directement les objets complets, pas besoin d'appels supplémentaires
    logger.debug('OVH', 'Première clé SSH:', keys[0])
    
    // Normaliser le format
    const normalizedKeys = keys.map(key => ({
      id: key.id || key.name,
      name: key.name || key.id,
      publicKey: key.publicKey || '',
      fingerprint: key.fingerPrint || key.fingerprint,
      regions: key.regions || []
    }))
    
    logger.info('OVH', `${normalizedKeys.length} clés SSH complètes récupérées pour projet ${projectId}`)
    return normalizedKeys
  } catch (error) {
    logger.error('OVH', `Erreur récupération clés SSH projet ${projectId}`, error)
    return []
  }
}

/**
 * Récupère la consommation en cours du projet (période de facturation courante)
 * Nécessite le droit GET /cloud/project/{id}/usage/current sur le consumer key
 */
export async function getProjectCurrentUsage(projectId: string): Promise<ProjectCurrentUsage | null> {
  try {
    const usage = await apiCall<ProjectCurrentUsage>('GET', `/cloud/project/${projectId}/usage/current`)
    const total = usage.totalPrice ?? usage.hourlyUsage?.instance?.reduce((s, i) => s + i.totalPrice, 0) ?? 0
    logger.info('OVH', `Consommation projet ${projectId}: ${total.toFixed(2)}€`)
    return usage
  } catch (error) {
    logger.warn('OVH', `Impossible de récupérer la consommation du projet ${projectId}`, error)
    return null
  }
}
