import express from 'express'
import cors from 'cors'
import instanceRoutes from './routes/instances.js'
import scheduleRoutes from './routes/schedules.js'
import actionRoutes from './routes/actions.js'
import projectRoutes from './routes/projects.js'
import statusRoutes from './routes/status.js'
import dotenv from 'dotenv'
import { initScheduler } from './schedulers/cronScheduler.js'
import { apiRequestHistogram, getMetrics } from './services/metricsService.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  const end = apiRequestHistogram.startTimer({
    route: req.path,
    method: req.method
  })

  res.on('finish', () => {
    end({ status: String(res.statusCode) })
  })

  next()
})

// Routes
app.use('/api/instances', instanceRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/actions', actionRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/status', statusRoutes)

// Metrics
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send(await getMetrics())
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialiser le scheduler au démarrage
initScheduler()

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`⏰ Cron scheduler initialized`)
})
