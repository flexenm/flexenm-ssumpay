import { adminApi } from "@/api/fetch";
import type { ListResult, Order } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchOrdersApiPath = "/admin/orders";
export const getFetchOrderApiPath = (id: number | string) =>
  `/admin/orders/${id}`;
export const getUpdateChargeStatusApiPath = (id: number | string) =>
  `/admin/orders/${id}/charge-status`;
export const getUpdateOrderMemoApiPath = (id: number | string) =>
  `/admin/orders/${id}/memo`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  keyword?: string;
  paymentStatus?: number;
  chargeStatus?: number;
  startDate?: string;
  endDate?: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchOrders(params?: FetchOrdersParams) {
  const { data } = await adminApi.get<ListResult<Order>>(fetchOrdersApiPath, {
    params,
  });
  return data.items;
}

export async function fetchOrder(id: number | string) {
  const { data } = await adminApi.get<Order>(
    getFetchOrderApiPath(id),
  );
  return data;
}

export async function updateChargeStatus(
  id: number | string,
  chargeStatus: number,
) {
  await adminApi.patch(getUpdateChargeStatusApiPath(id), { chargeStatus });
}

export async function updateOrderMemo(id: number | string, memo: string) {
  await adminApi.patch(getUpdateOrderMemoApiPath(id), { memo });
}
