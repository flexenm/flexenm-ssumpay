import { isAxiosError } from "axios";

export interface ApiError {
  status: number | null;
  message: string | null;
}

// 서버 message 는 string / string[] / 객체 등 shape 가 제각각일 수 있다.
// alert 등 렌더에 안전하도록 string 만 통과시키고, 문자열 배열은 join, 그 외(객체)는 버린다.
function normalizeMessage(raw: unknown): string | null {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const strings = raw.filter(
      (item): item is string => typeof item === "string",
    );
    return strings.length > 0 ? strings.join("\n") : null;
  }
  return null;
}

// API 에러에서 status 와 message 를 함께 추출한다.
// 이 서버의 에러 응답은 index.js 전역 핸들러가 만드는 { code, message } 이므로 data.message 가 1순위.
// 호출부는 `getApiError(err).message ?? '액션별 fallback'` 형태로 쓴다.
export function getApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) return { status: null, message: null };

  return {
    status: error.response?.status ?? null,
    message: normalizeMessage(
      error.response?.data?.message ?? error.response?.data?.error?.message,
    ),
  };
}
