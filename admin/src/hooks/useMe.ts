import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { fetchMe, meApiPath } from "@/api/auth";
import { queryClient } from "@/queryClient";
import type { AdminUser } from "@/types";

// 401 을 에러가 아니라 "비로그인"이라는 정상 데이터(null)로 취급한다.
// 이 한 가지로 enabled 플래그가 필요 없어지고(= v5 의 enabled:false → status:'pending' 무한 로딩 함정
// 자체가 사라진다), 가드에서 isError 분기도 사라진다.
async function loadMe(): Promise<AdminUser | null> {
  try {
    return await fetchMe();
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    // 비-401(500·네트워크)은 의도적으로 rethrow → 쿼리 에러 → 비로그인 취급 → /signin.
    // 인증 상태가 불확실할 때 통과시키는 것보다 넘어뜨리는 쪽이 안전하다.
    throw error;
  }
}

// 로그인 직후: 캐시된 이전 관리자 정보를 무효화 → 새 계정으로 다시 조회.
// refetchType:"all" 이 필수다. 기본값 "active" 는 구독 중인 쿼리만 재요청하는데,
// 로그인 화면에는 useMe 를 쓰는 컴포넌트가 없어 이 쿼리가 inactive 다. 그러면 재요청 없이 즉시
// resolve 되고, 캐시에는 로그아웃 시절의 null 이 남아 있어 이동 직후 가드가 다시 로그인 화면으로 되돌린다.
export async function refreshMe() {
  await queryClient.invalidateQueries({ queryKey: [meApiPath], refetchType: "all" });
}

// 인증 종료 시 me 캐시를 재요청 없이 비로그인(null)으로 정리한다
export function clearMe() {
  queryClient.setQueryData([meApiPath], null);
}

export function useMe() {
  const {
    data: me,
    refetch,
    isLoading,
  } = useQuery<AdminUser | null>({
    queryKey: [meApiPath],
    queryFn: loadMe,
  });

  return { me, isLoggedIn: !!me, isLoading, refetch };
}
