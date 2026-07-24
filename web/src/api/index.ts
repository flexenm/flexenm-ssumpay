import type { AxiosResponse } from "axios";
import { api, adminApi } from "./fetch";
import type {
  AdminLoginResponse,
  AdminMeResponse,
  BaseResponse,
  CheckUsernameResponse,
  DashboardSummary,
  DataResponse,
  Inquiry,
  ListResponse,
  LoginResponse,
  Member,
  MeResponse,
  Notice,
  Order,
  PaymentMethod,
  Product,
} from "@/types";

const handle = <T>(promise: Promise<AxiosResponse<T>>): Promise<T> =>
  promise
    .then((r) => r.data)
    .catch((e) => {
      throw e.response?.data ?? e;
    });

/* --------------------------------- 요청 타입 -------------------------------- */

export interface RegisterInput {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface ResetPasswordInput {
  username: string;
  email: string;
}

export interface ConfirmResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface CreateOrderInput {
  productId: number;
  flexUsername: string;
  paymentMethod: PaymentMethod;
  // NOTE: 프론트가 함께 전송하지만 현재 백엔드(routes/api/orders.js)는 무시하는 필드.
  flexPassword?: string;
}

export interface UpdateMypageInput {
  name?: string;
  phone?: string | null;
  flexUsername?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface CreateInquiryInput {
  type: number;
  title: string;
  content: string;
}

export type UpdateInquiryInput = Partial<CreateInquiryInput>;

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

export interface AdminOrderListParams extends ListParams {
  paymentStatus?: number;
  chargeStatus?: number;
  startDate?: string;
  endDate?: string;
}

/* ---------------------------------- Auth ---------------------------------- */

export const authApi = {
  checkUsername: (username: string) =>
    handle<CheckUsernameResponse>(
      api.get("/api/auth/check-username", { params: { username } }),
    ),
  register: (data: RegisterInput) =>
    handle<BaseResponse>(api.post("/api/auth/register", data)),
  login: (data: LoginInput) =>
    handle<LoginResponse>(api.post("/api/auth/login", data)),
  me: () => handle<MeResponse>(api.get("/api/my/profile")),
  resetPassword: (data: ResetPasswordInput) =>
    handle<BaseResponse>(api.post("/api/auth/password/reset", data)),
  confirmResetPassword: (data: ConfirmResetPasswordInput) =>
    handle<BaseResponse>(api.post("/api/auth/password/reset/confirm", data)),
};

/* -------------------------------- Products -------------------------------- */

export const productsApi = {
  list: (params?: { category?: string; subcategory?: string }) =>
    handle<DataResponse<Product[]>>(api.get("/api/products", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Product>>(api.get(`/api/products/${id}`)),
};

/* --------------------------------- Orders --------------------------------- */

export const ordersApi = {
  create: (data: CreateOrderInput) =>
    handle<DataResponse<{ orderNo: string; id: number; price: number }>>(
      api.post("/api/orders", data),
    ),
  my: (params?: ListParams) =>
    handle<ListResponse<Order>>(api.get("/api/orders/my", { params })),
  get: (orderNo: string) =>
    handle<DataResponse<Order>>(api.get(`/api/orders/${orderNo}`)),
};

/* --------------------------------- Mypage --------------------------------- */

export const mypageApi = {
  get: () => handle<DataResponse<Member>>(api.get("/api/mypage")),
  update: (data: UpdateMypageInput) =>
    handle<DataResponse<Member>>(api.patch("/api/mypage", data)),
  changePassword: (data: ChangePasswordInput) =>
    handle<BaseResponse>(api.patch("/api/mypage/password", data)),
};

/* --------------------------------- Notices -------------------------------- */

export const noticesApi = {
  list: (params?: ListParams) =>
    handle<ListResponse<Notice>>(api.get("/api/notices", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Notice>>(api.get(`/api/notices/${id}`)),
};

/* -------------------------------- Inquiries ------------------------------- */

export const inquiriesApi = {
  list: (params?: ListParams) =>
    handle<ListResponse<Inquiry>>(api.get("/api/inquiries", { params })),
  get: (id: number | string) =>
    handle<DataResponse<Inquiry>>(api.get(`/api/inquiries/${id}`)),
  create: (data: CreateInquiryInput) =>
    handle<DataResponse<Inquiry>>(api.post("/api/inquiries", data)),
  update: (id: number | string, data: UpdateInquiryInput) =>
    handle<DataResponse<Inquiry>>(api.put(`/api/inquiries/${id}`, data)),
  delete: (id: number | string) =>
    handle<BaseResponse>(api.delete(`/api/inquiries/${id}`)),
};

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
  list: (params?: ListParams) =>
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
