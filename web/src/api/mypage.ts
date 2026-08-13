import { api } from "@/api/fetch";
import type { BaseResponse, DataResponse, Member } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const mypageApiPath = "/api/mypage";
export const changePasswordApiPath = "/api/mypage/password";

/* --------------------------------- 요청 타입 -------------------------------- */

export interface UpdateMypageParams {
  name?: string;
  phone?: string | null;
  flexUsername?: string | null;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchMypage() {
  const { data } = await api.get<DataResponse<Member>>(mypageApiPath);
  return data.data;
}

export async function updateMypage(params: UpdateMypageParams) {
  const { data } = await api.patch<DataResponse<Member>>(mypageApiPath, params);
  return data.data;
}

export async function changePassword(params: ChangePasswordParams) {
  await api.patch<BaseResponse>(changePasswordApiPath, params);
}
