import { Router } from 'express'
import { getServerEnvConfig } from '../config/env.js'

const router = Router()

// GET /api/status - Retourne l'état du serveur
router.get('/', (req, res) => {
  const config = getServerEnvConfig()
  const isTestMode = !config.ovhAppKey || !config.ovhAppSecret || !config.ovhConsumerKey

  res.json({
    testMode: isTestMode,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

export default router
