import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (username: string, password: string) => {
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
      setIsLoading(false);
      navigate("/user/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  return { login, error, isLoading };
}
