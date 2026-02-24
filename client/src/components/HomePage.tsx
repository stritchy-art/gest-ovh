import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ovhService from '../services/ovhService';

interface HomeStats {
  instanceCount: number;
  activeInstances: number;
}

function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<HomeStats>({
    instanceCount: 0,
    activeInstances: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      let instanceCount = 0;
      let activeInstances = 0;

      try {
        const projects = await ovhService.getProjects();
        const instanceResults = await Promise.allSettled(
          projects.map(p => ovhService.getInstances(p.id))
        );
        for (const r of instanceResults) {
          if (r.status === 'fulfilled') {
            instanceCount += r.value.length;
            activeInstances += r.value.filter(i => i.status === 'ACTIVE').length;
          }
        }
      } catch {
        // ignore — stats non critiques
      } finally {
        setStats(prev => ({ ...prev, instanceCount, activeInstances }));
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="py-4">
      {/* Hero */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-2">
          <i className="bi bi-cloud-fill text-primary me-3"></i>
          OVH Cloud Manager
        </h1>
        <p className="lead text-muted">
          Gérez vos ressources cloud OVH depuis une interface unifiée
        </p>
      </div>

      {/* Section cards */}
      <div className="row g-4 justify-content-center mb-5">

        {/* Card Instances */}
        <div className="col-12 col-md-6 col-lg-5">
          <div
            className="card h-100 shadow-sm border-0 section-card"
            style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onClick={() => navigate('/instances')}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="rounded-3 p-3 me-3 d-flex align-items-center justify-content-center"
                  style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)', minWidth: 56, minHeight: 56 }}
                >
                  <i className="bi bi-display text-white fs-4"></i>
                </div>
                <div>
                  <h4 className="card-title mb-0 fw-bold">Gestion des Instances</h4>
                  <small className="text-muted">Cloud Public OVH</small>
                </div>
              </div>
              <p className="card-text text-muted mb-3">
                Démarrez, arrêtez et surveillez vos instances cloud. Configurez des planifications
                automatiques et consultez les métriques en temps réel.
              </p>
              <ul className="list-unstyled text-muted small mb-4">
                <li className="mb-1"><i className="bi bi-check2-circle text-success me-2"></i>Démarrage / arrêt des instances</li>
                <li className="mb-1"><i className="bi bi-check2-circle text-success me-2"></i>Planification automatique (cron)</li>
                <li className="mb-1"><i className="bi bi-check2-circle text-success me-2"></i>Monitoring et logs</li>
                <li><i className="bi bi-check2-circle text-success me-2"></i>Gestion multi-projet et multi-région</li>
              </ul>
              {/* Stats */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="bg-light rounded-3 p-3 text-center">
                    <div className="fw-bold fs-4 text-primary">
                      {loadingStats ? <span className="spinner-border spinner-border-sm" /> : stats.instanceCount}
                    </div>
                    <div className="text-muted small">Instances</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light rounded-3 p-3 text-center">
                    <div className="fw-bold fs-4 text-success">
                      {loadingStats ? <span className="spinner-border spinner-border-sm" /> : stats.activeInstances}
                    </div>
                    <div className="text-muted small">Actives</div>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary w-100">
                <i className="bi bi-arrow-right-circle me-2"></i>
                Gérer les Instances
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Info OVH */}
      <div className="text-center">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Connecté à l'API OVH Cloud Public · Région Europe
        </small>
      </div>
    </div>
  );
}

export default HomePage;
