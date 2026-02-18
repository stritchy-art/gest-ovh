// Service pour interagir avec l'API backend
import type { Instance, LogEntry, StartStopResponse, InstanceSchedule, InstanceMonitoring, SSHKey, Project } from '../types'

class OVHService {
  private apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.apiBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }

  private async get<T>(path: string, timeout = 5000): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(`${this.apiBase}${path}`, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout (${timeout}ms)`)
      }
      throw error
    }
  }

  async getProjects(): Promise<Project[]> {
    return this.post<Project[]>('/api/projects/list')
  }

  async getInstances(projectId: string): Promise<Instance[]> {
    return this.post<Instance[]>('/api/instances/list', { projectId })
  }

  async startInstance(projectId: string, instanceId: string): Promise<StartStopResponse> {
    return this.post<StartStopResponse>('/api/instances/start', { projectId, instanceId })
  }

  async stopInstance(projectId: string, instanceId: string): Promise<StartStopResponse> {
    return this.post<StartStopResponse>('/api/instances/stop', { projectId, instanceId })
  }

  async getInstanceLogs(projectId: string, instanceId: string): Promise<LogEntry[]> {
    return this.post<LogEntry[]>('/api/instances/logs', { projectId, instanceId })
  }

  async getInstanceMonitoring(projectId: string, instanceId: string): Promise<InstanceMonitoring | null> {
    return this.post<InstanceMonitoring | null>('/api/instances/monitoring', { projectId, instanceId })
  }

  async getInstanceMetadata(projectId: string, instanceId: string): Promise<Record<string, string> | null> {
    return this.post<Record<string, string> | null>('/api/instances/metadata', { projectId, instanceId })
  }

  async getProjectSSHKeys(projectId: string): Promise<SSHKey[]> {
    return this.post<SSHKey[]>('/api/projects/sshkeys', { projectId })
  }

  async getSchedules(): Promise<Record<string, { instanceId: string; projectId: string; startTime: string; stopTime: string; enabled: boolean; timezone: string }>> {
    return this.get('/api/schedules')
  }

  async saveSchedule(instanceId: string, projectId: string, schedule: InstanceSchedule) {
    return this.post('/api/schedules', { instanceId, projectId, schedule })
  }
}

export default new OVHService()
