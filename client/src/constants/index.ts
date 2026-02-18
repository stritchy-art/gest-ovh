/**
 * Constantes de l'application
 */

// Options de pagination
export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export const DEFAULT_PAGE_SIZE = 10;

// Statuts des instances
export const INSTANCE_STATUS = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  SHUTOFF: 'SHUTOFF',
  BUILDING: 'BUILDING',
} as const;

export const INSTANCE_STATUS_OPTIONS = Object.values(INSTANCE_STATUS);

// Options de tri
export const SORT_BY_OPTIONS = ['name', 'created', 'status'] as const;
export type SortBy = typeof SORT_BY_OPTIONS[number];

export const SORT_DIR_OPTIONS = ['asc', 'desc'] as const;
export type SortDir = typeof SORT_DIR_OPTIONS[number];

// Couleurs des badges de statut
export const STATUS_BADGE_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  SHUTOFF: 'danger',
  BUILDING: 'warning',
  PAUSED: 'secondary',
  SUSPENDED: 'dark',
  ERROR: 'danger',
  UNKNOWN: 'secondary',
};
