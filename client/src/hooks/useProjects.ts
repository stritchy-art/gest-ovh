import { useState, useEffect } from 'react'
import ovhService from '../services/ovhService'
import type { Project } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const projectList = await ovhService.getProjects()
      if (projectList.length === 0) {
        throw new Error('Aucun projet trouvé')
      }
      setProjects(projectList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return { projects, loading, error, refetch: loadProjects }
}
