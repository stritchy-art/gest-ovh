import { useState, useEffect } from 'react'
import ovhService from '../services/ovhService'
import type { Instance, OVHConfig, LogEntry } from '../types'

interface InstanceLogsProps {
  instance: Instance
  config: OVHConfig
  projectId: string
  show: boolean
  onClose: () => void
}

function InstanceLogs({ instance, config, projectId, show, onClose }: InstanceLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (show) {
      loadLogs()
    }
  }, [show, instance.id])

  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const logsData = await ovhService.getInstanceLogs(config, projectId, instance.id)
      setLogs(logsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des logs')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content bg-dark">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="bi bi-file-text me-2"></i>
              Logs - {instance.name}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="alert alert-info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Aucun log disponible
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-sm table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Date</th>
                      <th style={{ width: '75%' }}>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td>
                          <small className="text-muted">
                            {new Date(log.timestamp).toLocaleString('fr-FR')}
                          </small>
                        </td>
                        <td>
                          <code className="text-light">{log.message}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
            <button type="button" className="btn btn-primary" onClick={loadLogs}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstanceLogs
