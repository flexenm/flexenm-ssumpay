import { useQuery } from "@tanstack/react-query";
import { fetchMypage, mypageApiPath } from "@/api/mypage";

export function useFetchMypage() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [mypageApiPath],
    queryFn: () => fetchMypage(),
  });

  return { mypage: data, refetch, isLoading };
}
