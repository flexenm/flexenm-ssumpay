import axios from "axios";
import { getAccessToken, getAdminAccessToken } from "../utils/cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

export const api = axios.create({ baseURL: BASE_URL });
export const adminApi = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
