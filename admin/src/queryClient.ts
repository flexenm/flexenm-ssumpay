import { QueryClient } from "@tanstack/react-query";

// 컴포넌트 밖(refreshMe/removeMe 등)에서도 캐시를 조작할 수 있도록 단일 인스턴스를 모듈로 노출한다.
// retry:false — 인증(401) 등 실패를 재시도하지 않고 즉시 가드가 판정하도록 한다.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
