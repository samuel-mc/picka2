import type { ApiResponse } from "@/types/catalog";

export type PostType = "ANALYSIS" | "PICK_SIMPLE" | "PARLEY";
export type PostVisibility = "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE";
export type ReactionType = "LIKE" | "DISLIKE";
export type ResultStatus = "PENDING" | "WON" | "LOST" | "VOID";

export interface Sportsbook {
  id: number;
  name: string;
  baseUrl: string | null;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
}

export interface PostAuthor {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  validatedTipster: boolean;
  badge: string | null;
  followedByCurrentUser?: boolean | null;
}

export interface PostPick {
  id: number;
  sportId: number;
  sport: string;
  leagueId: number;
  league: string;
  stake: number;
  sportsbook: Sportsbook | null;
  eventDate: string;
  resultStatus: ResultStatus;
}

export interface PostParley {
  id: number;
  stake: number;
  sportsbook: Sportsbook | null;
  eventDate: string;
  resultStatus: ResultStatus;
}

export interface ParleySelection {
  id: number;
  sportId: number;
  sport: string;
  leagueId: number;
  league: string;
}

export interface PostMetrics {
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  savesCount: number;
  viewsCount: number;
  sharesCount: number;
  repostsCount: number;
  currentUserReaction: ReactionType | null;
  savedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
}

export interface PostItem {
  id: number;
  type: PostType;
  content: string;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
  timelineEntryId: string;
  repostEntry: boolean;
  repostedAt: string | null;
  author: PostAuthor;
  repostedBy: PostAuthor | null;
  mediaUrls: string[];
  tags: string[];
  simplePick: PostPick | null;
  parley: PostParley | null;
  parleySelections: ParleySelection[];
  metrics: PostMetrics;
}

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  parentCommentId: number | null;
  replyingToUsername: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  replies: CommentItem[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface FollowingFeedResponse {
  feed: PagedResponse<PostItem>;
  followingCount: number;
}

export interface PostPickRequest {
  sportId: number;
  leagueId: number;
  stake: number;
  sportsbookId?: number | null;
  eventDate: string;
  resultStatus?: ResultStatus;
}

export interface PostParleyRequest {
  selections: Array<{
    sportId: number;
    leagueId: number;
  }>;
  stake: number;
  sportsbookId?: number | null;
  eventDate: string;
  resultStatus?: ResultStatus;
}

export interface CreatePostPayload {
  type: PostType;
  content: string;
  imageKey?: string | null;
  tags: string[];
  visibility: PostVisibility;
  simplePick?: PostPickRequest | null;
  parley?: PostParleyRequest | null;
}

export type PostsApiResponse<T> = ApiResponse<T>;
