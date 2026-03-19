import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      localStorage.setItem("token", data.token);
      // Solo agregar el ROL a local storage si es un admin
      if (data != null && data.role != null && data.role === "ROLE_ADMIN") {
        localStorage.setItem("role", data.role);
      }
      setIsLoading(false);
      navigate(redirectPath);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return { login, logout, error, isLoading };
}
