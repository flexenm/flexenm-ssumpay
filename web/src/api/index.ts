import type { AxiosResponse } from "axios";
import { api } from "./fetch";
import type {
  BaseResponse,
  CheckUsernameResponse,
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
  image?: File | null;
}

export interface UpdateInquiryInput {
  title?: string;
  content?: string;
  image?: File | null;
}

export interface ListParams {
  page?: number;
  limit?: number;
  keyword?: string;
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
  create: ({ image, ...rest }: CreateInquiryInput) => {
    const fd = new FormData();
    (Object.entries(rest) as [string, unknown][]).forEach(([k, v]) =>
      fd.append(k, String(v)),
    );
    if (image) fd.append("image", image);
    return handle<DataResponse<Inquiry>>(
      api.post("/api/inquiries", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
  update: (id: number | string, { image, ...rest }: UpdateInquiryInput) => {
    const fd = new FormData();
    (Object.entries(rest) as [string, unknown][]).forEach(([k, v]) => {
      if (v !== undefined) fd.append(k, String(v));
    });
    if (image) fd.append("image", image);
    return handle<DataResponse<Inquiry>>(
      api.put(`/api/inquiries/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
  delete: (id: number | string) =>
    handle<BaseResponse>(api.delete(`/api/inquiries/${id}`)),
};
