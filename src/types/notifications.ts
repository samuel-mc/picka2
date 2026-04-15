export type NotificationType =
  | "FOLLOW_STARTED"
  | "POST_COMMENT"
  | "POST_LIKE"
  | "COMMENT_LIKE";

export interface NotificationActor {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  validatedTipster: boolean;
  badge: string | null;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  extraActorsCount: number;
  postId: number | null;
  commentId: number | null;
  targetUserId: number | null;
  actor: NotificationActor;
}

export interface NotificationListResponse {
  unreadCount: number;
  items: NotificationItem[];
}
