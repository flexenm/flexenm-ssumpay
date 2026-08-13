import { api } from "@/api/fetch";
import type { DataResponse, Product } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchProductsApiPath = "/api/products";
export const getFetchProductApiPath = (id: number | string) =>
  `/api/products/${id}`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchProductsParams {
  category?: string;
  subcategory?: string;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchProducts(params?: FetchProductsParams) {
  const { data } = await api.get<DataResponse<Product[]>>(
    fetchProductsApiPath,
    { params },
  );
  return data.data;
}

export async function fetchProduct(id: number | string) {
  const { data } = await api.get<DataResponse<Product>>(
    getFetchProductApiPath(id),
  );
  return data.data;
}
