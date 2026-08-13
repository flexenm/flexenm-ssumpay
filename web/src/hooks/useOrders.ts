import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMyOrders,
  fetchMyOrdersApiPath,
  fetchOrder,
  getFetchOrderApiPath,
} from "@/api/orders";
import { queryClient } from "@/queryClient";
import { PAYMENT_STATUS } from "@/types";

// 주문 생성 후 완료 화면으로 이동할 때 호출한다 — 마이페이지 구매 내역이 새 주문을 반영하도록.
// 구독 중인 목록이 없으면 재요청 없이 stale 표시만 되고 다음 마운트에서 새로 받는다.
export async function refreshMyOrders() {
  await queryClient.invalidateQueries({ queryKey: [fetchMyOrdersApiPath] });
}

// enabled — 탭 활성 여부로 조회를 게이팅한다 (isLoading 을 쓰는 이유는 useInquiries 주석 참조)
export function useFetchMyOrders({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchMyOrdersApiPath],
    queryFn: () => fetchMyOrders(),
    enabled,
  });

  return { myOrders: data ?? [], refetch, isLoading };
}

export function useFetchOrder({ orderNo }: { orderNo?: string }) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [getFetchOrderApiPath(orderNo ?? "")],
    queryFn: () => fetchOrder(orderNo!),
    enabled: !!orderNo,
  });

  return { order: data, refetch, isLoading };
}

// 결제 확정은 PG 노티(서버-투-서버)로만 이뤄지는데, 결제창에서 완료 화면으로 돌아오는 것과
// 노티 도착은 순서가 보장되지 않는다. 그래서 결제대기면 잠깐 재조회하며 기다린다.
// 무한 폴링은 하지 않는다 — 노티가 유실됐다면 기다려도 오지 않으므로 안내로 넘긴다.
const PAYMENT_POLL_INTERVAL = 2_000;
const PAYMENT_POLL_TIMEOUT = 30_000;

export function useWaitForPayment({ orderNo }: { orderNo?: string }) {
  const [timedOut, setTimedOut] = useState(false);
  const { order, refetch, isLoading } = useFetchOrder({ orderNo });

  // 조회 전(order 없음)도 미확정으로 본다 — 결제 완료를 단언하려면 실제 응답을 봐야 하고,
  // 조회가 계속 실패해도 타임아웃이 걸려 안내 화면으로 넘어가야 하기 때문.
  const isPending = !order || order.paymentStatus === PAYMENT_STATUS.PENDING;

  useEffect(() => {
    if (!isPending) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt >= PAYMENT_POLL_TIMEOUT) {
        setTimedOut(true);
        clearInterval(timer);
        return;
      }
      refetch();
    }, PAYMENT_POLL_INTERVAL);

    return () => clearInterval(timer);
    // refetch 는 매 렌더 새 참조라 의존성에 넣으면 인터벌이 계속 재생성된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return { order, isLoading, isPending, timedOut };
}
