import { adminApi } from "@/api/fetch";
import type { Product } from "@/types";

/* ---------------------------------- 경로 ---------------------------------- */

export const fetchProductsApiPath = "/admin/products";
export const createProductApiPath = "/admin/products";
export const getProductApiPath = (id: number | string) => `/admin/products/${id}`;

/* --------------------------------- 요청 타입 -------------------------------- */

export interface FetchProductsParams {
  category?: string;
  keyword?: string;
}

export interface ProductParams {
  category: string;
  subcategory: string;
  name: string;
  price: number;
  lexAmount?: number;
  coinAmount?: number;
  isActive?: 0 | 1;
  sort?: number;
}

/* ---------------------------------- 함수 ---------------------------------- */

export async function fetchProducts(params?: FetchProductsParams) {
  const { data } = await adminApi.get<Product[]>(fetchProductsApiPath, { params });
  return data;
}

export async function createProduct(params: ProductParams) {
  const { data } = await adminApi.post<Product>(createProductApiPath, params);
  return data;
}

export async function updateProduct(id: number | string, params: Partial<ProductParams>) {
  const { data } = await adminApi.put<Product>(getProductApiPath(id), params);
  return data;
}

export async function deleteProduct(id: number | string) {
  await adminApi.delete(getProductApiPath(id));
}
