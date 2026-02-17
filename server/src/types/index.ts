// Types partagés entre client et server

export interface Instance {
  id: string
  name: string
  status: 'ACTIVE' | 'BUILDING' | 'STOPPED' | 'SHUTOFF'
  flavorId: string
  region: string
  ipAddresses?: IPAddress[]
  created: string
  // Ajout pour la planification
  scheduleMode?: 'manual' | 'auto'
  schedule?: InstanceSchedule
}

export interface InstanceSchedule {
  startTime: string  // Format HH:mm
  stopTime: string   // Format HH:mm
  enabled: boolean
  timezone?: string
}

export interface IPAddress {
  ip: string
  type: 'public' | 'private'
}

export interface LogEntry {
  timestamp: string
  message: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface StartStopResponse {
  status: string
}

// Types pour la gestion des planifications
export interface ScheduleConfig {
  instanceId: string
  projectId: string
  startTime: string
  stopTime: string
  enabled: boolean
  timezone: string
}

export interface ScheduleUpdate {
  instanceId: string
  schedule: InstanceSchedule
}
