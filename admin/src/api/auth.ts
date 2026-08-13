import { adminApi, plainAdminApi } from "@/api/fetch";
import type { AdminLoginResponse, AdminMeResponse, MessageResponse } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */
// 어드민은 전용 도메인이라 라우트에 /admin prefix 가 없지만, API 경로는 서버 계약이라 유지한다.

export const meApiPath = "/admin/my/profile";
export const loginApiPath = "/admin/auth/login";
export const logoutApiPath = "/admin/auth/logout";
export const refreshApiPath = "/admin/auth/refresh";

/* --------------------------------- 요청 타입 -------------------------------- */

export interface LoginParams {
  username: string;
  password: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchMe() {
  const { data } = await adminApi.get<AdminMeResponse>(meApiPath);
  return data.admin;
}

// 서버가 Set-Cookie 로 토큰을 내려준다 — 응답 body 에 토큰이 없다.
export async function login(params: LoginParams) {
  const { data } = await adminApi.post<AdminLoginResponse>(
    loginApiPath,
    params,
  );
  return data.admin;
}

// plainAdminApi — 이 요청 자신의 401 이 다시 갱신을 트리거하면 안 된다 (fetch.ts 주석 참조)
export async function refreshAccessToken() {
  const { data } = await plainAdminApi.post<AdminLoginResponse>(refreshApiPath);
  return data.admin;
}

// plainAdminApi — 이미 만료된 세션의 로그아웃이 갱신을 유발하지 않도록
export async function logout() {
  await plainAdminApi.post<MessageResponse>(logoutApiPath);
}
