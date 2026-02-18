// Service de gestion des planifications (stockage en fichier JSON)
import fs from 'fs/promises'
import path from 'path'
import type { ScheduleUpdate } from '../types/index.js'
import { getRedisClient } from './redisClient.js'
import { logger } from './logger.js'

const SCHEDULES_FILE = path.join(process.cwd(), 'schedules.json')
const REDIS_HASH_KEY = 'schedules'

interface ScheduleData {
  instanceId: string
  projectId: string
  startTime: string
  stopTime: string
  enabled: boolean
  timezone: string
}

/**
 * Charge les planifications depuis le fichier
 */
export async function getSchedules(): Promise<Record<string, ScheduleData>> {
  logger.debug('SCHEDULE', 'getSchedules appelé')
  
  try {
    const client = await getRedisClient()
    if (client) {
      const data = await client.hGetAll(REDIS_HASH_KEY)
      const result: Record<string, ScheduleData> = {}
      for (const [key, value] of Object.entries(data)) {
        result[key] = JSON.parse(value)
      }
      logger.debug('SCHEDULE', `${Object.keys(result).length} schedules chargés depuis Redis`)
      return result
    }
  } catch (error) {
    logger.error('SCHEDULE', 'Erreur lecture Redis, fallback vers fichier', error)
  }

  // Fallback vers fichier JSON
  try {
    const data = await fs.readFile(SCHEDULES_FILE, 'utf-8')
    const schedules = JSON.parse(data)
    logger.debug('SCHEDULE', `${Object.keys(schedules).length} schedules chargés depuis fichier`)
    return schedules
  } catch (error) {
    logger.debug('SCHEDULE', 'Aucun fichier de schedules, retour objet vide')
    return {}
  }
}

/**
 * Sauvegarde une planification
 */
export async function saveSchedule(data: {
  instanceId: string
  projectId: string
  schedule: ScheduleUpdate['schedule']
}): Promise<ScheduleData> {
  const schedules = await getSchedules()

  const scheduleData: ScheduleData = {
    instanceId: data.instanceId,
    projectId: data.projectId,
    startTime: data.schedule.startTime,
    stopTime: data.schedule.stopTime,
    enabled: data.schedule.enabled,
    timezone: data.schedule.timezone || 'Europe/Paris'
  }

  schedules[data.instanceId] = scheduleData

  const client = await getRedisClient()
  if (client) {
    await client.hSet(REDIS_HASH_KEY, data.instanceId, JSON.stringify(scheduleData))
  } else {
    await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), 'utf-8')
  }

  console.log(`✅ Schedule saved for instance ${data.instanceId}:`, scheduleData)

  return scheduleData
}

/**
 * Supprime une planification
 */
export async function deleteSchedule(instanceId: string): Promise<void> {
  const schedules = await getSchedules()

  if (schedules[instanceId]) {
    delete schedules[instanceId]

    const client = await getRedisClient()
    if (client) {
      await client.hDel(REDIS_HASH_KEY, instanceId)
    } else {
      await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), 'utf-8')
    }

    console.log(`🗑️ Schedule deleted for instance ${instanceId}`)
  }
}

/**
 * Récupère une planification spécifique
 */
export async function getSchedule(instanceId: string): Promise<ScheduleData | null> {
  const schedules = await getSchedules()
  return schedules[instanceId] || null
}
