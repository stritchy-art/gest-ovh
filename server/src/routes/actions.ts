import { Router } from 'express'
import { getActionLogs } from '../services/actionLogService.js'

const router = Router()

// GET /api/actions?limit=200
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 200
    const logs = await getActionLogs(Number.isNaN(limit) ? 200 : limit)
    res.json(logs)
  } catch (error) {
    console.error('Error fetching action logs:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

export default router
