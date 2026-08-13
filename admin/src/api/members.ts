import { adminApi } from "@/api/fetch";
import type { DataResponse, ListResponse, Member } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchMembersApiPath = "/admin/members";
export const getFetchMemberApiPath = (id: number | string) => `/admin/members/${id}`;
export const getUpdateMemberStatusApiPath = (id: number | string) =>
  `/admin/members/${id}/status`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchMembersParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchMembers(params?: FetchMembersParams) {
  const { data } = await adminApi.get<ListResponse<Member>>(fetchMembersApiPath, { params });
  return data.data;
}

export async function fetchMember(id: number | string) {
  const { data } = await adminApi.get<DataResponse<Member>>(getFetchMemberApiPath(id));
  return data.data;
}

export async function updateMemberStatus(id: number | string, status: number) {
  await adminApi.patch(getUpdateMemberStatusApiPath(id), { status });
}
