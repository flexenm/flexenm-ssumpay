import { api } from "@/api/fetch";
import type { ListResult, Order, PaymentMethod } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const createOrderApiPath = "/api/orders";
export const fetchMyOrdersApiPath = "/api/orders/my";
export const getFetchOrderApiPath = (orderNo: string) =>
  `/api/orders/${orderNo}`;
export const getCreateCardPaymentApiPath = (orderNo: string) =>
  `/api/orders/${orderNo}/payment/params`;

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
  const { data } = await api.post<{
    orderNo: string;
    id: number;
    price: number;
  }>(createOrderApiPath, params);
  return data;
}

export async function fetchMyOrders(params?: FetchMyOrdersParams) {
  const { data } = await api.get<ListResult<Order>>(fetchMyOrdersApiPath, {
    params,
  });
  return data.items;
}

export async function fetchOrder(orderNo: string) {
  const { data } = await api.get<Order>(getFetchOrderApiPath(orderNo));
  return data;
}

// 헥토 결제창 SDK(SettlePG)에 그대로 넘길 전문. 암호화(trdAmt)·해시(pktHash)가 들어있어
// 프론트는 값을 해석하거나 가공하지 않는다. 결제창 도메인(SDK 의 env)만 프론트가 갖는다.
// 호출 방식(SDK vs FORM)과 그 이유는 utils/payment.ts 상단 주석 참조.
export type CardPaymentParams = Record<string, string>;

// 호출할 때마다 서버에 결제 시도가 1건 생기고 요청시각이 해시에 굳는다.
// 결제 버튼을 누른 시점에 호출하고 곧바로 결제창을 열 것 — 미리 받아두면 안 된다.
export async function createCardPayment(orderNo: string) {
  const { data } = await api.post<{
    payUrl: string;
    sdkUrl: string;
    params: CardPaymentParams;
  }>(getCreateCardPaymentApiPath(orderNo));
  return data.params;
}
