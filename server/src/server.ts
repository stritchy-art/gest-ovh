import express from 'express'
import cors from 'cors'
import instanceRoutes from './routes/instances.js'
import scheduleRoutes from './routes/schedules.js'
import { initScheduler } from './schedulers/cronScheduler'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/instances', instanceRoutes)
app.use('/api/schedules', scheduleRoutes)

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
