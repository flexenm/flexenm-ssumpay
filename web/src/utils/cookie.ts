import { parseCookies, setCookie, destroyCookie } from "nookies";

// maxAge 미설정(세션 쿠키). 토큰 유효기간은 서버 JWT exp가 관장한다.
const opts = {
  path: "/",
  sameSite: "lax",
  secure: import.meta.env.PROD,
} as const;

// 사용자 토큰. domain 미지정(host-only)이라 다른 서브도메인으로 새지 않는다.
export const getAccessToken = (): string | null =>
  parseCookies().accessToken || null;
export const setAccessToken = (t: string, maxAge: number): void => {
  setCookie(null, "accessToken", t, { ...opts, maxAge });
};
export const removeAccessToken = (): void => {
  destroyCookie(null, "accessToken", { path: "/" });
};
