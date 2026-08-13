import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductsApiPath } from "@/api/products";
import type { FetchProductsParams } from "@/api/products";

export function useFetchProducts(params: FetchProductsParams = {}) {
  const { data, refetch, isLoading } = useQuery({
    queryKey: [fetchProductsApiPath, params],
    queryFn: () => fetchProducts(params),
  });

  return { products: data ?? [], refetch, isLoading };
}
