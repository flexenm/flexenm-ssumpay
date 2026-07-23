import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

// Figma: 연회색 큰 카드(bg #f6f7fa, radius 26) + 원형 회색 아이콘 배지 + 문구
export default function EmptyState({
  icon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[26px] bg-page px-6 py-24 text-center ${className}`}
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-[#e5e6ea] text-ink/40">
        {icon}
      </div>
      <p className="text-[17px] font-medium text-ink/70">{title}</p>
      {description && (
        <p className="mt-2 text-[15px] text-ink/40">{description}</p>
      )}
    </div>
  );
}
