import { useState, useEffect } from 'react'
import ovhService from '../services/ovhService'
import type { Instance, InstanceMonitoring, SSHKey } from '../types'

interface InstanceDetailsProps {
  instance: Instance
  projectId: string
  show: boolean
  onClose: () => void
}

function InstanceDetails({ instance, projectId, show, onClose }: InstanceDetailsProps) {
  const [monitoring, setMonitoring] = useState<InstanceMonitoring | null>(null)
  const [metadata, setMetadata] = useState<Record<string, string> | null>(null)
  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'monitoring' | 'metadata' | 'sshkeys'>('sshkeys')

  useEffect(() => {
    if (show) {
      loadDetails()
    }
  }, [show, instance.id])

  const loadDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [monitoringData, metadataData, sshKeysData] = await Promise.all([
        ovhService.getInstanceMonitoring(projectId, instance.id).catch(() => null),
        ovhService.getInstanceMetadata(projectId, instance.id).catch(() => null),
        ovhService.getProjectSSHKeys(projectId).catch(() => [])
      ])
      
      setMonitoring(monitoringData)
      setMetadata(metadataData)
      setSSHKeys(sshKeysData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content bg-dark">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="bi bi-info-circle me-2"></i>
              Détails - {instance.name}
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
            ) : (
              <>
                {/* Tabs Navigation */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'sshkeys' ? 'active' : ''}`}
                      onClick={() => setActiveTab('sshkeys')}
                    >
                      <i className="bi bi-key me-2"></i>
                      Clés SSH ({sshKeys.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'monitoring' ? 'active' : ''}`}
                      onClick={() => setActiveTab('monitoring')}
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      Métriques
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'metadata' ? 'active' : ''}`}
                      onClick={() => setActiveTab('metadata')}
                    >
                      <i className="bi bi-tags me-2"></i>
                      Metadata
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* SSH Keys Tab */}
                  {activeTab === 'sshkeys' && (
                    <div className="tab-pane fade show active">
                      {sshKeys.length > 0 ? (
                        <div className="row g-3">
                          {sshKeys.map((key) => (
                            <div key={key.id} className="col-12">
                              <div className="card bg-dark border-secondary">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                  <span>
                                    <i className="bi bi-key-fill me-2"></i>
                                    {key.name}
                                  </span>
                                  {key.regions && key.regions.length > 0 && (
                                    <span className="badge bg-secondary">
                                      {key.regions.join(', ')}
                                    </span>
                                  )}
                                </div>
                                <div className="card-body">
                                  <div className="mb-2">
                                    <small className="text-muted">ID:</small>
                                    <code className="ms-2 text-info">{key.id}</code>
                                  </div>
                                  {key.fingerprint && (
                                    <div className="mb-2">
                                      <small className="text-muted">Empreinte:</small>
                                      <code className="ms-2 text-warning">{key.fingerprint}</code>
                                    </div>
                                  )}
                                  <div className="mb-0">
                                    <small className="text-muted">Clé publique:</small>
                                    <div className="mt-1">
                                      <textarea
                                        className="form-control form-control-sm bg-dark text-light font-monospace"
                                        rows={3}
                                        readOnly
                                        value={key.publicKey}
                                        style={{ fontSize: '0.75rem' }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          Aucune clé SSH associée au projet
                        </div>
                      )}
                    </div>
                  )}

                  {/* Monitoring Tab */}
                  {activeTab === 'monitoring' && (
                    <div className="tab-pane fade show active">
                      {monitoring ? (
                        <div className="row g-3">
                          {/* CPU Metrics */}
                          {monitoring.cpu && monitoring.cpu.length > 0 && (
                            <div className="col-md-4">
                              <div className="card bg-dark border-secondary">
                                <div className="card-header bg-primary">
                                  <i className="bi bi-cpu me-2"></i>
                                  CPU
                                </div>
                                <div className="card-body">
                                  <div className="table-responsive">
                                    <table className="table table-dark table-sm">
                                      <thead>
                                        <tr>
                                          <th>Horodatage</th>
                                          <th className="text-end">Valeur (%)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {monitoring.cpu.slice(-5).map((metric, idx) => (
                                          <tr key={idx}>
                                            <td>
                                              <small className="text-muted">
                                                {new Date(metric.timestamp).toLocaleString('fr-FR')}
                                              </small>
                                            </td>
                                            <td className="text-end">
                                              <span className={`badge ${metric.value > 80 ? 'bg-danger' : metric.value > 50 ? 'bg-warning' : 'bg-success'}`}>
                                                {metric.value.toFixed(1)}%
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Memory Metrics */}
                          {monitoring.memory && monitoring.memory.length > 0 && (
                            <div className="col-md-4">
                              <div className="card bg-dark border-secondary">
                                <div className="card-header bg-info">
                                  <i className="bi bi-memory me-2"></i>
                                  RAM
                                </div>
                                <div className="card-body">
                                  <div className="table-responsive">
                                    <table className="table table-dark table-sm">
                                      <thead>
                                        <tr>
                                          <th>Horodatage</th>
                                          <th className="text-end">Valeur (MB)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {monitoring.memory.slice(-5).map((metric, idx) => (
                                          <tr key={idx}>
                                            <td>
                                              <small className="text-muted">
                                                {new Date(metric.timestamp).toLocaleString('fr-FR')}
                                              </small>
                                            </td>
                                            <td className="text-end">
                                              <span className="badge bg-info">
                                                {metric.value.toFixed(0)} MB
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Disk Metrics */}
                          {monitoring.disk && monitoring.disk.length > 0 && (
                            <div className="col-md-4">
                              <div className="card bg-dark border-secondary">
                                <div className="card-header bg-warning text-dark">
                                  <i className="bi bi-hdd me-2"></i>
                                  Disque
                                </div>
                                <div className="card-body">
                                  <div className="table-responsive">
                                    <table className="table table-dark table-sm">
                                      <thead>
                                        <tr>
                                          <th>Horodatage</th>
                                          <th className="text-end">Valeur (GB)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {monitoring.disk.slice(-5).map((metric, idx) => (
                                          <tr key={idx}>
                                            <td>
                                              <small className="text-muted">
                                                {new Date(metric.timestamp).toLocaleString('fr-FR')}
                                              </small>
                                            </td>
                                            <td className="text-end">
                                              <span className="badge bg-warning text-dark">
                                                {metric.value.toFixed(1)} GB
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {!monitoring.cpu && !monitoring.memory && !monitoring.disk && (
                            <div className="col-12">
                              <div className="alert alert-info">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                Aucune métrique de monitoring disponible
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          Aucune donnée de monitoring disponible
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata Tab */}
                  {activeTab === 'metadata' && (
                    <div className="tab-pane fade show active">
                      {metadata && Object.keys(metadata).length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-dark table-striped">
                            <thead>
                              <tr>
                                <th style={{ width: '30%' }}>Clé</th>
                                <th style={{ width: '70%' }}>Valeur</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(metadata).map(([key, value]) => (
                                <tr key={key}>
                                  <td>
                                    <code className="text-info">{key}</code>
                                  </td>
                                  <td>
                                    <code className="text-light">{value}</code>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          Aucune metadata disponible
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstanceDetails
