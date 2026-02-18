// Service de données de test (mock)
import type { Instance, LogEntry } from '../types/index.js'

export function getMockInstances(): Instance[] {
  return [
    {
      id: 'demo-1234-5678-9012',
      name: 'web-server-frontend',
      status: 'ACTIVE',
      flavorId: 'd2-4',
      imageId: 'ubuntu-22.04',
      region: 'GRA11',
      ipAddresses: [{ ip: '51.210.100.50', type: 'public' }],
      created: '2024-01-15T11:30:00Z',
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
      imageId: 'ubuntu-22.04',
      region: 'GRA11',
      ipAddresses: [{ ip: '51.210.100.51', type: 'public' }],
      created: '2024-02-01T15:20:00Z',
      scheduleMode: 'manual'
    },
    {
      id: 'demo-5555-6666-7777',
      name: 'test-dev-instance',
      status: 'SHUTOFF',
      flavorId: 's1-2',
      imageId: 'debian-12',
      region: 'SBG5',
      ipAddresses: [{ ip: '51.210.100.52', type: 'public' }],
      created: '2024-02-10T10:15:00Z',
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
      imageId: 'ubuntu-22.04',
      region: 'GRA9',
      ipAddresses: [{ ip: '51.210.100.53', type: 'public' }],
      created: '2023-12-05T09:45:00Z',
      scheduleMode: 'manual'
    },
    {
      id: 'demo-4444-5555-6666',
      name: 'cache-redis',
      status: 'BUILDING',
      flavorId: 'r2-15',
      imageId: 'ubuntu-22.04',
      region: 'GRA11',
      ipAddresses: [{ ip: '51.210.100.54', type: 'public' }],
      created: '2026-02-17T10:00:00Z',
      scheduleMode: 'manual'
    }
  ]
}

export function getMockLogs(): LogEntry[] {
  const logs: LogEntry[] = []
  const baseTime = Date.now() - 3600000 // 1 heure avant

  for (let i = 0; i < 20; i++) {
    logs.push({
      timestamp: new Date(baseTime + i * 180000).toISOString(),
      message: `[INFO] ${getRandomLogMessage()}`
    })
  }

  return logs
}

function getRandomLogMessage(): string {
  const messages = [
    'System boot completed',
    'Network interface initialized',
    'Service started successfully',
    'Health check passed',
    'Connection established',
    'Request processed',
    'Cache updated',
    'Scheduled task executed',
    'Backup completed',
    'Monitoring data sent'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

export async function simulateDelay(min = 500, max = 1500): Promise<void> {
  const delay = Math.random() * (max - min) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}
