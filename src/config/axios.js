import axios from "axios";
import { refreshToken } from "../services/AuthServices";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isTokenExpired = (token) => {
  if (!token) {
    console.log("No token provided");
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    return isExpired;
  } catch (e) {
    console.error("Error decoding token:", e.message);
    return true;
  }
};

instance.interceptors.request.use(async (config) => {
  if (config.url.includes("/auth/refresh-token")) {
    console.log("Bỏ qua interceptor cho refresh-token:", config.url);
    return config;
  }

  const token = localStorage.getItem("accessToken");
  const refreshTokenValue = localStorage.getItem("refreshToken");

  // Nếu không có accessToken nhưng có refreshToken, thử làm mới
  if (!token && refreshTokenValue) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            config.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(config);
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const data = await refreshToken();
      const newToken = data?.accessToken;
      if (!newToken) {
        throw new Error("No new access token received");
      }
      localStorage.setItem("accessToken", newToken);
      processQueue(null, newToken);
      config.headers["Authorization"] = `Bearer ${newToken}`;
      return config;
    } catch (error) {
      console.error("Refresh token failed:", error.message);
      processQueue(error, null);
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  if (token && !isTokenExpired(token)) {
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  }

  if (token && isTokenExpired(token) && refreshTokenValue) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            config.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(config);
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const data = await refreshToken();
      const newToken = data?.accessToken;
      if (!newToken) {
        throw new Error("No new access token received");
      }
      localStorage.setItem("accessToken", newToken);
      console.log("Token refreshed successfully");
      processQueue(null, newToken);
      config.headers["Authorization"] = `Bearer ${newToken}`;
      return config;
    } catch (error) {
      console.error("Refresh token failed:", error.message);
      processQueue(error, null);
      throw error;
    } finally {
      isRefreshing = false;
      console.log("Token refresh completed, isRefreshing:", isRefreshing);
    }
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(`Response error for ${originalRequest.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      retry: originalRequest._retry,
    });

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const data = await refreshToken();
          const newToken = data?.accessToken;
          if (!newToken) {
            throw new Error("No new access token received");
          }
          localStorage.setItem("accessToken", newToken);
          console.log("Token refreshed on retry");
          processQueue(null, newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (e) {
          console.error("Refresh token failed on retry:", e.message);
          processQueue(e, null);
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          },
          reject,
        });
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
