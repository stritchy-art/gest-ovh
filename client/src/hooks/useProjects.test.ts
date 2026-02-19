import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from './useProjects'

// Mock ovhService
vi.mock('../services/ovhService', () => ({
  default: {
    getProjects: vi.fn(() => Promise.resolve([
      { id: 'project-1', description: 'Test Project 1' },
      { id: 'project-2', description: 'Test Project 2' },
    ])),
  },
}))

describe('useProjects', () => {
  it('should load projects on mount', async () => {
    const { result } = renderHook(() => useProjects())

    expect(result.current.loading).toBe(true)
    expect(result.current.projects).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projects).toHaveLength(2)
    expect(result.current.projects[0].id).toBe('project-1')
    expect(result.current.error).toBeNull()
  })

  it('should refetch projects when refetch is called', async () => {
    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projects).toHaveLength(2)

    result.current.refetch()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projects).toHaveLength(2)
  })
})
