import { describe, it, expect } from 'vitest'
import { formatDate, getStatusBadge } from './formatting'

describe('formatDate', () => {
  it('should format date in DD/MM/YYYY HH:mm format', () => {
    const date = '2026-02-18T15:30:00Z'
    const result = formatDate(date)
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })

  it('should pad single digits with zero', () => {
    const date = '2026-01-05T08:09:00Z'
    const result = formatDate(date)
    expect(result).toContain('05/01/2026')
    expect(result).toContain('0')
  })
})

describe('getStatusBadge', () => {
  it('should return bg-success for ACTIVE status', () => {
    expect(getStatusBadge('ACTIVE')).toBe('bg-success')
  })

  it('should return bg-secondary for SHUTOFF status', () => {
    expect(getStatusBadge('SHUTOFF')).toBe('bg-secondary')
  })

  it('should return bg-warning text-dark for BUILDING status', () => {
    expect(getStatusBadge('BUILDING')).toBe('bg-warning text-dark')
  })

  it('should return bg-danger for ERROR status', () => {
    expect(getStatusBadge('ERROR')).toBe('bg-danger')
  })

  it('should return bg-secondary for PAUSED status', () => {
    expect(getStatusBadge('PAUSED')).toBe('bg-secondary')
  })

  it('should return bg-secondary for unknown status', () => {
    expect(getStatusBadge('UNKNOWN_STATUS')).toBe('bg-secondary')
  })
})
