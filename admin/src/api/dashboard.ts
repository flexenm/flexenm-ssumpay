import { adminApi } from "@/api/fetch";
import type { DashboardSummary } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchDashboardApiPath = "/admin/dashboard";

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchDashboard() {
  const { data } = await adminApi.get<DashboardSummary>(fetchDashboardApiPath);
  return data;
}
