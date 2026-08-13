import { adminApi } from "@/api/fetch";
import type { Inquiry, ListResult } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchInquiriesApiPath = "/admin/inquiries";
export const getFetchInquiryApiPath = (id: number | string) =>
  `/admin/inquiries/${id}`;
export const getAnswerInquiryApiPath = (id: number | string) =>
  `/admin/inquiries/${id}/answer`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchInquiriesParams {
  page?: number;
  limit?: number;
  keyword?: string;
  // 유형·상태는 백엔드 파라미터(server/routes/admin/inquiries.js)로 조회한다. 빈 문자열은 전체.
  status?: string;
  type?: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchInquiries(params?: FetchInquiriesParams) {
  const { data } = await adminApi.get<ListResult<Inquiry>>(
    fetchInquiriesApiPath,
    { params },
  );
  return data.items;
}

export async function fetchInquiry(id: number | string) {
  const { data } = await adminApi.get<Inquiry>(
    getFetchInquiryApiPath(id),
  );
  return data;
}

export async function answerInquiry(id: number | string, answer: string) {
  await adminApi.post(getAnswerInquiryApiPath(id), { answer });
}
