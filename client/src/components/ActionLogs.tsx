import { useState, useEffect } from 'react'
import ovhService from '../services/ovhService'
import type { ActionLogEntry } from '../types'

interface ActionLogsProps {
  show: boolean
  onClose: () => void
}

function ActionLogs({ show, onClose }: ActionLogsProps) {
  const [logs, setLogs] = useState<ActionLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState(200)

  useEffect(() => {
    if (show) {
      loadLogs()
    }
  }, [show, limit])

  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ovhService.getActionLogs(limit)
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  const getActionBadge = (action: string) => {
    return action === 'start' ? 'bg-success' : 'bg-danger'
  }

  const getModeBadge = (mode: string) => {
    return mode === 'auto' ? 'bg-primary' : 'bg-secondary'
  }

  const getStatusBadge = (status: string) => {
    return status === 'success' ? 'bg-success' : 'bg-danger'
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-xl modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="bi bi-clock-history me-2"></i>
              Historique des Actions
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <label className="me-2">Nombre d'entrées:</label>
                <select
                  className="form-select form-select-sm d-inline-block w-auto bg-dark text-light border-secondary"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={50}>50 dernières</option>
                  <option value={100}>100 dernières</option>
                  <option value={200}>200 dernières</option>
                  <option value={500}>500 dernières</option>
                </select>
              </div>
              
              <button 
                className="btn btn-sm btn-primary"
                onClick={loadLogs}
                disabled={loading}
              >
                <i className={`bi ${loading ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'} me-2`}></i>
                Actualiser
              </button>
            </div>

            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement de l'historique...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="alert alert-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Aucune action dans l'historique
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover table-sm">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>
                        <i className="bi bi-calendar me-1"></i>
                        Date/Heure
                      </th>
                      <th style={{ width: '10%' }}>
                        <i className="bi bi-lightning-fill me-1"></i>
                        Action
                      </th>
                      <th style={{ width: '25%' }}>
                        <i className="bi bi-hdd me-1"></i>
                        Instance
                      </th>
                      <th style={{ width: '20%' }}>
                        <i className="bi bi-folder me-1"></i>
                        Projet
                      </th>
                      <th style={{ width: '10%' }}>
                        <i className="bi bi-gear me-1"></i>
                        Mode
                      </th>
                      <th style={{ width: '10%' }}>
                        <i className="bi bi-check-circle me-1"></i>
                        Statut
                      </th>
                      <th style={{ width: '10%' }}>
                        <i className="bi bi-chat me-1"></i>
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td>
                          <small>{formatDate(log.timestamp)}</small>
                        </td>
                        <td>
                          <span className={`badge ${getActionBadge(log.action)}`}>
                            {log.action === 'start' ? (
                              <><i className="bi bi-play-fill me-1"></i>START</>
                            ) : (
                              <><i className="bi bi-stop-fill me-1"></i>STOP</>
                            )}
                          </span>
                        </td>
                        <td>
                          <small className="text-info">{log.instanceId}</small>
                        </td>
                        <td>
                          <small className="text-warning">{log.projectId}</small>
                        </td>
                        <td>
                          <span className={`badge ${getModeBadge(log.mode)}`}>
                            {log.mode === 'auto' ? (
                              <><i className="bi bi-clock me-1"></i>AUTO</>
                            ) : (
                              <><i className="bi bi-hand-index me-1"></i>MANUEL</>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(log.status)}`}>
                            {log.status === 'success' ? (
                              <><i className="bi bi-check-circle-fill me-1"></i>OK</>
                            ) : (
                              <><i className="bi bi-x-circle-fill me-1"></i>ERREUR</>
                            )}
                          </span>
                        </td>
                        <td>
                          {log.message && (
                            <small className="text-muted">{log.message}</small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-muted mt-3">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                Affichage des {logs.length} dernières actions (max: {limit})
              </small>
            </div>
          </div>

          <div className="modal-footer border-secondary">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionLogs
