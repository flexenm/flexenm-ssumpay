import { api, plainApi } from "@/api/fetch";
import type { CheckUsernameResponse, LoginResponse, MeResponse, MessageResponse } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const meApiPath = "/api/my/profile";
export const loginApiPath = "/api/auth/login";
export const logoutApiPath = "/api/auth/logout";
export const refreshApiPath = "/api/auth/refresh";
export const registerApiPath = "/api/auth/register";
export const checkUsernameApiPath = "/api/auth/check-username";
export const passwordResetApiPath = "/api/auth/password/reset";
export const passwordResetConfirmApiPath = "/api/auth/password/reset/confirm";

/* --------------------------------- 요청 타입 -------------------------------- */

export interface RegisterParams {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface ResetPasswordParams {
  username: string;
  email: string;
}

export interface ConfirmResetPasswordParams {
  token: string;
  newPassword: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchMe() {
  const { data } = await api.get<MeResponse>(meApiPath);
  return data.member;
}

// 서버가 Set-Cookie 로 토큰을 내려준다 — 응답 body 에 토큰이 없다.
export async function login(params: LoginParams) {
  const { data } = await api.post<LoginResponse>(loginApiPath, params);
  return data.member;
}

// plainApi — 이 요청 자신의 401 이 다시 갱신을 트리거하면 안 된다 (fetch.ts 주석 참조)
export async function refreshAccessToken() {
  const { data } = await plainApi.post<LoginResponse>(refreshApiPath);
  return data.member;
}

// plainApi — 이미 만료된 세션의 로그아웃이 갱신을 유발하지 않도록
export async function logout() {
  await plainApi.post<MessageResponse>(logoutApiPath);
}

export async function checkUsername(username: string) {
  const { data } = await api.get<CheckUsernameResponse>(checkUsernameApiPath, {
    params: { username },
  });
  return data.available;
}

export async function register(params: RegisterParams) {
  await api.post<MessageResponse>(registerApiPath, params);
}

export async function requestPasswordReset(params: ResetPasswordParams) {
  await api.post<MessageResponse>(passwordResetApiPath, params);
}

export async function confirmPasswordReset(params: ConfirmResetPasswordParams) {
  await api.post<MessageResponse>(passwordResetConfirmApiPath, params);
}
