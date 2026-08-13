import { parseCookies, setCookie, destroyCookie } from "nookies";

// maxAge 미설정(세션 쿠키). 토큰 유효기간은 서버 JWT exp가 관장한다.
const opts = {
  path: "/",
  sameSite: "lax",
  secure: import.meta.env.PROD,
} as const;

// 관리자 토큰. domain 미지정(host-only)이라 admin 도메인 밖으로 새지 않는다.
export const getAdminAccessToken = (): string | null =>
  parseCookies().adminAccessToken || null;
export const setAdminAccessToken = (t: string, maxAge: number): void => {
  setCookie(null, "adminAccessToken", t, { ...opts, maxAge });
};
export const removeAdminAccessToken = (): void => {
  destroyCookie(null, "adminAccessToken", { path: "/" });
};

// 관리자 정보는 서버 /admin/my/profile(useMe)로 조회하므로 쿠키에 저장하지 않는다.
