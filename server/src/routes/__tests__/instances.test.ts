import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import instancesRouter from '../instances.js'

const app = express()
app.use(express.json())
app.use('/api/instances', instancesRouter)

// Mock ovhService
vi.mock('../services/ovhService.js', () => ({
  getInstances: vi.fn(() => Promise.resolve([
    {
      id: 'instance-1',
      name: 'Test Instance',
      status: 'ACTIVE',
      region: 'GRA11',
      created: '2026-01-01T00:00:00Z'
    }
  ])),
  startInstance: vi.fn(() => Promise.resolve({ status: 'Instance starting' })),
  stopInstance: vi.fn(() => Promise.resolve({ status: 'Instance stopping' })),
}))

// Mock other services
vi.mock('../services/actionLogService.js', () => ({
  logAction: vi.fn(() => Promise.resolve())
}))

vi.mock('../services/metricsService.js', () => ({
  actionCounter: {
    inc: vi.fn()
  }
}))

describe('Instances Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/instances/list', () => {
    it('should return instances for valid projectId', async () => {
      const response = await request(app)
        .post('/api/instances/list')
        .send({ projectId: 'test-project' })
        .expect(200)

      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('status')
    })

    it('should return 400 if projectId is missing', async () => {
      const response = await request(app)
        .post('/api/instances/list')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Missing projectId')
    })
  })

  describe('POST /api/instances/start', () => {
    it('should start an instance successfully', async () => {
      const response = await request(app)
        .post('/api/instances/start')
        .send({ 
          projectId: 'test-project',
          instanceId: 'instance-1'
        })
        .expect(200)

      expect(response.body).toHaveProperty('status', 'Instance starting')
    })

    it('should return 400 if parameters are missing', async () => {
      const response = await request(app)
        .post('/api/instances/start')
        .send({ projectId: 'test-project' })
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Missing required parameters')
    })
  })

  describe('POST /api/instances/stop', () => {
    it('should stop an instance successfully', async () => {
      const response = await request(app)
        .post('/api/instances/stop')
        .send({ 
          projectId: 'test-project',
          instanceId: 'instance-1'
        })
        .expect(200)

      expect(response.body).toHaveProperty('status', 'Instance stopping')
    })

    it('should return 400 if parameters are missing', async () => {
      const response = await request(app)
        .post('/api/instances/stop')
        .send({ instanceId: 'instance-1' })
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Missing required parameters')
    })
  })
})
