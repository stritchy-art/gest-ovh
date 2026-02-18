import { useState, useEffect, useMemo } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useInstances } from '../hooks/useInstances'
import { DEFAULT_PAGE_SIZE, SortBy, SortDir } from '../constants'
import { formatDate, getStatusBadge } from '../utils'
import ovhService from '../services/ovhService'
import ProjectSelector from './ProjectSelector'
import InstanceFilters from './InstanceFilters'
import Pagination from './Pagination'
import InstanceLogs from './InstanceLogs'
import InstanceDetails from './InstanceDetails'
import ScheduleModal from './ScheduleModal'
import type { Instance, InstanceSchedule } from '../types'

interface InstanceListProps {
  redisAvailable?: boolean
}

function InstanceList({ redisAvailable = true }: InstanceListProps) {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects()
  const [projectId, setProjectId] = useState<string | null>(null)
  const { instances, loading: instancesLoading, error: instancesError, refetch, updateInstanceSchedule } = useInstances(projectId)
  
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [showLogs, setShowLogs] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [showSchedule, setShowSchedule] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [regionFilter, setRegionFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)

  // Set initial project when projects load
  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id)
    }
  }, [projects, projectId])

  const loading = projectsLoading || instancesLoading
  const error = projectsError || instancesError
  const handleStartInstance = async (instance: Instance) => {
    if (!projectId) return
    
    try {
      await ovhService.startInstance(projectId, instance.id)
      refetch()
    } catch (err) {
      alert(`Erreur lors du démarrage: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const handleStopInstance = async (instance: Instance) => {
    if (!projectId) return
    
    try {
      await ovhService.stopInstance(projectId, instance.id)
      refetch()
    } catch (err) {
      alert(`Erreur lors de l'arrêt: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const handleShowLogs = (instance: Instance) => {
    setSelectedInstance(instance)
    setShowLogs(true)
  }

  const handleShowDetails = (instance: Instance) => {
    setSelectedInstance(instance)
    setShowDetails(true)
  }

  const handleShowSchedule = (instance: Instance) => {
    setSelectedInstance(instance)
    setShowSchedule(true)
  }

  const handleSaveSchedule = async (schedule: InstanceSchedule) => {
    if (!selectedInstance || !projectId) return

    try {
      await ovhService.saveSchedule(selectedInstance.id, projectId, schedule)
      updateInstanceSchedule(selectedInstance.id, schedule)
      alert('Planification enregistrée avec succès !')
    } catch (err) {
      alert(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
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
        <ProjectSelector
          projects={projects}
          selectedProjectId={projectId}
          onProjectChange={setProjectId}
        />

        <InstanceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={loading}
          onRefresh={refetch}
          availableRegions={availableRegions}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des instances...</p>
        </div>
      ) : filteredInstances.length === 0 ? (
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
                    {instance.imageName && (
                      <div className="small text-info mt-1">
                        <i className="bi bi-disc me-1"></i>{instance.imageName}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(instance.status)}`}>
                      {instance.status}
                    </span>
                  </td>
                  <td>
                    <div>
                      {instance.flavorName ? (
                        <>
                          <span className="text-info fw-bold">{instance.flavorName}</span>
                          {instance.vcpus && instance.ram ? (
                            <div className="small text-muted">
                              <i className="bi bi-cpu me-1"></i>{instance.vcpus} vCPU
                              {' • '}
                              <i className="bi bi-memory me-1"></i>{instance.ram}GB RAM
                            </div>
                          ) : null}
                          {instance.monthlyCost && (
                            <div className="small text-success">
                              <i className="bi bi-currency-euro me-1"></i>{instance.monthlyCost}€/mois
                            </div>
                          )}
                          {instance.outgoingTraffic !== undefined && instance.outgoingTraffic > 0 && (
                            <div className="small text-warning">
                              <i className="bi bi-arrow-up-circle me-1"></i>{(instance.outgoingTraffic / (1024**3)).toFixed(2)}GB sortant
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">{instance.flavorId}</span>
                      )}
                    </div>
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
                        title={redisAvailable ? "Planification" : "Redis requis pour la planification"}
                        disabled={!redisAvailable}
                      >
                        <i className={`bi ${instance.scheduleMode === 'auto' && instance.schedule?.enabled ? 'bi-clock-fill' : 'bi-clock'}`}></i>
                      </button>
                      <button
                        onClick={() => handleShowDetails(instance)}
                        className="btn btn-sm btn-outline-info"
                        title="Voir les détails (métriques, metadata, SSH keys)"
                      >
                        <i className="bi bi-info-circle"></i>
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={sortedInstances.length}
            onPageChange={setPage}
          />
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
          <InstanceDetails
            instance={selectedInstance}
            projectId={projectId!}
            show={showDetails}
            onClose={() => setShowDetails(false)}
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
