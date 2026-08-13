import { api } from "@/api/fetch";
import type { Inquiry, ListResult } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchInquiriesApiPath = "/api/inquiries";
export const createInquiryApiPath = "/api/inquiries";
export const getInquiryApiPath = (id: number | string) =>
  `/api/inquiries/${id}`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchInquiriesParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface CreateInquiryParams {
  type: number;
  title: string;
  content: string;
  image?: File | null;
}

export interface UpdateInquiryParams {
  title?: string;
  content?: string;
  image?: File | null;
}

/* ---------------------------------- 함수 ---------------------------------- */

// 이미지 동반 전송이라 multipart. Content-Type 은 axios 가 boundary 와 함께 자동으로 붙인다.
function toFormData(params: Record<string, unknown>, image?: File | null) {
  const fd = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) fd.append(key, String(value));
  });
  if (image) fd.append("image", image);
  return fd;
}

export async function fetchInquiries(params?: FetchInquiriesParams) {
  const { data } = await api.get<ListResult<Inquiry>>(fetchInquiriesApiPath, {
    params,
  });
  return data.items;
}

export async function fetchInquiry(id: number | string) {
  const { data } = await api.get<Inquiry>(getInquiryApiPath(id));
  return data;
}

export async function createInquiry({ image, ...rest }: CreateInquiryParams) {
  const { data } = await api.post<Inquiry>(
    createInquiryApiPath,
    toFormData(rest, image),
  );
  return data;
}

export async function updateInquiry(
  id: number | string,
  { image, ...rest }: UpdateInquiryParams,
) {
  const { data } = await api.put<Inquiry>(
    getInquiryApiPath(id),
    toFormData(rest, image),
  );
  return data;
}

export async function deleteInquiry(id: number | string) {
  await api.delete(getInquiryApiPath(id));
}
