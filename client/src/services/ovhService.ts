// Service pour interagir avec l'API backend
import type { Instance, LogEntry, StartStopResponse, InstanceSchedule } from '../types'

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

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.apiBase}${path}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getProjects(): Promise<string[]> {
    return this.post<string[]>('/api/projects/list')
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

  async getSchedules(): Promise<Record<string, { instanceId: string; projectId: string; startTime: string; stopTime: string; enabled: boolean; timezone: string }>> {
    return this.get('/api/schedules')
  }

  async saveSchedule(instanceId: string, projectId: string, schedule: InstanceSchedule) {
    return this.post('/api/schedules', { instanceId, projectId, schedule })
  }
}

export default new OVHService()
