import axios from "axios";
import { getAccessToken } from "@/utils/cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
