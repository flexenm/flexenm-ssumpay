import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken } from "@/api/auth";
import { clearMe } from "@/hooks/useMe";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

const config = {
  baseURL: BASE_URL,
  // 인증이 HttpOnly 쿠키라 크로스오리진 요청에도 쿠키를 실어야 한다.
  withCredentials: true,
};

export const api = axios.create(config);

// 인터셉터를 붙이지 않는다 — 갱신·로그아웃 요청이 자기 401 핸들러로 되돌아오는 경로를 구조적으로 차단.
// URL 문자열 비교로 제외하는 방법도 있지만 경로가 어긋나면 조용히 재귀가 되살아난다.
// (refresh 자신의 401 이 큐에 밀려 들어가면 settle 되지 않아 isRefreshing 이 true 로 고착되고,
//  이후 모든 401 처리가 마비된다.)
export const plainApi = axios.create(config);

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingRetries: ((error: unknown | null) => void)[] = [];

const notifyPendingRetries = (error: unknown | null) => {
  pendingRetries.forEach((cb) => cb(error));
  pendingRetries = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !config) return Promise.reject(error);
    if (config._retry) return Promise.reject(error);
    config._retry = true;

    // 이미 갱신이 진행 중이면 결과를 기다렸다 재시도한다 → 동시 401 이 몰려도 refresh 는 1회만.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRetries.push((err) =>
          err ? reject(err) : resolve(api(config)),
        );
      });
    }

    isRefreshing = true;
    try {
      // 서버가 Set-Cookie 로 새 토큰 쌍을 내려준다. JS 는 토큰을 만지지 않는다.
      await refreshAccessToken();
      notifyPendingRetries(null);
      return api(config);
    } catch (refreshError) {
      notifyPendingRetries(refreshError);
      // me 캐시를 비로그인(null)으로 정리하면 가드가 구독 중이라 자연히 /signin 으로 간다.
      // window.location 으로 강제 이동하지 않는 이유.
      clearMe();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
