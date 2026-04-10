import { useAuthStore } from "@/stores/authStore";

export const getAuthToken = () => useAuthStore.getState().token;

export const getAuthRole = () => useAuthStore.getState().role;

export const clearAuthSession = () => {
  useAuthStore.getState().clearAuth();
};
