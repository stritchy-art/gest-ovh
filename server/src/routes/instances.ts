import { Router } from 'express'
import { 
  getInstances, 
  startInstance, 
  stopInstance, 
  getInstanceLogs,
  getInstanceMonitoring,
  getInstanceMetadata
} from '../services/ovhService.js'
import { logAction } from '../services/actionLogService.js'
import { actionCounter } from '../services/metricsService.js'
import { logger } from '../services/logger.js'

const router = Router()

// GET /api/instances/:projectId
router.post('/list', async (req, res) => {
  try {
    const { projectId } = req.body as { projectId: string }
    
    if (!projectId) {
      logger.warn('INST', 'POST /api/instances/list - Missing projectId')
      return res.status(400).json({ error: 'Missing projectId' })
    }

    logger.debug('INST', `POST /api/instances/list - projectId: ${projectId}`)
    const instances = await getInstances(projectId)
    logger.info('INST', `Retour ${instances.length} instances pour projet ${projectId}`)
    logger.debug('INST', 'Instances data', instances)
    res.json(instances)
  } catch (error) {
    logger.error('INST', 'Error fetching instances', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/start
router.post('/start', async (req, res) => {
  try {
    const { projectId, instanceId } = req.body as { 
      projectId: string
      instanceId: string 
    }

    if (!projectId || !instanceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const result = await startInstance(projectId, instanceId)
    actionCounter.inc({ action: 'start', mode: 'manual', status: 'success' })
    await logAction({
      timestamp: new Date().toISOString(),
      action: 'start',
      instanceId,
      projectId,
      mode: 'manual',
      status: 'success'
    })
    res.json(result)
  } catch (error) {
    logger.error('INST', 'Error starting instance', error)
    actionCounter.inc({ action: 'start', mode: 'manual', status: 'error' })
    await logAction({
      timestamp: new Date().toISOString(),
      action: 'start',
      instanceId: req.body?.instanceId ?? 'unknown',
      projectId: req.body?.projectId ?? 'unknown',
      mode: 'manual',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/stop
router.post('/stop', async (req, res) => {
  try {
    const { projectId, instanceId } = req.body as { 
      projectId: string
      instanceId: string 
    }

    if (!projectId || !instanceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const result = await stopInstance(projectId, instanceId)
    actionCounter.inc({ action: 'stop', mode: 'manual', status: 'success' })
    await logAction({
      timestamp: new Date().toISOString(),
      action: 'stop',
      instanceId,
      projectId,
      mode: 'manual',
      status: 'success'
    })
    res.json(result)
  } catch (error) {
    logger.error('INST', 'Error stopping instance', error)
    actionCounter.inc({ action: 'stop', mode: 'manual', status: 'error' })
    await logAction({
      timestamp: new Date().toISOString(),
      action: 'stop',
      instanceId: req.body?.instanceId ?? 'unknown',
      projectId: req.body?.projectId ?? 'unknown',
      mode: 'manual',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/logs
router.post('/logs', async (req, res) => {
  try {
    const { projectId, instanceId } = req.body as { 
      projectId: string
      instanceId: string 
    }

    if (!projectId || !instanceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const logs = await getInstanceLogs(projectId, instanceId)
    res.json(logs)
  } catch (error) {
    logger.error('INST', 'Error fetching logs', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/monitoring
router.post('/monitoring', async (req, res) => {
  try {
    const { projectId, instanceId } = req.body as { 
      projectId: string
      instanceId: string 
    }

    if (!projectId || !instanceId) {
      logger.warn('INST', 'POST /api/instances/monitoring - Missing parameters')
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    logger.debug('INST', `POST /api/instances/monitoring - projectId: ${projectId}, instanceId: ${instanceId}`)
    const monitoring = await getInstanceMonitoring(projectId, instanceId)
    res.json(monitoring)
  } catch (error) {
    logger.error('INST', 'Error fetching monitoring data', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/metadata
router.post('/metadata', async (req, res) => {
  try {
    const { projectId, instanceId } = req.body as { 
      projectId: string
      instanceId: string 
    }

    if (!projectId || !instanceId) {
      logger.warn('INST', 'POST /api/instances/metadata - Missing parameters')
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    logger.debug('INST', `POST /api/instances/metadata - projectId: ${projectId}, instanceId: ${instanceId}`)
    const metadata = await getInstanceMetadata(projectId, instanceId)
    res.json(metadata)
  } catch (error) {
    logger.error('INST', 'Error fetching metadata', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
