import { api } from "@/api/fetch";
import type { DataResponse, ListResponse, Order, PaymentMethod } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const createOrderApiPath = "/api/orders";
export const fetchMyOrdersApiPath = "/api/orders/my";
export const getFetchOrderApiPath = (orderNo: string) =>
  `/api/orders/${orderNo}`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface CreateOrderParams {
  productId: number;
  flexUsername: string;
  paymentMethod: PaymentMethod;
  // NOTE: 프론트가 함께 전송하지만 현재 백엔드(routes/api/orders.js)는 무시하는 필드.
  flexPassword?: string;
}

export interface FetchMyOrdersParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function createOrder(params: CreateOrderParams) {
  const { data } = await api.post<
    DataResponse<{ orderNo: string; id: number; price: number }>
  >(createOrderApiPath, params);
  return data.data;
}

export async function fetchMyOrders(params?: FetchMyOrdersParams) {
  const { data } = await api.get<ListResponse<Order>>(fetchMyOrdersApiPath, {
    params,
  });
  return data.data;
}

export async function fetchOrder(orderNo: string) {
  const { data } = await api.get<DataResponse<Order>>(
    getFetchOrderApiPath(orderNo),
  );
  return data.data;
}
