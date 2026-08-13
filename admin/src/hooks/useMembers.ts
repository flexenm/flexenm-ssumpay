import { useQuery } from "@tanstack/react-query";
import { fetchMembers, fetchMembersApiPath } from "@/api/members";
import type { FetchMembersParams } from "@/api/members";

export function useFetchMembers(params: FetchMembersParams = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchMembersApiPath, params],
    queryFn: () => fetchMembers(params),
  });

  return { members: data ?? [], refetch, isLoading };
}
