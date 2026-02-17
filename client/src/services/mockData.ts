// Données simulées pour le mode test

import type { Instance, LogEntry, StartStopResponse } from '../types'

export const mockProjects: string[] = [
  'projet-demo-1',
  'projet-demo-2',
  'projet-production'
]

export const mockInstances: Instance[] = [
  {
    id: 'demo-1234-5678-9012',
    name: 'web-server-frontend',
    status: 'ACTIVE',
    flavorId: 'd2-4',
    region: 'GRA11',
    ipAddresses: [{ ip: '51.210.100.50', type: 'public' }],
    created: '2024-01-15T10:30:00Z',
    scheduleMode: 'auto',
    schedule: {
      startTime: '08:00',
      stopTime: '18:00',
      enabled: true,
      timezone: 'Europe/Paris'
    }
  },
  {
    id: 'demo-9876-5432-1098',
    name: 'database-postgres',
    status: 'ACTIVE',
    flavorId: 'd2-8',
    region: 'GRA11',
    ipAddresses: [{ ip: '51.210.100.51', type: 'public' }],
    created: '2024-02-01T14:20:00Z',
    scheduleMode: 'manual'
  },
  {
    id: 'demo-5555-6666-7777',
    name: 'test-dev-instance',
    status: 'SHUTOFF',
    flavorId: 's1-2',
    region: 'SBG5',
    ipAddresses: [{ ip: '51.210.100.52', type: 'public' }],
    created: '2024-02-10T09:15:00Z',
    scheduleMode: 'auto',
    schedule: {
      startTime: '09:00',
      stopTime: '17:00',
      enabled: true,
      timezone: 'Europe/Paris'
    }
  },
  {
    id: 'demo-1111-2222-3333',
    name: 'api-backend-prod',
    status: 'ACTIVE',
    flavorId: 'b2-15',
    region: 'GRA9',
    ipAddresses: [{ ip: '51.210.100.53', type: 'public' }],
    created: '2023-12-05T08:45:00Z',
    scheduleMode: 'manual'
  },
  {
    id: 'demo-4444-5555-6666',
    name: 'cache-redis',
    status: 'BUILDING',
    flavorId: 'r2-15',
    region: 'GRA11',
    ipAddresses: [{ ip: '51.210.100.54', type: 'public' }],
    created: '2026-02-17T09:00:00Z',
    scheduleMode: 'manual'
  }
]

export const mockLogs: LogEntry[] = [
  { timestamp: new Date(Date.now() - 7200000).toISOString(), message: '[SYSTEM] Instance initialization started' },
  { timestamp: new Date(Date.now() - 6800000).toISOString(), message: '[BOOT] Loading kernel modules...' },
  { timestamp: new Date(Date.now() - 6400000).toISOString(), message: '[BOOT] Kernel 5.15.0-generic loaded successfully' },
  { timestamp: new Date(Date.now() - 6000000).toISOString(), message: '[NETWORK] Configuring network interfaces...' },
  { timestamp: new Date(Date.now() - 5600000).toISOString(), message: '[NETWORK] eth0: Link is up - 10Gbps Full Duplex' },
  { timestamp: new Date(Date.now() - 5200000).toISOString(), message: '[NETWORK] IP address assigned: 51.210.100.50/24' },
  { timestamp: new Date(Date.now() - 4800000).toISOString(), message: '[SSH] OpenSSH server starting on port 22' },
  { timestamp: new Date(Date.now() - 4400000).toISOString(), message: '[SSH] Server listening on 0.0.0.0:22' },
  { timestamp: new Date(Date.now() - 4000000).toISOString(), message: '[DOCKER] Docker daemon started' },
  { timestamp: new Date(Date.now() - 3600000).toISOString(), message: '[APP] Starting application services...' },
  { timestamp: new Date(Date.now() - 3200000).toISOString(), message: '[APP] Database connection established' },
  { timestamp: new Date(Date.now() - 2800000).toISOString(), message: '[APP] Cache warming completed' },
  { timestamp: new Date(Date.now() - 2400000).toISOString(), message: '[APP] HTTP server listening on port 80' },
  { timestamp: new Date(Date.now() - 2000000).toISOString(), message: '[MONITORING] Prometheus exporter started on :9090' },
  { timestamp: new Date(Date.now() - 1600000).toISOString(), message: '[HEALTH] Health check endpoint: OK' },
  { timestamp: new Date(Date.now() - 1200000).toISOString(), message: '[UPDATE] System packages updated successfully' },
  { timestamp: new Date(Date.now() - 800000).toISOString(), message: '[SECURITY] Firewall rules applied' },
  { timestamp: new Date(Date.now() - 400000).toISOString(), message: '[APP] Deployment v2.3.1 completed' },
  { timestamp: new Date(Date.now() - 120000).toISOString(), message: '[HEALTH] Health check: OK - All services running' },
  { timestamp: new Date(Date.now() - 60000).toISOString(), message: '[METRICS] CPU: 12%, Memory: 2.4GB/8GB, Disk: 45%' }
]

export const mockResponses: Record<string, StartStopResponse> = {
  startInstance: { status: 'BUILDING' },
  stopInstance: { status: 'SHUTOFF' }
}
