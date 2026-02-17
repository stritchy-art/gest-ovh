// Gestionnaire de cron pour la planification automatique des instances
import cron from 'node-cron'
import { getSchedules } from '../services/scheduleService.js'
import { getServerEnvConfig, hasOvhCredentials } from '../config/env.js'
import { startInstance, stopInstance } from '../services/ovhService.js'
import { logAction } from '../services/actionLogService.js'
import { actionCounter } from '../services/metricsService.js'

// Note: activeTasks n'est pas utilisé actuellement mais prêt pour une future implémentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const activeTasks = new Map<string, cron.ScheduledTask>()

/**
 * Initialise le scheduler
 * Vérifie toutes les minutes si des instances doivent être démarrées ou arrêtées
 */
export function initScheduler() {
  // Toutes les minutes
  cron.schedule('* * * * *', async () => {
    await checkSchedules()
  })

  console.log('⏰ Cron scheduler started - checking every minute')
}

/**
 * Vérifie les planifications et exécute les actions nécessaires
 */
async function checkSchedules() {
  try {
    const schedules = await getSchedules()
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const envConfig = getServerEnvConfig()
    if (!hasOvhCredentials(envConfig)) {
      console.warn('⚠️ OVH credentials manquants côté serveur. Actions planifiées ignorées.')
      return
    }

    for (const [instanceId, schedule] of Object.entries(schedules)) {
      if (!schedule.enabled) continue

      // Vérifier si c'est l'heure de démarrer
      if (schedule.startTime === currentTime) {
        console.log(`⏰ [${currentTime}] Démarrage planifié de l'instance ${instanceId}`)
        await executeScheduledAction(instanceId, schedule.projectId, 'start')
      }

      // Vérifier si c'est l'heure d'arrêter
      if (schedule.stopTime === currentTime) {
        console.log(`⏰ [${currentTime}] Arrêt planifié de l'instance ${instanceId}`)
        await executeScheduledAction(instanceId, schedule.projectId, 'stop')
      }
    }
  } catch (error) {
    console.error('Error checking schedules:', error)
  }
}

/**
 * Exécute une action planifiée (start/stop)
 */
async function executeScheduledAction(
  instanceId: string,
  projectId: string,
  action: 'start' | 'stop'
) {
  try {
    console.log(`🔄 Executing ${action} for instance ${instanceId} in project ${projectId}`)

    if (action === 'start') {
      await startInstance(projectId, instanceId)
    } else {
      await stopInstance(projectId, instanceId)
    }

    actionCounter.inc({ action, mode: 'auto', status: 'success' })
    await logAction({
      timestamp: new Date().toISOString(),
      action,
      instanceId,
      projectId,
      mode: 'auto',
      status: 'success'
    })
  } catch (error) {
    console.error(`❌ Error executing ${action} for instance ${instanceId}:`, error)
    actionCounter.inc({ action, mode: 'auto', status: 'error' })
    await logAction({
      timestamp: new Date().toISOString(),
      action,
      instanceId,
      projectId,
      mode: 'auto',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Arrête toutes les tâches cron actives
 */
export function stopScheduler() {
  activeTasks.forEach(task => task.stop())
  activeTasks.clear()
  console.log('⏸️ Cron scheduler stopped')
}
