// Gestionnaire de cron pour la planification automatique des instances
import cron from 'node-cron'
import { getSchedules } from '../services/scheduleService.js'

// Map pour stocker les tâches cron actives
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
    // TODO: Implémenter l'appel à l'API OVH
    // Pour l'instant, on logue juste l'action
    console.log(`🔄 Executing ${action} for instance ${instanceId} in project ${projectId}`)

    // Dans une version complète, on devrait :
    // 1. Récupérer la config OVH depuis une source sécurisée (variables d'environnement, vault, etc.)
    // 2. Appeler l'API OVH pour start/stop
    // 3. Logger le résultat

    // Exemple:
    // const result = await (action === 'start' ? startInstance : stopInstance)(config, projectId, instanceId)
    // console.log(`✅ ${action} completed:`, result)

  } catch (error) {
    console.error(`❌ Error executing ${action} for instance ${instanceId}:`, error)
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
