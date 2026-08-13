import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { adminDashboardApi, adminOrdersApi } from "@/api";
import type { DashboardSummary, Order } from "@/types";
import DummyBadge from "@/components/ui/DummyBadge";

const CHARGE_LABEL: Record<number, string> = {
  0: "대기",
  1: "완료",
  2: "환불",
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    adminDashboardApi
      .get()
      .then((r) => setData(r))
      .catch(() => {});
    adminOrdersApi
      .list({ limit: 8 })
      .then((r) => setRecent(r.items))
      .catch(() => {});
  }, []);

  if (!data) return <div className="text-admin-muted">로딩중...</div>;

  const cards = [
    {
      label: "오늘 결제 건수",
      value: `${(data.todayOrderCount ?? 0).toLocaleString()}건`,
    },
    {
      label: "오늘 결제 금액",
      value: "264,000원",
      dummy: true,
    },
    {
      label: "충전 대기",
      value: `${data.pendingCharges}건`,
      to: "/admin/orders",
    },
    {
      label: "미답변 문의",
      value: `${data.pendingInquiries}건`,
      to: "/admin/inquiries",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">대시보드</h1>

      <div className="mb-8 grid grid-cols-4 gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            onClick={c.to ? () => navigate(c.to) : undefined}
            role={c.to ? "button" : undefined}
            tabIndex={c.to ? 0 : undefined}
            onKeyDown={
              c.to
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(c.to);
                    }
                  }
                : undefined
            }
            className={`group flex h-[140px] flex-col justify-center rounded-xl border border-admin-border bg-white px-6 ${
              c.to
                ? "cursor-pointer transition-colors hover:border-admin hover:bg-admin-bg"
                : ""
            }`}
          >
            <p className="mb-2 flex items-center gap-2 text-[14px] text-admin-muted">
              {c.label}
              {c.dummy && <DummyBadge />}
              {c.to && (
                <ChevronRight
                  size={16}
                  className="ml-auto text-admin-muted transition-transform group-hover:translate-x-0.5"
                />
              )}
            </p>
            <p className="text-[28px] font-bold text-admin">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-bold text-ink">최근 주문</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-admin-head">
            {["주문번호", "주문일시", "회원 아이디", "상품", "금액", "충전 상태"].map(
              (h) => (
                <th
                  key={h}
                  className="h-[52px] px-4 text-left text-[14px] font-medium text-admin-muted"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {recent.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-admin-muted">
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            recent.map((o) => (
              <tr key={o.id} className="border-b border-admin-line">
                <td className="px-4 py-3 text-[14px] text-ink">{o.orderNo}</td>
                <td className="px-4 py-3 text-[14px] text-ink">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="px-4 py-3 text-[14px] text-ink">
                  {o.member?.username || "-"}
                </td>
                <td className="px-4 py-3 text-[14px] text-ink">
                  {o.productName}
                </td>
                <td className="px-4 py-3 text-[14px] text-ink">
                  {o.price?.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-[14px]">
                  <span
                    className={
                      o.chargeStatus === 0
                        ? "font-semibold text-admin"
                        : "text-admin-muted"
                    }
                  >
                    {CHARGE_LABEL[o.chargeStatus] ?? "-"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="mt-6 text-[13px] text-admin-muted">
        ※ 충전 대기 / 미답변 문의 카드 클릭 시 해당 관리 화면으로 이동
      </p>
    </div>
  );
}
