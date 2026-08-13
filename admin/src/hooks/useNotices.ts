import { useQuery } from "@tanstack/react-query";
import {
  fetchNotice,
  fetchNotices,
  fetchNoticesApiPath,
  getNoticeApiPath,
} from "@/api/notices";
import type { FetchNoticesParams } from "@/api/notices";
import { queryClient } from "@/queryClient";

// 등록·수정·삭제 후 화면을 떠날 때 호출한다. 그 화면에 머무는 갱신은 훅이 주는 refetch 를 쓴다.
//
// 목록은 invalidate — 구독 중인 목록만 재요청하고, 없으면 다음 마운트로 미룬다.
// 상세는 remove — invalidate 는 캐시를 지우지 않고 stale 표시만 하므로, 편집 화면에 다시 들어오면
// 재조회가 끝나기 전에 옛 값이 먼저 폼에 시딩된다. 시딩 effect 는 id 기준이라(입력 보호) 새 값이
// 도착해도 다시 시딩되지 않아 옛 값이 그대로 남는다. 그래서 상세는 캐시를 아예 비운다.
export async function refreshNotices({ id }: { id?: number | string } = {}) {
  if (id != null)
    queryClient.removeQueries({ queryKey: [getNoticeApiPath(id)] });
  await queryClient.invalidateQueries({ queryKey: [fetchNoticesApiPath] });
}

export function useFetchNotices(params: FetchNoticesParams = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchNoticesApiPath, params],
    queryFn: () => fetchNotices(params),
  });

  return { notices: data ?? [], refetch, isLoading };
}

export function useFetchNotice({ id }: { id?: number | string }) {
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: [getNoticeApiPath(id ?? "")],
    queryFn: () => fetchNotice(id!),
    enabled: id != null && id !== "",
  });

  return { notice: data, refetch, isLoading, isError };
}
