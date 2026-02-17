// Service pour interagir avec l'API OVH depuis le backend
import { createRequire } from 'node:module'
import type { Instance, LogEntry, StartStopResponse } from '../types/index.js'
import { getServerEnvConfig } from '../config/env.js'

const require = createRequire(import.meta.url)
const ovh = require('ovh')
import { getMockInstances, getMockLogs, simulateDelay } from './mockService.js'

// Mode test activé si les credentials sont manquantes
function isTestMode(): boolean {
  const config = getServerEnvConfig()
  return !config.ovhAppKey || !config.ovhAppSecret || !config.ovhConsumerKey
}

// Créer le client OVH avec les credentials du serveur
function createOVHClient() {
  const config = getServerEnvConfig()
  
  return ovh({
    endpoint: config.ovhEndpoint,
    appKey: config.ovhAppKey,
    appSecret: config.ovhAppSecret,
    consumerKey: config.ovhConsumerKey
  })
}

/**
 * Récupère la liste des projets cloud
 */
export async function getProjects(): Promise<string[]> {
  // Mode test
  if (isTestMode()) {
    console.log('🧪 Mode Test - getProjects')
    return ['projet-demo-1', 'projet-demo-2']
  }

  // Mode production
  const client = createOVHClient()

  try {
    const projects = await client.requestPromised('GET', '/cloud/project')
    return projects
  } catch (error) {
    console.error('OVH API Error:', error)
    throw error
  }
}

/**
 * Récupère la liste des instances d'un projet
 */
export async function getInstances(projectId: string): Promise<Instance[]> {
  // Mode test
  if (isTestMode()) {
    console.log('🧪 Mode Test - getInstances')
    return getMockInstances()
  }

  // Mode production
  const client = createOVHClient()

  try {
    const instances = await client.requestPromised('GET', `/cloud/project/${projectId}/instance`)
    return instances
  } catch (error) {
    console.error('OVH API Error:', error)
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
  // Mode test
  if (isTestMode()) {
    console.log('🧪 Mode Test - startInstance')
    await simulateDelay(1000, 2000)
    return { status: 'Instance starting' }
  }

  // Mode production
  const client = createOVHClient()

  try {
    const result = await client.requestPromised('POST', `/cloud/project/${projectId}/instance/${instanceId}/start`)
    return result
  } catch (error) {
    console.error('OVH API Error:', error)
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
  // Mode test
  if (isTestMode()) {
    console.log('🧪 Mode Test - stopInstance')
    await simulateDelay(1000, 2000)
    return { status: 'Instance stopping' }
  }

  // Mode production
  const client = createOVHClient()

  try {
    const result = await client.requestPromised('POST', `/cloud/project/${projectId}/instance/${instanceId}/stop`)
    return result
  } catch (error) {
    console.error('OVH API Error:', error)
    throw error
  }
}

/**
 * Récupère les logs d'une instance
 */
export async function getInstanceLogs(
  projectId: string,
  instanceId: string
): Promise<LogEntry[]> {
  // Mode test
  if (isTestMode()) {
    console.log('🧪 Mode Test - getInstanceLogs')
    return getMockLogs()
  }

  // Mode production
  const client = createOVHClient()

  try {
    const logs = await client.requestPromised('GET', `/cloud/project/${projectId}/instance/${instanceId}/vnc`)
    return logs
  } catch (error) {
    console.error('OVH API Error:', error)
    throw error
  }
}
