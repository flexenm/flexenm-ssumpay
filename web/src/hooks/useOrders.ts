import { useQuery } from "@tanstack/react-query";
import {
  fetchMyOrders,
  fetchMyOrdersApiPath,
  fetchOrder,
  getFetchOrderApiPath,
} from "@/api/orders";
import { queryClient } from "@/queryClient";

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
