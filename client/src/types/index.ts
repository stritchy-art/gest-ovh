// Types pour les données OVH

export interface Project {
  id: string
  description: string
}

export interface Instance {
  id: string
  name: string
  status: 'ACTIVE' | 'BUILDING' | 'STOPPED' | 'SHUTOFF'
  flavorId: string
  region: string
  ipAddresses?: IPAddress[]
  created: string
  // Infos enrichies
  flavorName?: string
  vcpus?: number
  ram?: number // En GB
  disk?: number // En GB
  monthlyCost?: string // En euros
  imageName?: string
  imageType?: string
  outgoingTraffic?: number // En bytes
  // Ajout pour la planification
  scheduleMode?: 'manual' | 'auto'
  schedule?: InstanceSchedule
  // Métriques et monitoring
  monitoring?: InstanceMonitoring
  metadata?: Record<string, string>
  sshKeys?: SSHKey[]
}

export interface InstanceMonitoring {
  cpu?: MetricData[]
  memory?: MetricData[]
  disk?: MetricData[]
}

export interface MetricData {
  timestamp: number
  value: number
}

export interface SSHKey {
  id: string
  name: string
  publicKey: string
  fingerprint?: string
  regions?: string[]
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
