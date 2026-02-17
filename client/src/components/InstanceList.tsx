import { useState, useEffect } from 'react'
import ovhService from '../services/ovhService'
import InstanceLogs from './InstanceLogs'
import ScheduleModal from './ScheduleModal'
import type { OVHConfig, Instance, InstanceSchedule } from '../types'

interface InstanceListProps {
  config: OVHConfig
}

function InstanceList({ config }: InstanceListProps) {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null)
  const [showLogs, setShowLogs] = useState<boolean>(false)
  const [showSchedule, setShowSchedule] = useState<boolean>(false)

  useEffect(() => {
    loadInstances()
  }, [config])

  const loadInstances = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const projects = await ovhService.getProjects(config)
      if (projects.length === 0) {
        throw new Error('Aucun projet trouvé')
      }
      
      const firstProject = projects[0]
      setProjectId(firstProject)
      
      const instancesData = await ovhService.getInstances(config, firstProject)
      setInstances(instancesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInstance = async (instance: Instance) => {
    if (!projectId) return
    
    try {
      await ovhService.startInstance(config, projectId, instance.id)
      await loadInstances()
    } catch (err) {
      alert(`Erreur lors du démarrage: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const handleStopInstance = async (instance: Instance) => {
    if (!projectId) return
    
    try {
      await ovhService.stopInstance(config, projectId, instance.id)
      await loadInstances()
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
      // TODO: Appeler l'API backend pour sauvegarder la planification
      console.log('Saving schedule for', selectedInstance.id, schedule)

      // Mettre à jour l'instance localement
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0">Projet:</label>
          <select className="form-select form-select-sm bg-dark text-light border-secondary" style={{ width: 'auto' }}>
            <option>{projectId || 'projet-demo-1'}</option>
          </select>
        </div>
        <button onClick={loadInstances} className="btn btn-primary btn-sm">
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualiser
        </button>
      </div>

      {instances.length === 0 ? (
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
              {instances.map((instance) => (
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
        </div>
      )}

      {selectedInstance && (
        <>
          <InstanceLogs
            instance={selectedInstance}
            config={config}
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
