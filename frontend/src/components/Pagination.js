import React from 'react';
import './Pagination.css';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>
      {getPageNumbers().map((n) => (
        <button
          key={n}
          className={`pagination__btn ${n === page ? 'pagination__btn--active' : ''}`}
          onClick={() => onPageChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
      >
        Next →
      </button>
    </nav>
  );
}
