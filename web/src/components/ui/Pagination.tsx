import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// Figma: ‹ 1 2 3 4 5 › — 활성 #222 / 비활성 rgba(34,34,34,0.5), gap 20, chevron 12
export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-5 pt-10">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="cursor-pointer text-ink/40 disabled:opacity-30"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`cursor-pointer text-[15px] ${
            p === page ? "font-semibold text-ink" : "text-ink/50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="cursor-pointer text-ink/40 disabled:opacity-30"
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
