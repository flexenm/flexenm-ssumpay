import type { AxiosResponse } from "axios";
import { adminApi } from "./fetch";
import type {
  AdminLoginResponse,
  AdminMeResponse,
  BaseResponse,
  DashboardSummary,
  DataResponse,
  Inquiry,
  ListResponse,
  Member,
  Notice,
  Order,
  Product,
} from "@/types";

const handle = <T>(promise: Promise<AxiosResponse<T>>): Promise<T> =>
  promise
    .then((r) => r.data)
    .catch((e) => {
      throw e.response?.data ?? e;
    });

/* --------------------------------- 요청 타입 -------------------------------- */

export interface LoginInput {
  username: string;
  password: string;
}

export interface ProductInput {
  category: string;
  subcategory: string;
  name: string;
  price: number;
  lexAmount?: number;
  coinAmount?: number;
  isActive?: 0 | 1;
  sort?: number;
}

export interface NoticeInput {
  title: string;
  content: string;
  isPinned?: 0 | 1;
  isActive?: 0 | 1;
}

export interface ListParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface AdminNoticeListParams extends ListParams {
  isPinned?: 0 | 1;
}

export interface AdminOrderListParams extends ListParams {
  paymentStatus?: number;
  chargeStatus?: number;
  startDate?: string;
  endDate?: string;
}

/* ---------------------------------- Admin --------------------------------- */

export const adminAuthApi = {
  login: (data: LoginInput) =>
    handle<AdminLoginResponse>(adminApi.post("/admin/auth/login", data)),
  me: () => handle<AdminMeResponse>(adminApi.get("/admin/my/profile")),
};

export const adminDashboardApi = {
  get: () =>
    handle<DataResponse<DashboardSummary>>(adminApi.get("/admin/dashboard")),
};

export const adminOrdersApi = {
  list: (params?: AdminOrderListParams) =>
    handle<ListResponse<Order>>(adminApi.get("/admin/orders", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Order>>(adminApi.get(`/admin/orders/${id}`)),
  updateChargeStatus: (id: number | string, data: { chargeStatus: number }) =>
    handle<BaseResponse>(
      adminApi.patch(`/admin/orders/${id}/charge-status`, data),
    ),
  updateMemo: (id: number | string, data: { memo: string }) =>
    handle<BaseResponse>(adminApi.patch(`/admin/orders/${id}/memo`, data)),
};

export const adminProductsApi = {
  list: (params?: { category?: string; keyword?: string }) =>
    handle<DataResponse<Product[]>>(
      adminApi.get("/admin/products", { params }),
    ),
  create: (data: ProductInput) =>
    handle<DataResponse<Product>>(adminApi.post("/admin/products", data)),
  update: (id: number | string, data: Partial<ProductInput>) =>
    handle<DataResponse<Product>>(adminApi.put(`/admin/products/${id}`, data)),
  delete: (id: number | string) =>
    handle<BaseResponse>(adminApi.delete(`/admin/products/${id}`)),
};

export const adminMembersApi = {
  list: (params?: ListParams) =>
    handle<ListResponse<Member>>(adminApi.get("/admin/members", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Member>>(adminApi.get(`/admin/members/${id}`)),
  updateStatus: (id: number | string, data: { status: number }) =>
    handle<BaseResponse>(adminApi.patch(`/admin/members/${id}/status`, data)),
};

export const adminNoticesApi = {
  list: (params?: AdminNoticeListParams) =>
    handle<ListResponse<Notice>>(adminApi.get("/admin/notices", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Notice>>(adminApi.get(`/admin/notices/${id}`)),
  create: (data: NoticeInput) =>
    handle<DataResponse<Notice>>(adminApi.post("/admin/notices", data)),
  update: (id: number | string, data: Partial<NoticeInput>) =>
    handle<DataResponse<Notice>>(adminApi.put(`/admin/notices/${id}`, data)),
  delete: (id: number | string) =>
    handle<BaseResponse>(adminApi.delete(`/admin/notices/${id}`)),
};

export const adminInquiriesApi = {
  list: (params?: ListParams) =>
    handle<ListResponse<Inquiry>>(adminApi.get("/admin/inquiries", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Inquiry>>(adminApi.get(`/admin/inquiries/${id}`)),
  answer: (id: number | string, data: { answer: string }) =>
    handle<BaseResponse>(adminApi.post(`/admin/inquiries/${id}/answer`, data)),
};
