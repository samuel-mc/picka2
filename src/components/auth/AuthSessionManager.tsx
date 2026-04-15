import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";

const LOGIN_ROUTES = new Set(["/login", "/admin/login"]);
const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/admin/login",
  "/registro",
  "/auth/verify-email",
  "/recuperar-contrasenia",
  "/reset-password",
]);

const isPublicPath = (pathname: string) =>
  PUBLIC_ROUTES.has(pathname) || pathname.startsWith("/posts/");

export function AuthSessionManager() {
  const initialized = useAuthStore((state) => state.initialized);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const location = useLocation();
  const navigate = useNavigate();
  const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/login";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/session`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (cancelled) return;
          clearAuth();
          if (!isPublicPath(location.pathname) && !LOGIN_ROUTES.has(location.pathname)) {
            toast.error("Tu sesion expiro. Inicia sesion nuevamente.");
            navigate(loginPath, { replace: true });
          } else {
            setInitialized(true);
          }
          return;
        }

        const data = await response.json();
        if (cancelled) return;
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
      } catch {
        if (cancelled) return;
        clearAuth();
        if (!isPublicPath(location.pathname) && !LOGIN_ROUTES.has(location.pathname)) {
          navigate(loginPath, { replace: true });
        } else {
          setInitialized(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearAuth, location.pathname, loginPath, navigate, setAuth, setInitialized]);

  useEffect(() => {
    if (!initialized) return;
  }, [initialized]);

  return null;
}
