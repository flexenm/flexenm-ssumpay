interface TabItem {
  key: string;
  label: string;
}

interface SegmentedTabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

// Figma: 알약 컨테이너(bg #f3f5fe, rounded-full) 안에 세그먼트 —
// 활성 bg #2b53ed 흰 글씨, 비활성 투명 배경 #2b53ed 글씨
export default function SegmentedTabs({
  tabs,
  value,
  onChange,
  className = "",
}: SegmentedTabsProps) {
  return (
    <div
      className={`inline-flex gap-1 rounded-full bg-primary-soft p-1.5 ${className}`}
    >
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`min-w-[160px] cursor-pointer rounded-full px-6 py-2.5 text-[15px] font-medium transition-colors ${
              active
                ? "bg-primary-tab text-white"
                : "bg-transparent text-primary-tab"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
