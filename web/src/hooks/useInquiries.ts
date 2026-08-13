import { useQuery } from "@tanstack/react-query";
import {
  fetchInquiries,
  fetchInquiriesApiPath,
  fetchInquiry,
  getInquiryApiPath,
} from "@/api/inquiries";
import { queryClient } from "@/queryClient";

// 삭제 후 목록으로 돌아갈 때 호출한다. 그 화면에 머무는 갱신(수정 등)은 훅이 주는 refetch 를 쓴다.
// 목록은 invalidate(구독 중일 때만 재요청), 상세는 remove(삭제된 항목이 캐시로 다시 보이지 않게).
export async function refreshInquiries({ id }: { id?: number | string } = {}) {
  if (id != null)
    queryClient.removeQueries({ queryKey: [getInquiryApiPath(id)] });
  await queryClient.invalidateQueries({ queryKey: [fetchInquiriesApiPath] });
}

// enabled — 로그인 여부·탭 활성 여부로 조회를 게이팅한다.
// 로딩 UI 는 isPending 이 아니라 isLoading(= isPending && isFetching) 으로 구동한다.
// v5 는 enabled:false 일 때도 status 가 'pending' 이라, isPending 으로 스피너를 띄우면
// 조회하지 않는 상태에서 영영 걷히지 않는다.
export function useFetchInquiries({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchInquiriesApiPath],
    queryFn: () => fetchInquiries(),
    enabled,
  });

  return { inquiries: data ?? [], refetch, isLoading };
}

export function useFetchInquiry({ id }: { id?: string }) {
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: [getInquiryApiPath(id ?? "")],
    queryFn: () => fetchInquiry(id!),
    enabled: !!id,
  });

  return { inquiry: data, refetch, isLoading, isError };
}
