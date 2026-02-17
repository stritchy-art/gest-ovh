import { useState, useEffect, useMemo } from 'react'
import ovhService from '../services/ovhService'
import InstanceLogs from './InstanceLogs'
import ScheduleModal from './ScheduleModal'
import type { Instance, InstanceSchedule } from '../types'

function InstanceList() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [showLogs, setShowLogs] = useState<boolean>(false)
  const [showSchedule, setShowSchedule] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [regionFilter, setRegionFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (projectId) {
      loadInstances(projectId)
    }
  }, [projectId])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const projectList = await ovhService.getProjects()
      if (projectList.length === 0) {
        throw new Error('Aucun projet trouvé')
      }

      setProjects(projectList)
      setProjectId((prev) => prev && projectList.includes(prev) ? prev : projectList[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loadInstances = async (selectedProjectId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const [instancesData, schedules] = await Promise.all([
        ovhService.getInstances(selectedProjectId),
        ovhService.getSchedules()
      ])

      const instancesWithSchedule = instancesData.map((instance) => {
        const schedule = schedules[instance.id]
        if (schedule) {
          return {
            ...instance,
            scheduleMode: schedule.enabled ? 'auto' : 'manual',
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
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInstance = async (instance: Instance) => {
    if (!projectId) return
    
    try {
      await ovhService.startInstance(projectId, instance.id)
      await loadInstances(projectId)
    } catch (err) {
      alert(`Erreur lors du démarrage: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const handleStopInstance = async (instance: Instance) => {
    if (!projectId) return
    
    try {
      await ovhService.stopInstance(projectId, instance.id)
      await loadInstances(projectId)
    } catch (err) {
      alert(`Erreur lors de l'arrêt: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const handleShowLogs = (instance: Instance) => {
    setSelectedInstance(instance)
    setShowLogs(true)
  }

  const handleShowSchedule = (instance: Instance) => {
    setSelectedInstance(instance)
    setShowSchedule(true)
  }

  const handleSaveSchedule = async (schedule: InstanceSchedule) => {
    if (!selectedInstance || !projectId) return

    try {
      await ovhService.saveSchedule(selectedInstance.id, projectId, schedule)

      setInstances(prev => prev.map(inst =>
        inst.id === selectedInstance.id
          ? { ...inst, scheduleMode: schedule.enabled ? 'auto' : 'manual', schedule }
          : inst
      ))

      alert('Planification enregistrée avec succès !')
    } catch (err) {
      alert(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const getStatusBadge = (status: string): string => {
    const badges: Record<string, string> = {
      'ACTIVE': 'bg-success',
      'SHUTOFF': 'bg-secondary',
      'BUILDING': 'bg-warning text-dark',
      'ERROR': 'bg-danger',
      'PAUSED': 'bg-secondary'
    }
    return badges[status] || 'bg-secondary'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter, regionFilter, sortBy, sortDir, pageSize])

  const filteredInstances = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return instances.filter((instance) => {
      const matchTerm = term.length === 0
        || instance.name.toLowerCase().includes(term)
        || instance.id.toLowerCase().includes(term)

      const matchStatus = statusFilter === 'ALL' || instance.status === statusFilter
      const matchRegion = regionFilter === 'ALL' || instance.region === regionFilter
      return matchTerm && matchStatus && matchRegion
    })
  }, [instances, searchTerm, statusFilter, regionFilter])

  const availableRegions = useMemo(() => {
    return Array.from(new Set(instances.map((instance) => instance.region))).sort()
  }, [instances])

  const sortedInstances = useMemo(() => {
    const sorted = [...filteredInstances]
    sorted.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status)
      } else {
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime()
      }
      return sortDir === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredInstances, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedInstances.length / pageSize))
  const pagedInstances = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedInstances.slice(start, start + pageSize)
  }, [sortedInstances, page, pageSize])

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3">Chargement des instances...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="display-6 mb-1">
          <i className="bi bi-layers-fill me-2"></i>
          Instances Cloud
        </h1>
        <p className="text-muted">Gestion de vos instances OVH Cloud Public</p>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0">Projet:</label>
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: 'auto' }}
            value={projectId ?? ''}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            type="text"
            className="form-control form-control-sm bg-dark text-light border-secondary"
            placeholder="Rechercher par nom ou ID"
            style={{ width: 220 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous statuts</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SHUTOFF">SHUTOFF</option>
            <option value="BUILDING">BUILDING</option>
          </select>

          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: 140 }}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="ALL">Toutes régions</option>
            {availableRegions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: 140 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'status')}
          >
            <option value="name">Tri: Nom</option>
            <option value="created">Tri: Date</option>
            <option value="status">Tri: Statut</option>
          </select>

          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: 120 }}
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>

          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: 120 }}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>

          <button
            onClick={() => projectId && loadInstances(projectId)}
            className="btn btn-primary btn-sm"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Actualiser
          </button>
        </div>
      </div>

      {filteredInstances.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle-fill me-2"></i>
          Aucune instance trouvée
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>
                  <i className="bi bi-tag-fill me-2"></i>
                  Nom
                </th>
                <th style={{ width: '10%' }}>
                  <i className="bi bi-circle-fill me-2"></i>
                  Status
                </th>
                <th style={{ width: '10%' }}>
                  <i className="bi bi-hdd-rack-fill me-2"></i>
                  Type
                </th>
                <th style={{ width: '10%' }}>
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  Région
                </th>
                <th style={{ width: '15%' }}>
                  <i className="bi bi-globe me-2"></i>
                  IP Publique
                </th>
                <th style={{ width: '15%' }}>
                  <i className="bi bi-calendar-check me-2"></i>
                  Créée le
                </th>
                <th style={{ width: '20%' }}>
                  <i className="bi bi-gear-fill me-2"></i>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedInstances.map((instance) => (
                <tr key={instance.id}>
                  <td>
                    <div className="fw-bold">{instance.name}</div>
                    <small className="text-muted">{instance.id}</small>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(instance.status)}`}>
                      {instance.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-info">{instance.flavorId}</span>
                  </td>
                  <td>
                    {instance.region}
                  </td>
                  <td>
                    {instance.ipAddresses && instance.ipAddresses.length > 0 ? (
                      <span className="text-success">{instance.ipAddresses[0].ip}</span>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {formatDate(instance.created)}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {instance.status === 'ACTIVE' || instance.status === 'BUILDING' ? (
                        <button
                          onClick={() => handleStopInstance(instance)}
                          className="btn btn-sm btn-outline-danger"
                          disabled={instance.status === 'BUILDING'}
                        >
                          <i className="bi bi-stop-circle me-1"></i>
                          {instance.status === 'BUILDING' ? 'BUILDING' : 'Arrêter'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartInstance(instance)}
                          className="btn btn-sm btn-outline-success"
                        >
                          <i className="bi bi-play-circle me-1"></i>
                          Démarrer
                        </button>
                      )}
                      <button
                        onClick={() => handleShowSchedule(instance)}
                        className={`btn btn-sm ${instance.scheduleMode === 'auto' && instance.schedule?.enabled ? 'btn-warning' : 'btn-outline-secondary'}`}
                        title="Planification"
                      >
                        <i className={`bi ${instance.scheduleMode === 'auto' && instance.schedule?.enabled ? 'bi-clock-fill' : 'bi-clock'}`}></i>
                      </button>
                      <button
                        onClick={() => handleShowLogs(instance)}
                        className="btn btn-sm btn-outline-primary"
                        title="Voir les logs"
                      >
                        <i className="bi bi-list-ul"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              {sortedInstances.length} instance(s) — page {page} / {totalPages}
            </small>

            <div className="btn-group btn-group-sm" role="group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                «
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInstance && (
        <>
          <InstanceLogs
            instance={selectedInstance}
            projectId={projectId!}
            show={showLogs}
            onClose={() => setShowLogs(false)}
          />
          <ScheduleModal
            instance={selectedInstance}
            show={showSchedule}
            onClose={() => setShowSchedule(false)}
            onSave={handleSaveSchedule}
          />
        </>
      )}
    </>
  )
}

export default InstanceList
