// Service pour interagir avec l'API OVH depuis le backend
import { createRequire } from 'node:module'
import type { OVHConfig, Instance, LogEntry, StartStopResponse } from '../types/index.js'

const require = createRequire(import.meta.url)
const ovh = require('ovh')
import { getMockInstances, getMockLogs, simulateDelay } from './mockService.js'

/**
 * Récupère la liste des instances d'un projet
 */
export async function getInstances(config: OVHConfig, projectId: string): Promise<Instance[]> {
  // Mode test
  if (config.testMode) {
    return getMockInstances()
  }

  // Mode production
  const client = ovh({
    endpoint: config.endpoint,
    appKey: config.appKey,
    appSecret: config.appSecret,
    consumerKey: config.consumerKey
  })

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
  config: OVHConfig,
  projectId: string,
  instanceId: string
): Promise<StartStopResponse> {
  // Mode test
  if (config.testMode) {
    await simulateDelay(1000, 2000)
    return { status: 'Instance starting' }
  }

  // Mode production
  const client = ovh({
    endpoint: config.endpoint,
    appKey: config.appKey,
    appSecret: config.appSecret,
    consumerKey: config.consumerKey
  })

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
  config: OVHConfig,
  projectId: string,
  instanceId: string
): Promise<StartStopResponse> {
  // Mode test
  if (config.testMode) {
    await simulateDelay(1000, 2000)
    return { status: 'Instance stopping' }
  }

  // Mode production
  const client = ovh({
    endpoint: config.endpoint,
    appKey: config.appKey,
    appSecret: config.appSecret,
    consumerKey: config.consumerKey
  })

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
  config: OVHConfig,
  projectId: string,
  instanceId: string
): Promise<LogEntry[]> {
  // Mode test
  if (config.testMode) {
    return getMockLogs()
  }

  // Mode production
  const client = ovh({
    endpoint: config.endpoint,
    appKey: config.appKey,
    appSecret: config.appSecret,
    consumerKey: config.consumerKey
  })

  try {
    const logs = await client.requestPromised('GET', `/cloud/project/${projectId}/instance/${instanceId}/vnc`)
    return logs
  } catch (error) {
    console.error('OVH API Error:', error)
    throw error
  }
}
