import { describe, it, expect, beforeEach } from 'vitest'
import { logger } from '../logger'

describe('Logger Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have standard log methods', () => {
    expect(logger.debug).toBeDefined()
    expect(logger.info).toBeDefined()
    expect(logger.warn).toBeDefined()
    expect(logger.error).toBeDefined()
  })

  it('should have action log methods', () => {
    expect(logger.action).toBeDefined()
    expect(logger.action.start).toBeDefined()
    expect(logger.action.stop).toBeDefined()
    expect(logger.action.success).toBeDefined()
    expect(logger.action.failure).toBeDefined()
  })

  it('should format log messages with context', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    
    logger.info('TEST', 'Test message')
    
    expect(consoleSpy).toHaveBeenCalled()
    const logOutput = consoleSpy.mock.calls[0][0]
    expect(logOutput).toContain('[TEST]')
    expect(logOutput).toContain('Test message')
  })

  it('should handle error logging with stack trace', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const error = new Error('Test error')
    
    logger.error('API', 'Error occurred', error)
    
    expect(consoleSpy).toHaveBeenCalled()
    const logOutput = consoleSpy.mock.calls[0][0]
    expect(logOutput).toContain('[API]')
    expect(logOutput).toContain('Error occurred')
  })
})
