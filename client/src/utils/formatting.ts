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
    'BUILDING': 'bg-warning text-dark',
    'ERROR': 'bg-danger',
    'PAUSED': 'bg-secondary'
  }
  return badges[status] || 'bg-secondary'
}
