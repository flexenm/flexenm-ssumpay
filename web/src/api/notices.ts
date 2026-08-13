import { api } from "@/api/fetch";
import type { ListResult, Notice } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchNoticesApiPath = "/api/notices";
export const getFetchNoticeApiPath = (id: number | string) =>
  `/api/notices/${id}`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchNoticesParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchNotices(params?: FetchNoticesParams) {
  const { data } = await api.get<ListResult<Notice>>(fetchNoticesApiPath, {
    params,
  });
  return data.items;
}

export async function fetchNotice(id: number | string) {
  const { data } = await api.get<Notice>(
    getFetchNoticeApiPath(id),
  );
  return data;
}
