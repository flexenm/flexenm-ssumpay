import { useQuery } from "@tanstack/react-query";
import {
  fetchInquiries,
  fetchInquiriesApiPath,
  fetchInquiry,
  getFetchInquiryApiPath,
} from "@/api/inquiries";
import type { FetchInquiriesParams } from "@/api/inquiries";
import { queryClient } from "@/queryClient";

// 답변 등록 후 목록으로 이동할 때 호출한다. 목록은 invalidate, 상세는 remove —
// 이유는 useNotices.ts 의 refreshNotices 주석 참조.
export async function refreshInquiries({ id }: { id?: number | string } = {}) {
  if (id != null)
    queryClient.removeQueries({ queryKey: [getFetchInquiryApiPath(id)] });
  await queryClient.invalidateQueries({ queryKey: [fetchInquiriesApiPath] });
}

export function useFetchInquiries(params: FetchInquiriesParams = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchInquiriesApiPath, params],
    queryFn: () => fetchInquiries(params),
  });

  return { inquiries: data ?? [], refetch, isLoading };
}

export function useFetchInquiry({ id }: { id?: number | string }) {
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: [getFetchInquiryApiPath(id ?? "")],
    queryFn: () => fetchInquiry(id!),
    enabled: id != null && id !== "",
  });

  return { inquiry: data, refetch, isLoading, isError };
}
