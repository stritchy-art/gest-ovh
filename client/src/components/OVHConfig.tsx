import { useState, FormEvent } from 'react'
import type { OVHConfig as OVHConfigType } from '../types'

interface OVHConfigProps {
  onConfigSubmit: (config: OVHConfigType) => void
}

function OVHConfig({ onConfigSubmit }: OVHConfigProps) {
  const [appKey, setAppKey] = useState<string>('')
  const [appSecret, setAppSecret] = useState<string>('')
  const [consumerKey, setConsumerKey] = useState<string>('')
  const [endpoint, setEndpoint] = useState<'ovh-eu' | 'ovh-us' | 'ovh-ca'>('ovh-eu')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onConfigSubmit({
      appKey,
      appSecret,
      consumerKey,
      endpoint,
      testMode: false
    })
  }

  const handleTestMode = () => {
    onConfigSubmit({
      appKey: 'test-key',
      appSecret: 'test-secret',
      consumerKey: 'test-consumer',
      endpoint: 'ovh-eu',
      testMode: true
    })
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card bg-dark border-secondary">
          <div className="card-body">
            <h5 className="card-title mb-4">
              <i className="bi bi-gear-fill me-2"></i>
              Configuration OVH API
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Application Key</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  value={appKey}
                  onChange={(e) => setAppKey(e.target.value)}
                  placeholder="Entrez votre App Key"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Application Secret</label>
                <input
                  type="password"
                  className="form-control bg-dark text-light border-secondary"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="Entrez votre App Secret"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Consumer Key</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light border-secondary"
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  placeholder="Entrez votre Consumer Key"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Endpoint</label>
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value as 'ovh-eu' | 'ovh-us' | 'ovh-ca')}
                >
                  <option value="ovh-eu">OVH Europe</option>
                  <option value="ovh-us">OVH US</option>
                  <option value="ovh-ca">OVH Canada</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-2">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Se connecter
              </button>
              <button
                type="button"
                className="btn btn-outline-warning w-100"
                onClick={handleTestMode}
              >
                <i className="bi bi-flask me-2"></i>
                Mode Test (sans identifiants)
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OVHConfig
