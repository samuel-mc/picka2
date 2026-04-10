import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function useLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = async (
    username: string, 
    password: string, 
    redirectPath: string = "/"
  ) => {
    setError("");
    setIsLoading(true);
    const baseUrl = import.meta.env.VITE_API_URL;
    const url = baseUrl + "/auth/login";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Credenciales incorrectas");

      const data = await res.json();
      const uid =
        typeof data.userId === "number"
          ? data.userId
          : data.userId != null
            ? Number(data.userId)
            : null;
      setAuth(data.token, data?.role, Number.isFinite(uid) ? uid : null);
      setIsLoading(false);
      navigate(redirectPath);
      return data;
    } catch (err: any) {
      setIsLoading(false);
      const message = err.message ?? "No fue posible iniciar sesión";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return { login, logout, error, isLoading };
}
