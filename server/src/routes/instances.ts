import { Router } from 'express'
import { getInstances, startInstance, stopInstance, getInstanceLogs } from '../services/ovhService'
import type { OVHConfig } from '../types/index.js'

const router = Router()

// GET /api/instances/:projectId
router.post('/list', async (req, res) => {
  try {
    const { config, projectId } = req.body as { config: OVHConfig, projectId: string }
    
    if (!config || !projectId) {
      return res.status(400).json({ error: 'Missing config or projectId' })
    }

    const instances = await getInstances(config, projectId)
    res.json(instances)
  } catch (error) {
    console.error('Error fetching instances:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/start
router.post('/start', async (req, res) => {
  try {
    const { config, projectId, instanceId } = req.body as { 
      config: OVHConfig
      projectId: string
      instanceId: string 
    }

    if (!config || !projectId || !instanceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const result = await startInstance(config, projectId, instanceId)
    res.json(result)
  } catch (error) {
    console.error('Error starting instance:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/stop
router.post('/stop', async (req, res) => {
  try {
    const { config, projectId, instanceId } = req.body as { 
      config: OVHConfig
      projectId: string
      instanceId: string 
    }

    if (!config || !projectId || !instanceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const result = await stopInstance(config, projectId, instanceId)
    res.json(result)
  } catch (error) {
    console.error('Error stopping instance:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/instances/logs
router.post('/logs', async (req, res) => {
  try {
    const { config, projectId, instanceId } = req.body as { 
      config: OVHConfig
      projectId: string
      instanceId: string 
    }

    if (!config || !projectId || !instanceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    const logs = await getInstanceLogs(config, projectId, instanceId)
    res.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
