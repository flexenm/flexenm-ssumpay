import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api";
import { getAccessToken } from "@/utils/cookie";
import { queryClient } from "@/queryClient";

// 현재 로그인 사용자 정보. 서버 /api/my/profile 로 토큰 유효성까지 확인한다.
// 쿠키가 없으면 요청 자체를 보내지 않는다(enabled). 위조/만료 토큰은 401 → isError.
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await authApi.me()).member,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
  });
}

// 로그인 직후: 캐시된 이전 사용자 정보를 무효화 → 새 계정으로 다시 조회
export function refreshMe() {
  return queryClient.invalidateQueries({ queryKey: ["me"] });
}

// 로그아웃 시: 사용자 정보 캐시 제거 → 이전 계정 정보가 남지 않도록
export function removeMe() {
  queryClient.removeQueries({ queryKey: ["me"] });
}
