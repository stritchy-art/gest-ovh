import { useState, useEffect } from 'react'
import './App.css'
import InstanceList from './components/InstanceList'
import ActionLogs from './components/ActionLogs'
import Game from './components/Game'

function App() {
  const [isTestMode, setIsTestMode] = useState<boolean>(false)
  const [redisAvailable, setRedisAvailable] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [showActionLogs, setShowActionLogs] = useState<boolean>(false)
  const [showGame, setShowGame] = useState<boolean>(false)

  useEffect(() => {
    // Vérifier le mode de fonctionnement au démarrage
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setIsTestMode(data.testMode)
        setRedisAvailable(data.redisAvailable ?? true)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  // Easter egg: Alt+K pour afficher le jeu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'k') {
        e.preventDefault()
        setShowGame(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-cloud-fill me-2"></i>
            OVH Cloud Manager
          </span>
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={() => setShowActionLogs(true)}
              title="Historique des actions"
            >
              <i className="bi bi-clock-history me-1"></i>
              Historique
            </button>
            {!loading && isTestMode && (
              <span className="badge bg-warning text-dark">
                <i className="bi bi-flask me-1"></i>
                Mode Test - Credentials OVH non configurées
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        {!loading && isTestMode && (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Mode Test activé</strong> - Les credentials OVH ne sont pas configurées côté serveur. 
            Vous visualisez des données simulées. Pour utiliser vos vraies instances OVH, configurez les 
            variables d'environnement <code>OVH_APP_KEY</code>, <code>OVH_APP_SECRET</code> et <code>OVH_CONSUMER_KEY</code> 
            dans le fichier <code>.env</code> du serveur.
          </div>
        )}
        
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb breadcrumb-dark mb-0">
            <li className="breadcrumb-item">
              <i className="bi bi-house me-1"></i>
              Accueil
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Instances
            </li>
          </ol>
        </nav>

        <InstanceList redisAvailable={redisAvailable} />
        
        <ActionLogs 
          show={showActionLogs}
          onClose={() => setShowActionLogs(false)}
        />

        {showGame && <Game onClose={() => setShowGame(false)} />}
      </div>

      {/* Easter egg hint */}
      <div 
        className="position-fixed bottom-0 end-0 p-2 text-muted small"
        style={{ 
          fontSize: '0.7rem', 
          opacity: 0, 
          cursor: 'help',
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        title="There's something hidden here... 🎮"
      >
        Alt+K
      </div>
    </>
  )
}

export default App
