import { useQuery } from "@tanstack/react-query";
import { fetchDashboard, fetchDashboardApiPath } from "@/api/dashboard";

export function useFetchDashboard() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchDashboardApiPath],
    queryFn: () => fetchDashboard(),
  });

  return { dashboard: data, refetch, isLoading };
}
