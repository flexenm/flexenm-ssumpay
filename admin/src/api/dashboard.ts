import { adminApi } from "@/api/fetch";
import type { DashboardSummary, DataResponse } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchDashboardApiPath = "/admin/dashboard";

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchDashboard() {
  const { data } = await adminApi.get<DataResponse<DashboardSummary>>(fetchDashboardApiPath);
  return data.data;
}
