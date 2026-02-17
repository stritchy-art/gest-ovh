import { useState, useEffect } from 'react'
import './App.css'
import OVHConfig from './components/OVHConfig'
import InstanceList from './components/InstanceList'
import type { OVHConfig as OVHConfigType } from './types'

function App() {
  const [config, setConfig] = useState<OVHConfigType | null>(null)

  useEffect(() => {
    if (config) {
      console.log('Configuration updated:', {
        endpoint: config.endpoint,
        testMode: config.testMode
      })
    }
  }, [config])

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-cloud-fill me-2"></i>
            OVH Cloud Manager
          </span>
          {config?.testMode && (
            <span className="badge bg-warning text-dark">
              <i className="bi bi-flask me-1"></i>
              Mode Test
            </span>
          )}
        </div>
      </nav>

      <div className="container-fluid">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb breadcrumb-dark mb-0">
            <li className="breadcrumb-item">
              <i className="bi bi-house me-1"></i>
              Accueil
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {!config ? 'Configuration' : 'Instances'}
            </li>
          </ol>
        </nav>

        {!config ? (
          <OVHConfig onConfigSubmit={setConfig} />
        ) : (
          <InstanceList config={config} />
        )}
      </div>
    </>
  )
}

export default App
