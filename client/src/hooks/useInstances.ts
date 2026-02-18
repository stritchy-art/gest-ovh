import { useState, useEffect } from 'react'
import ovhService from '../services/ovhService'
import type { Instance, InstanceSchedule } from '../types'

export function useInstances(projectId: string | null) {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadInstances(projectId)
    }
  }, [projectId])

  const loadInstances = async (selectedProjectId: string) => {
    setLoading(true)
    setError(null)

    try {
      const [instancesData, schedules] = await Promise.all([
        ovhService.getInstances(selectedProjectId),
        ovhService.getSchedules().catch(() => ({}))
      ])

      const instancesWithSchedule: Instance[] = instancesData.map((instance) => {
        const schedule = schedules[instance.id]
        if (schedule) {
          return {
            ...instance,
            scheduleMode: 'auto' as const,
            schedule: {
              startTime: schedule.startTime,
              stopTime: schedule.stopTime,
              enabled: schedule.enabled,
              timezone: schedule.timezone
            }
          }
        }
        return { ...instance, scheduleMode: 'manual' as const }
      })

      setInstances(instancesWithSchedule)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const updateInstanceSchedule = (instanceId: string, schedule: InstanceSchedule) => {
    setInstances(prev => prev.map(inst =>
      inst.id === instanceId
        ? { ...inst, scheduleMode: schedule.enabled ? 'auto' : 'manual', schedule }
        : inst
    ))
  }

  return {
    instances,
    loading,
    error,
    refetch: projectId ? () => loadInstances(projectId) : () => {},
    updateInstanceSchedule
  }
}
