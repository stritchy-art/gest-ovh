// Service pour interagir avec l'API OVH
// Utilise la couche d'abstraction apiClient pour gérer les appels réels ou mockés

import { createApiClient, type IApiClient } from './apiClient'
import type { OVHConfig, Instance, LogEntry, StartStopResponse } from '../types'

class OVHService {
  private client: IApiClient | null = null

  /**
   * Initialise le client API avec la configuration fournie
   */
  initialize(config: OVHConfig): void {
    this.client = createApiClient(config)
  }

  /**
   * Vérifie que le client est initialisé
   */
  private ensureInitialized(): void {
    if (!this.client) {
      throw new Error('Service OVH non initialisé. Appelez initialize() d\'abord.')
    }
  }

  /**
   * Récupère la liste des projets cloud
   */
  async getProjects(config: OVHConfig): Promise<string[]> {
    this.initialize(config)
    this.ensureInitialized()
    try {
      return await this.client!.get<string[]>('/cloud/project')
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  }

  /**
   * Récupère la liste des instances d'un projet
   */
  async getInstances(config: OVHConfig, projectId: string): Promise<Instance[]> {
    this.initialize(config)
    this.ensureInitialized()
    try {
      return await this.client!.get<Instance[]>(`/cloud/project/${projectId}/instance`)
    } catch (error) {
      console.error('Error fetching instances:', error)
      throw error
    }
  }

  /**
   * Démarre une instance
   */
  async startInstance(config: OVHConfig, projectId: string, instanceId: string): Promise<StartStopResponse> {
    this.initialize(config)
    this.ensureInitialized()
    try {
      return await this.client!.post<StartStopResponse>(`/cloud/project/${projectId}/instance/${instanceId}/start`)
    } catch (error) {
      console.error('Error starting instance:', error)
      throw error
    }
  }

  /**
   * Arrête une instance
   */
  async stopInstance(config: OVHConfig, projectId: string, instanceId: string): Promise<StartStopResponse> {
    this.initialize(config)
    this.ensureInitialized()
    try {
      return await this.client!.post<StartStopResponse>(`/cloud/project/${projectId}/instance/${instanceId}/stop`)
    } catch (error) {
      console.error('Error stopping instance:', error)
      throw error
    }
  }

  /**
   * Récupère les logs d'une instance
   */
  async getInstanceLogs(config: OVHConfig, projectId: string, instanceId: string): Promise<LogEntry[]> {
    this.initialize(config)
    this.ensureInitialized()
    try {
      return await this.client!.get<LogEntry[]>(`/cloud/project/${projectId}/instance/${instanceId}/vnc`)
    } catch (error) {
      console.error('Error fetching instance logs:', error)
      throw error
    }
  }
}

// Export une instance unique du service
export default new OVHService()
