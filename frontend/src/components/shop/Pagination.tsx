"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-9 h-9 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
        style={{ borderColor: "var(--border)" }}
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? "page" : undefined}
            className="flex items-center justify-center w-9 h-9 rounded-full border transition-colors text-sm font-medium"
            style={{
              borderColor: p === page ? "var(--fg)" : "var(--border)",
              background: p === page ? "var(--fg)" : "transparent",
              color: p === page ? "#fff" : "var(--fg)",
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-9 h-9 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
        style={{ borderColor: "var(--border)" }}
      >
        ›
      </button>
    </nav>
  );
}
