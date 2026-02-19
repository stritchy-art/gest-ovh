import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hasOvhCredentials } from '../../config/env.js'
import { getInstances } from '../ovhService.js'

describe('OVH Service', () => {
  describe('hasOvhCredentials', () => {
    it('should return false when credentials are missing', () => {
      const result = hasOvhCredentials({
        ovhEndpoint: 'ovh-eu',
        ovhAppKey: '',
        ovhAppSecret: '',
        ovhConsumerKey: ''
      })
      expect(result).toBe(false)
    })

    it('should return true when all credentials are present', () => {
      const result = hasOvhCredentials({
        ovhEndpoint: 'ovh-eu',
        ovhAppKey: 'test-key',
        ovhAppSecret: 'test-secret',
        ovhConsumerKey: 'test-consumer'
      })
      expect(result).toBe(true)
    })
  })

  describe('getInstances', () => {
    it('should return mock instances in test mode', async () => {
      const instances = await getInstances('test-project')
      
      expect(instances).toBeDefined()
      expect(Array.isArray(instances)).toBe(true)
      
      if (instances.length > 0) {
        expect(instances[0]).toHaveProperty('id')
        expect(instances[0]).toHaveProperty('name')
        expect(instances[0]).toHaveProperty('status')
      }
    })
  })
})
