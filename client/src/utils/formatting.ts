/**
 * Utilitaires de formatage
 */

/**
 * Formate une date au format français DD/MM/YYYY HH:mm
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Retourne la classe CSS du badge pour un statut donné
 */
export function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    'ACTIVE': 'bg-success',
    'SHUTOFF': 'bg-secondary',
    'STOPPED': 'bg-secondary',
    'BUILDING': 'bg-warning text-dark',
    'BUILD': 'bg-warning text-dark',
    'ERROR': 'bg-danger',
    'PAUSED': 'bg-secondary',
    'SUSPENDED': 'bg-secondary',
    'SHELVED': 'bg-info text-dark',
    'SHELVED_OFFLOADED': 'bg-info text-dark',
    'REBOOT': 'bg-warning text-dark',
    'HARD_REBOOT': 'bg-warning text-dark',
    'RESCUE': 'bg-warning text-dark',
    'VERIFY_RESIZE': 'bg-warning text-dark',
    'MIGRATING': 'bg-warning text-dark',
    'RESIZE': 'bg-warning text-dark',
    'REBUILD': 'bg-warning text-dark',
    'DELETING': 'bg-danger',
  }
  return badges[status] || 'bg-secondary'
}
