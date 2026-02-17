import { describe, it, expect } from 'vitest'
import { hasOvhCredentials } from '../../config/env.js'

describe('env', () => {
  it('detects missing credentials', () => {
    const result = hasOvhCredentials({
      ovhEndpoint: 'ovh-eu',
      ovhAppKey: '',
      ovhAppSecret: '',
      ovhConsumerKey: ''
    })
    expect(result).toBe(false)
  })
})
