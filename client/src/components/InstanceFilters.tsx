import { PAGE_SIZE_OPTIONS, INSTANCE_STATUS_OPTIONS, SortBy, SortDir } from '../constants'

interface InstanceFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  regionFilter: string
  setRegionFilter: (value: string) => void
  sortBy: SortBy
  setSortBy: (value: SortBy) => void
  sortDir: SortDir
  setSortDir: (value: SortDir) => void
  pageSize: number
  setPageSize: (value: number) => void
  loading: boolean
  onRefresh: () => void
  availableRegions: string[]
}

function InstanceFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  regionFilter,
  setRegionFilter,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  pageSize,
  setPageSize,
  loading,
  onRefresh,
  availableRegions
}: InstanceFiltersProps) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      <input
        type="text"
        className="form-control form-control-sm bg-dark text-light border-secondary"
        placeholder="Rechercher par nom ou ID"
        style={{ width: 220 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        className="form-select form-select-sm bg-dark text-light border-secondary"
        style={{ width: 140 }}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value={INSTANCE_STATUS_OPTIONS[0]}>Tous statuts</option>
        {INSTANCE_STATUS_OPTIONS.slice(1).map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        className="form-select form-select-sm bg-dark text-light border-secondary"
        style={{ width: 140 }}
        value={regionFilter}
        onChange={(e) => setRegionFilter(e.target.value)}
      >
        <option value="ALL">Toutes régions</option>
        {availableRegions.map((region) => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      <select
        className="form-select form-select-sm bg-dark text-light border-secondary"
        style={{ width: 140 }}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortBy)}
      >
        <option value="name">Tri: Nom</option>
        <option value="created">Tri: Date</option>
        <option value="status">Tri: Statut</option>
      </select>

      <select
        className="form-select form-select-sm bg-dark text-light border-secondary"
        style={{ width: 120 }}
        value={sortDir}
        onChange={(e) => setSortDir(e.target.value as SortDir)}
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>

      <select
        className="form-select form-select-sm bg-dark text-light border-secondary"
        style={{ width: 120 }}
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>{size} / page</option>
        ))}
      </select>

      <button
        onClick={onRefresh}
        className="btn btn-primary btn-sm"
        disabled={loading}
      >
        <i className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} me-2 ${loading ? 'spin' : ''}`}></i>
        Actualiser
      </button>
    </div>
  )
}

export default InstanceFilters
