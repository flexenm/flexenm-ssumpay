import { parseCookies, setCookie, destroyCookie } from "nookies";
import type { AdminUser } from "../types";

// maxAge 미설정(세션 쿠키). 토큰 유효기간은 서버 JWT exp가 관장한다.
const opts = {
  path: "/",
  sameSite: "lax",
  secure: import.meta.env.PROD,
} as const;

// 사용자 토큰
export const getAccessToken = (): string | null =>
  parseCookies().accessToken || null;
export const setAccessToken = (t: string, maxAge: number): void => {
  setCookie(null, "accessToken", t, { ...opts, maxAge });
};
export const removeAccessToken = (): void => {
  destroyCookie(null, "accessToken", { path: "/" });
};

// 관리자 토큰
export const getAdminAccessToken = (): string | null =>
  parseCookies().adminAccessToken || null;
export const setAdminAccessToken = (t: string, maxAge: number): void => {
  setCookie(null, "adminAccessToken", t, { ...opts, maxAge });
};
export const removeAdminAccessToken = (): void => {
  destroyCookie(null, "adminAccessToken", { path: "/" });
};

// 관리자 정보(JSON)
export const getAdminInfo = (): Partial<AdminUser> => {
  try {
    return JSON.parse(parseCookies().adminInfo || "{}");
  } catch {
    return {};
  }
};
export const setAdminInfo = (o: AdminUser, maxAge: number): void => {
  setCookie(null, "adminInfo", JSON.stringify(o), { ...opts, maxAge });
};
export const removeAdminInfo = (): void => {
  destroyCookie(null, "adminInfo", { path: "/" });
};
