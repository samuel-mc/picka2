import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDefaultAppPath } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

type PasswordCredentialConstructor = new (data: {
  id: string;
  password: string;
  name?: string;
}) => Credential;

async function storeLoginCredential(username: string, password: string) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!window.isSecureContext) return;
  if (!("credentials" in navigator)) return;

  const credentialsApi = navigator.credentials;
  const PasswordCredentialCtor = (
    window as Window & { PasswordCredential?: PasswordCredentialConstructor }
  ).PasswordCredential;

  if (!credentialsApi?.store || !PasswordCredentialCtor) return;

  try {
    const credential = new PasswordCredentialCtor({
      id: username,
      password,
      name: username,
    });

    await credentialsApi.store(credential);
  } catch {
    // Ignore browser-specific failures so login flow continues normally.
  }
}

export function useLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const role = useAuthStore((state) => state.role);

  const login = async (
    username: string, 
    password: string, 
    redirectPath?: string
  ) => {
    setError("");
    setIsLoading(true);
    const baseUrl = import.meta.env.VITE_API_URL;
    const url = baseUrl + "/auth/login";
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
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
      setAuth({
        role: data?.role,
        userId: Number.isFinite(uid) ? uid : null,
        username: typeof data?.username === "string" ? data.username : null,
      });
      await storeLoginCredential(username, password);
      setIsLoading(false);
      navigate(redirectPath ?? getDefaultAppPath(typeof data?.role === "string" ? data.role : null));
      return data;
    } catch (err: any) {
      setIsLoading(false);
      const message = err.message ?? "No fue posible iniciar sesión";
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    void (async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Ignore logout transport failures and clear local session anyway.
      } finally {
        clearAuth();
        navigate(role === "ROLE_ADMIN" ? "/admin/login" : "/login");
      }
    })();
  };

  return { login, logout, error, isLoading };
}
