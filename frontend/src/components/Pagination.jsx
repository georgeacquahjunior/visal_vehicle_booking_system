import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPaginationRange(currentPage, totalPages, siblingCount = 0) {
  const totalSlots = siblingCount * 2 + 5; // first + last + current + 2 siblings + 2 dots

  if (totalSlots >= totalPages) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblingCount * 2);
    return [...leftRange, "dots", totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(totalPages - (3 + siblingCount * 2) + 1, totalPages);
    return [1, "dots", ...rightRange];
  }

  return [1, "dots", ...range(leftSibling, rightSibling), "dots", totalPages];
}

function PaginationButton({ active = false, children, disabled = false, onClick }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors ${
        active
          ? "border-[#1469e1] bg-[#1469e1] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#1469e1] hover:text-[#1469e1]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Pagination({ currentPage, onPageChange, pageSize, totalItems }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageNumbers = getPaginationRange(currentPage, totalPages);

  if (totalItems <= pageSize) return null;

  return (
    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <span className="text-sm font-medium text-[#7b8ba5]">
        Showing {pageStart + 1}-{Math.min(pageStart + pageSize, totalItems)} of {totalItems}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <PaginationButton disabled={currentPage === 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
          <ChevronLeft size={16} />
        </PaginationButton>
        {pageNumbers.map((page, index) =>
          page === "dots" ? (
            <span key={`dots-${index}`} className="inline-flex h-9 min-w-9 items-center justify-center text-sm font-bold text-slate-400">
              ...
            </span>
          ) : (
            <PaginationButton key={page} active={page === currentPage} onClick={() => onPageChange(page)}>
              {page}
            </PaginationButton>
          )
        )}
        <PaginationButton disabled={currentPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
          <ChevronRight size={16} />
        </PaginationButton>
      </div>
    </div>
  );
}

export default Pagination;
