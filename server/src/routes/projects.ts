import { Router } from 'express'
import { getProjects } from '../services/ovhService.js'

const router = Router()

// POST /api/projects/list
router.post('/list', async (req, res) => {
  try {
    const projects = await getProjects()
    res.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
