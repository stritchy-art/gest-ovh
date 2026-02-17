import { Router } from 'express'
import { getInstances, startInstance, stopInstance, getInstanceLogs } from '../services/ovhService.js'
import { logAction } from '../services/actionLogService.js'
import { actionCounter } from '../services/metricsService.js'

const router = Router()

// GET /api/instances/:projectId
router.post('/list', async (req, res) => {
  try {
    const { projectId } = req.body as { projectId: string }
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' })
    }

    const instances = await getInstances(projectId)
    res.json(instances)
  } catch (error) {
    console.error('Error fetching instances:', error)
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
    console.error('Error starting instance:', error)
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
    console.error('Error stopping instance:', error)
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
    console.error('Error fetching logs:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
