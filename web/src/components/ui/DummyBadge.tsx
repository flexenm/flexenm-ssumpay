interface DummyBadgeProps {
  className?: string;
  label?: string;
}

// 백엔드 API가 아직 없는 영역에 "더미데이터"임을 명시하는 라벨.
// 실제 API 연동 시 이 뱃지가 붙은 부분을 교체하면 된다.
export default function DummyBadge({
  className = "",
  label = "더미데이터",
}: DummyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ${className}`}
    >
      {label}
    </span>
  );
}
