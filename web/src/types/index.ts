// 백엔드(server/entities, server/migrations/001_init.sql, server/const.js)를 기준으로
// 프론트가 실제로 주고받는 형태를 그대로 반영한 타입 정의.

/* ----------------------------- 공통 응답 형태 ----------------------------- */
// 서버가 envelope 없이 데이터를 그대로 반환한다 (FlexTV wrap 스타일).
// 에러 응답은 { message: string } 형태 (HTTP status 로 성공/실패 판단).

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
}

/* ---------------------------- 인증 관련 응답 ---------------------------- */

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number; // 토큰 만료까지 남은 초. 쿠키 maxAge 동기화에 사용
  member: AuthUser;
}

export interface MeResponse {
  member: AuthUser;
}

export interface CheckUsernameResponse {
  available: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
}

export interface AdminLoginResponse {
  token: string;
  expiresIn: number; // 토큰 만료까지 남은 초. 쿠키 maxAge 동기화에 사용
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
