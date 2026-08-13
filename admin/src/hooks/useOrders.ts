import { useQuery } from "@tanstack/react-query";
import {
  fetchOrder,
  fetchOrders,
  fetchOrdersApiPath,
  getFetchOrderApiPath,
} from "@/api/orders";
import type { FetchOrdersParams } from "@/api/orders";

// period("7"/"30"/"90") = 오늘을 포함한 최근 N일. 백엔드는 createdAt >= startDate 로 비교한다.
// startDate 는 new Date() 로 파생되는 값이라 queryKey 에 넣지 않는다 — 렌더 시각이 캐시 키에 섞인다.
// 키에는 period 를 넣고 날짜 계산은 queryFn 안에서만 한다.
const startDateOf = (period: string) => {
  const d = new Date();
  d.setDate(d.getDate() - (Number(period) - 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface UseFetchOrdersParams extends Omit<FetchOrdersParams, "startDate"> {
  period?: string;
}

export function useFetchOrders({
  period,
  ...params
}: UseFetchOrdersParams = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchOrdersApiPath, { ...params, period }],
    queryFn: () =>
      fetchOrders(
        period ? { ...params, startDate: startDateOf(period) } : params,
      ),
  });

  return { orders: data ?? [], refetch, isLoading };
}

export function useFetchOrder({ id }: { id?: number | string }) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [getFetchOrderApiPath(id ?? "")],
    queryFn: () => fetchOrder(id!),
    enabled: id != null && id !== "",
  });

  return { order: data, refetch, isLoading };
}
