import axios from "axios";
import { getToken, setToken, removeToken, removeUser, setUser } from "../utils/token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshPromise = null;

const signOut = () => {
  removeToken();
  removeUser();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then(({ data }) => {
        setToken(data.token);
        if (data.username && data.userId) {
          setUser({
            username: data.username,
            userId: data.userId,
            email: data.email,
          });
        }
        return data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isAuthEndpoint = config?.url?.includes("/auth/");

    if (config && error.response?.status === 401 && !isAuthEndpoint && !config._retried) {
      config._retried = true;
      try {
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshError) {
        signOut();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !isAuthEndpoint) {
      signOut();
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || "Something went wrong";
};

export default api;