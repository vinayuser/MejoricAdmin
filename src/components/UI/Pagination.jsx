import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage;
      let endPage;
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }
      if (startPage > 2) {
        pageNumbers.push("...");
      }
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();
  const baseBtn =
    "min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition";
  const navBtn = (disabled) =>
    `${baseBtn} ${
      disabled
        ? "cursor-not-allowed text-slate-300"
        : "text-slate-600 hover:bg-slate-100"
    }`;
  const pageBtn = (active) =>
    `${baseBtn} ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navBtn(currentPage === 1)}
      >
        Prev
      </button>
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-1.5 py-1.5 text-sm text-slate-400">…</span>
          ) : (
            <button
              type="button"
              onClick={() => typeof page === "number" && onPageChange(page)}
              className={pageBtn(currentPage === page)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navBtn(currentPage === totalPages)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
