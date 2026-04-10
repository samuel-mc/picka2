import { useAuthStore } from "@/stores/authStore";

export const getAuthToken = () => useAuthStore.getState().token;

export const getAuthRole = () => useAuthStore.getState().role;

export const getAuthUserId = (): number | null => {
  const fromStore = useAuthStore.getState().userId;
  if (fromStore != null && Number.isFinite(fromStore)) {
    return fromStore;
  }
  const token = useAuthStore.getState().token;
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const uid = json.userId;
    if (typeof uid === "number" && Number.isFinite(uid)) return uid;
    if (uid != null) {
      const n = Number(uid);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  useAuthStore.getState().clearAuth();
};
