import { useState } from 'react'
import type { Instance, InstanceSchedule } from '../types'

interface ScheduleModalProps {
  instance: Instance
  show: boolean
  onClose: () => void
  onSave: (schedule: InstanceSchedule) => void
}

function ScheduleModal({ instance, show, onClose, onSave }: ScheduleModalProps) {
  const [startTime, setStartTime] = useState<string>(instance.schedule?.startTime || '08:00')
  const [stopTime, setStopTime] = useState<string>(instance.schedule?.stopTime || '18:00')
  const [enabled, setEnabled] = useState<boolean>(instance.schedule?.enabled || false)
  const [timezone] = useState<string>(instance.schedule?.timezone || 'Europe/Paris')

  const handleSave = () => {
    onSave({
      startTime,
      stopTime,
      enabled,
      timezone
    })
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="bi bi-clock-history me-2"></i>
              Planification automatique
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <p className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                Instance: <strong>{instance.name}</strong>
              </p>
            </div>

            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="enableSchedule"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="enableSchedule">
                Activer la planification automatique
              </label>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  <i className="bi bi-play-circle me-1"></i>
                  Heure de démarrage
                </label>
                <input
                  type="time"
                  className="form-control bg-dark text-light border-secondary"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!enabled}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  <i className="bi bi-stop-circle me-1"></i>
                  Heure d'arrêt
                </label>
                <input
                  type="time"
                  className="form-control bg-dark text-light border-secondary"
                  value={stopTime}
                  onChange={(e) => setStopTime(e.target.value)}
                  disabled={!enabled}
                />
              </div>
            </div>

            <div className="alert alert-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              <small>
                Fuseau horaire: <strong>{timezone}</strong><br />
                {enabled ? (
                  <>L'instance sera <strong>démarrée à {startTime}</strong> et <strong>arrêtée à {stopTime}</strong> automatiquement.</>
                ) : (
                  <>La planification est désactivée. L'instance sera contrôlée manuellement.</>
                )}
              </small>
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <i className="bi bi-save me-2"></i>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleModal
