import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuthStore } from "@/stores/authStore";
import type { ApiResponse } from "@/types/catalog";
import type { NotificationItem, NotificationListResponse } from "@/types/notifications";

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const api = useApi();
  const authenticated = useAuthStore((state) => state.authenticated);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!authenticated) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get<ApiResponse<NotificationListResponse>>("/notifications");
      setItems(data.data.items);
      setUnreadCount(data.data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [api, authenticated]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      await api.put(`/notifications/${notificationId}/read`);
      await loadNotifications();
    },
    [api, loadNotifications]
  );

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authenticated, loadNotifications]);

  return {
    items,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
  };
}
