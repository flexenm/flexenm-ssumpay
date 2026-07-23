import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api";

// 상품 목록. category/subcategory 파라미터별로 캐시를 분리한다.
// 전체상품은 파라미터 없이 호출된다.
export function useProducts(params?: {
  category?: string;
  subcategory?: string;
}) {
  return useQuery({
    queryKey: ["products", params?.category ?? null, params?.subcategory ?? null],
    queryFn: async () => (await productsApi.list(params)).data,
    staleTime: 60 * 1000,
  });
}

// 상품 상세. 주문 페이지 등에서 공유.
export function useProduct(id?: number | string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => (await productsApi.get(id!)).data,
    enabled: id != null && id !== "",
    staleTime: 60 * 1000,
  });
}
