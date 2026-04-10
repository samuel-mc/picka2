import { useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthToken } from "@/lib/auth";

export const useApi = () => {
  const navigate = useNavigate();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          clearAuthSession();
          navigate("/");
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [navigate]);

  return api;
};
