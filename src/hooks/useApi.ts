import { useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "@/lib/auth";

const getUnauthorizedRedirectPath = () => {
  if (typeof window === "undefined") {
    return "/login";
  }

  return window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
};

export const useApi = () => {
  const navigate = useNavigate();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(
      (config) => {
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
          navigate(getUnauthorizedRedirectPath());
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [navigate]);

  return api;
};
