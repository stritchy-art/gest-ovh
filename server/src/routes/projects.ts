import { Router } from 'express'
import { getProjects, getProjectDetails, getProjectSSHKeys, getProjectCurrentUsage } from '../services/ovhService.js'
import { logger } from '../services/logger.js'

const router = Router()

// POST /api/projects/list
router.post('/list', async (req, res) => {
  try {
    const projectIds = await getProjects()
    
    // Récupérer les détails de chaque projet en parallèle
    const projectsWithDetails = await Promise.all(
      projectIds.map(async (id) => {
        const details = await getProjectDetails(id)
        return details || { id, description: id }
      })
    )
    
    res.json(projectsWithDetails)
  } catch (error) {
    logger.error('API', 'Error fetching projects', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/projects/sshkeys
router.post('/sshkeys', async (req, res) => {
  try {
    const { projectId } = req.body as { projectId: string }
    
    if (!projectId) {
      logger.warn('API', 'POST /api/projects/sshkeys - Missing projectId')
      return res.status(400).json({ error: 'Missing projectId' })
    }

    logger.debug('API', `POST /api/projects/sshkeys - projectId: ${projectId}`)
    const sshKeys = await getProjectSSHKeys(projectId)
    res.json(sshKeys)
  } catch (error) {
    logger.error('API', 'Error fetching SSH keys', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// POST /api/projects/usage
router.post('/usage', async (req, res) => {
  try {
    const { projectId } = req.body as { projectId: string }
    if (!projectId) {
      logger.warn('API', 'POST /api/projects/usage - Missing projectId')
      return res.status(400).json({ error: 'Missing projectId' })
    }
    logger.debug('API', `POST /api/projects/usage - projectId: ${projectId}`)
    const usage = await getProjectCurrentUsage(projectId)
    if (!usage) {
      return res.status(503).json({ error: 'Usage data unavailable' })
    }
    res.json(usage)
  } catch (error) {
    logger.error('API', 'Error fetching project usage', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
