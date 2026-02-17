import fs from 'fs/promises'
import path from 'path'
import { getRedisClient } from './redisClient.js'
import { getServerEnvConfig } from '../config/env.js'
import { notifyAction } from './notificationService.js'

export interface ActionLogEntry {
  timestamp: string
  action: 'start' | 'stop'
  instanceId: string
  projectId: string
  mode: 'manual' | 'auto'
  status: 'success' | 'error'
  message?: string
}

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'actions.log')
const REDIS_LIST_KEY = 'action_logs'

export async function logAction(entry: ActionLogEntry): Promise<void> {
  const client = await getRedisClient()
  const { actionLogRetention = 500 } = getServerEnvConfig()

  await notifyAction(entry)

  if (client) {
    await client.lPush(REDIS_LIST_KEY, JSON.stringify(entry))
    await client.lTrim(REDIS_LIST_KEY, 0, actionLogRetention - 1)
    return
  }

  await fs.mkdir(LOG_DIR, { recursive: true })
  await fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8')
}

export async function getActionLogs(limit = 200): Promise<ActionLogEntry[]> {
  const client = await getRedisClient()

  if (client) {
    const items = await client.lRange(REDIS_LIST_KEY, 0, limit - 1)
    return items.map((item) => JSON.parse(item))
  }

  try {
    const data = await fs.readFile(LOG_FILE, 'utf-8')
    const lines = data.trim().split('\n').slice(-limit)
    return lines.map((line) => JSON.parse(line))
  } catch (error) {
    return []
  }
}
