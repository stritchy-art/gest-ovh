import { Router } from 'express'
import { getSchedules, saveSchedule, deleteSchedule } from '../services/scheduleService.js'
import type { ScheduleUpdate } from '../types/index.js'
import { logger } from '../services/logger.js'

const router = Router()

// GET /api/schedules
router.get('/', async (req, res) => {
  try {
    logger.debug('API', 'GET /api/schedules')
    const schedules = await getSchedules()
    logger.debug('API', `Retour ${Object.keys(schedules).length} schedules`)
    res.json(schedules)
  } catch (error) {
    logger.error('API', 'Error fetching schedules', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/schedules
router.post('/', async (req, res) => {
  try {
    const { instanceId, projectId, schedule } = req.body as {
      instanceId: string
      projectId: string
      schedule: ScheduleUpdate['schedule']
    }

    if (!instanceId || !projectId || !schedule) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const result = await saveSchedule({ instanceId, projectId, schedule })
    res.json(result)
  } catch (error) {
    console.error('Error saving schedule:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// DELETE /api/schedules/:instanceId
router.delete('/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params

    if (!instanceId) {
      return res.status(400).json({ error: 'Missing instanceId' })
    }

    await deleteSchedule(instanceId)
    res.json({ success: true })
  } catch (error) {
    logger.error('API', 'Error deleting schedule', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
