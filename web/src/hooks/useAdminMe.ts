import { useQuery } from "@tanstack/react-query";
import { adminAuthApi } from "@/api";
import { getAdminAccessToken } from "@/utils/cookie";
import { queryClient } from "@/queryClient";

// 현재 로그인 관리자 정보. 서버 /admin/my/profile 로 토큰 유효성까지 확인한다.
// 쿠키가 없으면 요청 자체를 보내지 않는다(enabled). 위조/만료 토큰은 401 → isError.
export function useAdminMe() {
  return useQuery({
    queryKey: ["adminMe"],
    queryFn: async () => (await adminAuthApi.me()).admin,
    enabled: !!getAdminAccessToken(),
    staleTime: 5 * 60 * 1000,
  });
}

// 로그인 직후: 캐시된 이전 관리자 정보를 무효화 → 새 계정으로 다시 조회
export function refreshAdminMe() {
  return queryClient.invalidateQueries({ queryKey: ["adminMe"] });
}

// 로그아웃 시: 관리자 정보 캐시 제거 → 이전 계정 정보가 남지 않도록
export function removeAdminMe() {
  queryClient.removeQueries({ queryKey: ["adminMe"] });
}
