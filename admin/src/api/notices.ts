import { adminApi } from "@/api/fetch";
import type { ListResult, Notice } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchNoticesApiPath = "/admin/notices";
export const createNoticeApiPath = "/admin/notices";
export const getNoticeApiPath = (id: number | string) => `/admin/notices/${id}`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchNoticesParams {
  page?: number;
  limit?: number;
  keyword?: string;
  isPinned?: 0 | 1;
}

export interface NoticeParams {
  title: string;
  content: string;
  isPinned?: 0 | 1;
  isActive?: 0 | 1;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchNotices(params?: FetchNoticesParams) {
  const { data } = await adminApi.get<ListResult<Notice>>(fetchNoticesApiPath, { params });
  return data.items;
}

export async function fetchNotice(id: number | string) {
  const { data } = await adminApi.get<Notice>(getNoticeApiPath(id));
  return data;
}

export async function createNotice(params: NoticeParams) {
  const { data } = await adminApi.post<Notice>(createNoticeApiPath, params);
  return data;
}

export async function updateNotice(id: number | string, params: Partial<NoticeParams>) {
  const { data } = await adminApi.put<Notice>(getNoticeApiPath(id), params);
  return data;
}

export async function deleteNotice(id: number | string) {
  await adminApi.delete(getNoticeApiPath(id));
}
