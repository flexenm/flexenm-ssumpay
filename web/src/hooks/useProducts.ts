import { useQuery } from "@tanstack/react-query";
import {
  fetchProduct,
  fetchProducts,
  fetchProductsApiPath,
  getFetchProductApiPath,
} from "@/api/products";
import type { FetchProductsParams } from "@/api/products";

interface UseFetchProductsParams extends FetchProductsParams {
  enabled?: boolean;
}

// 상품 목록. category/subcategory 파라미터별로 캐시를 분리한다.
// 전체상품은 파라미터 없이 호출된다.
export function useFetchProducts({
  enabled = true,
  ...params
}: UseFetchProductsParams = {}) {
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: [fetchProductsApiPath, params],
    queryFn: () => fetchProducts(params),
    enabled,
    staleTime: 60 * 1000,
  });

  return { products: data ?? [], refetch, isLoading, isError };
}

// 상품 상세. 주문 페이지 등에서 공유.
export function useFetchProduct({ id }: { id?: number | string }) {
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: [getFetchProductApiPath(id ?? "")],
    queryFn: () => fetchProduct(id!),
    enabled: id != null && id !== "",
    staleTime: 60 * 1000,
  });

  return { product: data, refetch, isLoading, isError };
}
