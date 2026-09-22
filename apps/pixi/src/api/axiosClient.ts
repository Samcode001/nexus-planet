import axios, { AxiosError } from "axios";
import { useAuth } from "../auth/AuthProvider";
import type { InternalAxiosRequestConfig } from "axios";

// Create plain axios instance (no auth)
export const api = axios.create({
  //   baseURL: "http://localhost:3000/v1",
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  withCredentials: true, // important so browser sends refresh cookie to /auth/refresh
});

/**
 * Hook that returns an axios instance which will use the in-memory token.
 * We make a small wrapper hook because interceptors need access to current token and refresh function.
 */

export const useAxiosAuth = () => {
  const { accessToken, refreshAccessToken } = useAuth();

  // Create instance
  const axiosAuth = axios.create({
    //New axios instance that will be used only for authenticated calls.
    baseURL: import.meta.env.VITE_USER_API_URL,
    // baseURL: "http://localhost:3000/api",
    withCredentials: true,
  });

  // request interceptor
  axiosAuth.interceptors.request.use((config) => {
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  });

  // response interceptor for 401 -> try refresh once
  axiosAuth.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalReq = error.config as RetryableErrorConfig;
      if (error.response?.status === 401 && !originalReq._retry) {
        originalReq._retry = true;
        const newToken = await refreshAccessToken();
        if (newToken && originalReq.headers) {
          originalReq.headers["Authorization"] = `Bearer ${newToken}`;
          return axiosAuth(originalReq);
        }
      }
      return Promise.reject(error);
    },
  );

  return axiosAuth;
};

type RetryableErrorConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};
