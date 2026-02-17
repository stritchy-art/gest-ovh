// Couche d'abstraction pour les appels API OVH
// Cette couche permet de basculer entre les vrais appels API et les mocks

import { mockProjects, mockInstances, mockLogs, mockResponses } from './mockData'
import type { OVHConfig, Instance, LogEntry, StartStopResponse } from '../types'

/**
 * Interface pour les clients API
 */
interface IApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, data?: unknown): Promise<T>
}

/**
 * Client API OVH - Appels réels vers l'API
 */
class OVHApiClient implements IApiClient {
  private config: OVHConfig
  private baseUrl: string

  constructor(config: OVHConfig) {
    this.config = config
    this.baseUrl = this.getBaseUrl(config.endpoint)
  }

  private getBaseUrl(endpoint: string): string {
    const endpoints: Record<string, string> = {
      'ovh-eu': 'https://eu.api.ovh.com/1.0',
      'ovh-us': 'https://api.us.ovhcloud.com/1.0',
      'ovh-ca': 'https://ca.api.ovh.com/1.0'
    }
    return endpoints[endpoint] || endpoints['ovh-eu']
  }

  private async request<T>(method: string, path: string, data?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Ovh-Application': this.config.appKey,
        'X-Ovh-Consumer': this.config.consumerKey,
      }
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', path, data)
  }
}

/**
 * Client Mock pour le mode test
 * Simule les appels API avec des délais réalistes et gestion d'état
 */
class MockApiClient implements IApiClient {
  private instancesState: Map<string, Instance>

  constructor() {
    this.instancesState = new Map()
    this.initializeState()
  }

  private initializeState(): void {
    mockInstances.forEach(instance => {
      this.instancesState.set(instance.id, { ...instance })
    })
  }

  private async simulateDelay(min = 300, max = 800): Promise<void> {
    const delay = Math.random() * (max - min) + min
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  async get<T>(path: string): Promise<T> {
    await this.simulateDelay()

    // Projets cloud
    if (path === '/cloud/project') {
      return mockProjects as T
    }

    // Instances d'un projet
    const instancesMatch = path.match(/\/cloud\/project\/([^/]+)\/instance$/)
    if (instancesMatch) {
      return Array.from(this.instancesState.values()) as T
    }

    // Logs d'une instance
    const logsMatch = path.match(/\/cloud\/project\/([^/]+)\/instance\/([^/]+)\/vnc/)
    if (logsMatch) {
      return mockLogs as T
    }

    throw new Error(`Mock: Endpoint not implemented: ${path}`)
  }

  async post<T>(path: string): Promise<T> {
    await this.simulateDelay(800, 1500)

    // Démarrer une instance
    const startMatch = path.match(/\/cloud\/project\/([^/]+)\/instance\/([^/]+)\/start/)
    if (startMatch) {
      const instanceId = startMatch[2]
      const instance = this.instancesState.get(instanceId)
      if (instance) {
        instance.status = 'BUILDING'
        this.instancesState.set(instanceId, instance)
        
        // Simuler le passage à ACTIVE après quelques secondes
        setTimeout(() => {
          const inst = this.instancesState.get(instanceId)
          if (inst && inst.status === 'BUILDING') {
            inst.status = 'ACTIVE'
            this.instancesState.set(instanceId, inst)
          }
        }, 3000)
      }
      return mockResponses.startInstance as T
    }

    // Arrêter une instance
    const stopMatch = path.match(/\/cloud\/project\/([^/]+)\/instance\/([^/]+)\/stop/)
    if (stopMatch) {
      const instanceId = stopMatch[2]
      const instance = this.instancesState.get(instanceId)
      if (instance) {
        instance.status = 'SHUTOFF'
        this.instancesState.set(instanceId, instance)
      }
      return mockResponses.stopInstance as T
    }

    throw new Error(`Mock: Endpoint not implemented: ${path}`)
  }
}

/**
 * Factory pour créer le bon client selon le mode
 */
export function createApiClient(config: OVHConfig): IApiClient {
  if (config.testMode === true) {
    console.log('🧪 Mode Test activé - Utilisation des données simulées')
    return new MockApiClient()
  } else {
    console.log('🔌 Mode Production - Connexion à l\'API OVH')
    return new OVHApiClient(config)
  }
}

export type { IApiClient }
