import { useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "@/api/products";

// 상품 목록. category/subcategory 파라미터별로 캐시를 분리한다.
// 전체상품은 파라미터 없이 호출된다.
export function useProducts(params?: {
  category?: string;
  subcategory?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...listParams } = params ?? {};
  return useQuery({
    queryKey: [
      "products",
      listParams.category ?? null,
      listParams.subcategory ?? null,
    ],
    queryFn: () => fetchProducts(listParams),
    enabled,
    staleTime: 60 * 1000,
  });
}

// 상품 상세. 주문 페이지 등에서 공유.
export function useProduct(id?: number | string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id!),
    enabled: id != null && id !== "",
    staleTime: 60 * 1000,
  });
}
