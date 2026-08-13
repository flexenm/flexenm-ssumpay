import { useParams, useNavigate } from "react-router-dom";
import { Check, Info, Loader2, TriangleAlert } from "lucide-react";
import { useWaitForPayment } from "@/hooks/useOrders";

export default function OrderCompletePage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const { order, isPending, timedOut } = useWaitForPayment({ orderNo });

  // 결제 확정은 PG 노티로만 이뤄지고 이 화면 도착과 순서가 보장되지 않는다.
  // 아직 대기면 확인 중, 기다려도 안 오면 지연 안내를 보여준다.
  //
  // isPending 은 order 가 아직 없는 상태도 포함한다 — 조회 전이나 조회 실패를
  // 성공으로 읽으면 "결제 완료"를 거짓으로 단언하게 된다.
  const showWaiting = isPending && !timedOut;
  const showDelayed = isPending && timedOut;
  const showSuccess = !isPending;

  return (
    <div className="mx-auto max-w-[840px] px-6 py-20">
      {/* 완료 헤더 */}
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-[110px] w-[110px] items-center justify-center rounded-full bg-primary-soft">
          <div
            className={`flex h-[72px] w-[72px] items-center justify-center rounded-full ${showDelayed ? "bg-ink/30" : "bg-primary"}`}
          >
            {showWaiting && (
              <Loader2
                size={40}
                color="#fff"
                strokeWidth={3}
                className="animate-spin"
              />
            )}
            {showDelayed && (
              <TriangleAlert size={40} color="#fff" strokeWidth={3} />
            )}
            {showSuccess && <Check size={40} color="#fff" strokeWidth={3} />}
          </div>
        </div>
        <h1 className="mb-2 text-[28px] font-bold text-ink">
          {showWaiting && "결제를 확인하고 있습니다"}
          {showDelayed && "결제 확인이 지연되고 있습니다"}
          {showSuccess && "결제가 완료되었습니다"}
        </h1>
        <p className="text-[15px] text-ink/50">
          {showWaiting && "잠시만 기다려 주세요"}
          {showDelayed &&
            "구매 내역에서 상태를 확인하시거나 고객센터로 문의해 주세요"}
          {showSuccess && "이용해주셔서 감사합니다"}
        </p>
      </div>

      {/* 주문 상품 */}
      <div className="mt-16">
        <h2 className="mb-3 border-b-2 border-navy-rule pb-3 text-[18px] font-bold text-ink">
          주문 상품
        </h2>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary-soft px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-navy text-2xl font-bold text-white">
              {(order?.productName ?? "F").charAt(0)}
            </div>
            <div>
              <p className="text-[17px] font-bold text-ink">
                {order?.productName ?? "주문 상품"}
              </p>
              <p className="mt-0.5 text-[14px] text-ink/50">수량: 1개</p>
              {orderNo && (
                <p className="mt-0.5 text-[13px] text-ink/40">
                  주문번호: {orderNo}
                </p>
              )}
            </div>
          </div>
          {order && (
            <span className="text-[20px] font-bold text-primary">
              {order.price.toLocaleString()}원
            </span>
          )}
        </div>

        {/* 안내 박스 */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-field p-5">
          <Info size={18} color="#9ca3af" className="mt-0.5 shrink-0" />
          <div>
            <p className="text-[15px] font-semibold text-ink/80">
              결제 완료 후 최대 30분 내 처리됩니다
            </p>
            <p className="mt-1 text-[13px] text-ink/60">
              렉스 충전은 결제 완료 후 최대 30분 내 처리됩니다. 충전이 지연될
              경우 고객센터로 문의해 주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="mt-10 flex justify-center gap-4">
        <button
          onClick={() => navigate("/mypage?tab=1")}
          className="cursor-pointer rounded-lg border-2 border-navy bg-white px-8 py-3 text-[15px] font-semibold text-ink"
        >
          구매 내역 보기
        </button>
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer rounded-lg border-none bg-navy px-8 py-3 text-[15px] font-semibold text-white"
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
