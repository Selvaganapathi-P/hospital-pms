export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="btn btn-sm">
        ‹ Prev
      </button>
      <span className="page-info">
        Page {page} of {pages}
      </span>
      <button disabled={page === pages} onClick={() => onPageChange(page + 1)} className="btn btn-sm">
        Next ›
      </button>
    </div>
  );
}
