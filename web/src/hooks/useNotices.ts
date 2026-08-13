import { useQuery } from "@tanstack/react-query";
import {
  fetchNotice,
  fetchNotices,
  fetchNoticesApiPath,
  getFetchNoticeApiPath,
} from "@/api/notices";

export function useFetchNotices() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchNoticesApiPath],
    queryFn: () => fetchNotices(),
  });

  return { notices: data ?? [], refetch, isLoading };
}

export function useFetchNotice({ id }: { id?: string }) {
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: [getFetchNoticeApiPath(id ?? "")],
    queryFn: () => fetchNotice(id!),
    enabled: !!id,
  });

  return { notice: data, refetch, isLoading, isError };
}
