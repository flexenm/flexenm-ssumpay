import { useState, useEffect } from "react";
import { fetchOrders, updateChargeStatus } from "@/api/orders";
import type { FetchOrdersParams } from "@/api/orders";
import { getApiError } from "@/utils/error";
import type { Order } from "@/types";

const PAYMENT_LABEL: Record<number, string> = {
  0: "대기",
  1: "완료",
  2: "취소",
};

const CHARGE_LABEL: Record<number, string> = {
  0: "대기",
  1: "완료",
  2: "환불",
};

// Order.paymentMethod (백엔드 실제 필드, PAYMENT_METHOD = { CARD: 1, BANK: 2 })
const METHOD_LABEL: Record<number, string> = {
  1: "신용카드",
  2: "무통장입금",
};

// "최근 N일"은 오늘을 포함한 N일. 백엔드는 createdAt >= startDate 로 비교한다.
const startDateOf = (days: string) => {
  const d = new Date();
  d.setDate(d.getDate() - (Number(days) - 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [chargeStatus, setChargeStatus] = useState("");
  const [period, setPeriod] = useState("7");

  const load = (kw = keyword, cs = chargeStatus, pd = period) => {
    const params: FetchOrdersParams = { startDate: startDateOf(pd) };
    if (kw) params.keyword = kw;
    if (cs !== "") params.chargeStatus = Number(cs);
    setLoading(true);
    fetchOrders(params)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load("", "");
  }, []);

  const updateCharge = async (id: number, status: number) => {
    try {
      await updateChargeStatus(id, status);
      load();
    } catch (e) {
      alert(getApiError(e).message ?? "충전 상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">주문·충전 조회</h1>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            load(keyword, chargeStatus, e.target.value);
          }}
          className={selectClass}
        >
          <option value="7">기간: 최근 7일</option>
          <option value="30">기간: 최근 30일</option>
          <option value="90">기간: 최근 90일</option>
        </select>
        <select
          value={chargeStatus}
          onChange={(e) => {
            setChargeStatus(e.target.value);
            load(keyword, e.target.value, period);
          }}
          className={selectClass}
        >
          <option value="">충전 상태: 전체</option>
          <option value="0">충전 상태: 대기</option>
          <option value="1">충전 상태: 완료</option>
          <option value="2">충전 상태: 환불</option>
        </select>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(keyword, chargeStatus, period)}
          placeholder="주문번호 / 회원 / 플렉스티비 아이디"
          className={`${inputClass} w-[360px] max-w-full`}
        />
        <button
          onClick={() => load(keyword, chargeStatus)}
          className="h-[52px] cursor-pointer rounded-lg bg-admin px-8 text-[15px] font-semibold text-white"
        >
          검색
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-admin-head">
            <th className={thClass}>주문번호</th>
            <th className={thClass}>일시</th>
            <th className={thClass}>회원</th>
            <th className={thClass}>플렉스티비 ID</th>
            <th className={thClass}>상품</th>
            <th className={thClass}>결제 수단</th>
            <th className={thClass}>금액</th>
            <th className={thClass}>결제</th>
            <th className={thClass}>충전</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="p-10 text-center text-admin-muted">
                불러오는 중...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-10 text-center text-admin-muted">
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} className="border-b border-admin-line">
                <td className={tdClass}>{o.orderNo}</td>
                <td className={tdClass}>{formatDateTime(o.createdAt)}</td>
                <td className={tdClass}>{o.member?.username || "-"}</td>
                <td className={tdClass}>{o.flexUsername || "-"}</td>
                <td className={tdClass}>{o.productName}</td>
                <td className={tdClass}>
                  {METHOD_LABEL[o.paymentMethod] ?? "-"}
                </td>
                <td className={tdClass}>{o.price?.toLocaleString()}원</td>
                <td className={tdClass}>
                  <span
                    className={
                      o.paymentStatus === 0
                        ? "font-semibold text-admin"
                        : "text-admin-muted"
                    }
                  >
                    {PAYMENT_LABEL[o.paymentStatus] ?? "-"}
                  </span>
                </td>
                <td className={tdClass}>
                  {o.chargeStatus === 0 ? (
                    <button
                      onClick={() => updateCharge(o.id, 1)}
                      className="cursor-pointer font-semibold text-admin hover:underline"
                    >
                      충전완료
                    </button>
                  ) : (
                    <span className="text-admin-muted">
                      {CHARGE_LABEL[o.chargeStatus] ?? "-"}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 text-[13px] text-admin-muted">
        <p>
          ※ [충전완료] 클릭 시 충전 상태 변경 → 사용자 구매 내역에 반영 (완료 알림
          이메일 선택)
        </p>
        <p>※ 취소/환불은 PG사 관리자에서 처리 후 이 화면에서 상태 변경</p>
      </div>
    </div>
  );
}

const inputClass =
  "h-[52px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink placeholder:text-[#a6a6a6] outline-none";
const selectClass =
  "h-[52px] rounded-lg border border-admin-border bg-admin-bg px-4 text-[15px] text-ink outline-none";
const thClass =
  "h-[52px] px-4 text-left text-[14px] font-medium text-admin-muted whitespace-nowrap";
const tdClass = "px-4 py-3 text-[14px] text-ink whitespace-nowrap";
