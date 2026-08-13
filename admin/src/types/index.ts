// 백엔드(server/entities, server/migrations/001_init.sql, server/const.js)를 기준으로
// 프론트가 실제로 주고받는 형태를 그대로 반영한 타입 정의.
//
// NOTE: 원본은 server/ 다. web/src/types/index.ts 와 도메인 모델·열거값이 겹치며,
// 서버 스키마가 바뀌면 양쪽을 함께 고쳐야 한다. 서버가 OpenAPI 스펙을 내보내게 되면
// 생성으로 대체할 것(현재 server/ 는 순수 JS이고 swagger 의존성이 없다).

/* ----------------------------- 공통 응답 형태 ----------------------------- */

// 서버가 envelope 없이 데이터를 그대로 반환한다 (FlexTV wrap 스타일 — server/routes/shared/handler-wrap.js).
// 성공/실패는 HTTP status 로 판단하고, 에러 응답만 { message } 형태다.

export interface MessageResponse {
  message: string;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/* --------------------------------- 열거값 -------------------------------- */
// server/const.js 와 1:1 대응

export const MEMBER_STATUS = { NORMAL: 0, BLOCKED: 1 } as const;
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

export const PAYMENT_METHOD = { CARD: 1, BANK: 2 } as const;
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_STATUS = { PENDING: 0, DONE: 1, CANCELLED: 2 } as const;
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const CHARGE_STATUS = { PENDING: 0, DONE: 1, REFUNDED: 2 } as const;
export type ChargeStatus = (typeof CHARGE_STATUS)[keyof typeof CHARGE_STATUS];

export const INQUIRY_TYPE = {
  CHARGE: 1,
  PAYMENT: 2,
  CANCEL_REFUND: 3,
  ETC: 4,
} as const;
export type InquiryType = (typeof INQUIRY_TYPE)[keyof typeof INQUIRY_TYPE];

export const INQUIRY_STATUS = { PENDING: 0, ANSWERED: 1 } as const;
export type InquiryStatus =
  (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];

export const PRODUCT_CATEGORY = {
  BROADCAST: "broadcast",
  GAME: "game",
  WEBTOON: "webtoon",
  GIFTCARD: "giftcard",
} as const;
export type ProductCategory =
  (typeof PRODUCT_CATEGORY)[keyof typeof PRODUCT_CATEGORY];

export const PRODUCT_SUBCATEGORY = {
  FLEX: "flex",
  SOOP: "soop",
  TOON: "toon",
  POPCORN: "popcorn",
  PANDA: "panda",
} as const;
export type ProductSubcategory =
  (typeof PRODUCT_SUBCATEGORY)[keyof typeof PRODUCT_SUBCATEGORY];

/* -------------------------------- 도메인 -------------------------------- */

export interface Member {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  flexUsername: string | null;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  name: string;
  price: number;
  lexAmount: number;
  coinAmount: number;
  isActive: 0 | 1;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNo: string;
  memberId: number;
  productId: number;
  productName: string;
  price: number;
  flexUsername: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  chargeStatus: ChargeStatus;
  pgTrxNo: string | null;
  pgTid: string | null;
  paidAt: string | null;
  chargedAt: string | null;
  ipAddr: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  // GET /api/orders/:orderNo 는 product 를, 관리자 목록은 member 를 조인해서 함께 반환한다.
  product?: Product;
  member?: Member;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: 0 | 1;
  isActive: 0 | 1;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: number;
  memberId: number;
  type: InquiryType;
  title: string;
  content: string;
  imageUrl: string | null;
  status: InquiryStatus;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
  // 관리자 목록·상세는 member 를 조인해서 함께 반환한다 (Order 와 동일)
  member?: Member;
}

/* ---------------------- 로그인 등 비-엔벨로프 응답 ---------------------- */

export interface AdminUser {
  id: number;
  username: string;
  name: string;
}

// 토큰은 body 에 없다 — 서버가 HttpOnly 쿠키(Set-Cookie)로만 내려준다.
// 만료 시 갱신은 api/fetch.ts 의 응답 인터셉터가 /admin/auth/refresh 로 처리한다.
export interface AdminLoginResponse {
  admin: AdminUser;
}

export interface AdminMeResponse {
  admin: AdminUser;
}

export interface DashboardSummary {
  totalMembers: number;
  todayOrderCount: number;
  pendingCharges: number;
  pendingInquiries: number;
  salesByDay: { date: string; total: number }[];
}
