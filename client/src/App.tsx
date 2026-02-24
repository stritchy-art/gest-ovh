import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import InstanceList from './components/InstanceList'
import ActionLogs from './components/ActionLogs'
import Game from './components/Game'
import HomePage from './components/HomePage'

// Fil d'ariane dynamique basé sur la route courante
function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()

  const crumbs: { label: string; icon: string; path?: string }[] = [
    { label: 'Accueil', icon: 'bi-house', path: '/' }
  ]

  if (location.pathname.startsWith('/instances')) {
    crumbs.push({ label: 'Gestion des Instances', icon: 'bi-display' })
  }

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb breadcrumb-dark mb-0">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          return isLast ? (
            <li key={idx} className="breadcrumb-item active" aria-current="page">
              <i className={`bi ${crumb.icon} me-1`}></i>
              {crumb.label}
            </li>
          ) : (
            <li key={idx} className="breadcrumb-item">
              <button
                className="btn btn-link btn-sm p-0 text-decoration-none breadcrumb-link"
                onClick={() => crumb.path && navigate(crumb.path)}
              >
                <i className={`bi ${crumb.icon} me-1`}></i>
                {crumb.label}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function App() {
  const [isTestMode, setIsTestMode] = useState<boolean>(false)
  const [redisAvailable, setRedisAvailable] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [showActionLogs, setShowActionLogs] = useState<boolean>(false)
  const [showGame, setShowGame] = useState<boolean>(false)

  useEffect(() => {
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
          <Link to="/" className="navbar-brand mb-0 h1 text-decoration-none text-white">
            <i className="bi bi-cloud-fill me-2"></i>
            OVH Cloud Manager
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/instances" className="btn btn-outline-light btn-sm">
              <i className="bi bi-display me-1"></i>
              Instances
            </Link>
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
                Mode Test
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

        <Breadcrumb />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/instances" element={<InstanceList redisAvailable={redisAvailable} />} />
        </Routes>

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
