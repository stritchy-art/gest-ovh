interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <small className="text-muted">
        {totalItems} instance(s) — page {currentPage} / {totalPages}
      </small>

      <div className="btn-group btn-group-sm" role="group">
        <button
          className="btn btn-outline-secondary"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </div>
    </div>
  )
}

export default Pagination
