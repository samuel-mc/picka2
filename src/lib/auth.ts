import { useAuthStore } from "@/stores/authStore";

export const getAuthRole = () => useAuthStore.getState().role;

export const getDefaultAppPath = (role: string | null | undefined) => {
  if (role === "ROLE_ADMIN") return "/admin/panel";
  if (role === "ROLE_TIPSTER") return "/feed";
  return "/";
};

export const getAuthUserId = (): number | null => {
  const userId = useAuthStore.getState().userId;
  return userId != null && Number.isFinite(userId) ? userId : null;
};

export const isAuthenticated = () => useAuthStore.getState().authenticated;

export const clearAuthSession = () => {
  useAuthStore.getState().clearAuth();
};
