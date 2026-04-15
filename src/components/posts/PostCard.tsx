import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  BadgeCheck,
  Bookmark,
  MessageCircle,
  Repeat2,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import type {
  CommentItem,
  PostItem,
  PostMetrics,
  ReactionType,
  ResultStatus,
} from "@/types/posts";
import {
  formatDate,
  getResultStatusClasses,
  getResultStatusLabel,
} from "@/components/posts/post-utils";

const GENERIC_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f4c81"/>
          <stop offset="100%" stop-color="#ed5f2f"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#bg)"/>
      <circle cx="60" cy="45" r="20" fill="rgba(255,255,255,0.92)"/>
      <path d="M28 98c5-18 18-28 32-28s27 10 32 28" fill="rgba(255,255,255,0.92)"/>
    </svg>
  `);

const MAX_REPLY_DEPTH = 2;

interface Props {
  post: PostItem;
  currentUserId: number | null;
  onViewProfile: (authorId: number) => void;
  onToggleReaction: (postId: number, type: ReactionType) => Promise<PostMetrics | null>;
  onToggleCommentLike: (postId: number, commentId: number) => Promise<CommentItem | null>;
  onToggleSave: (postId: number) => Promise<boolean | null>;
  onToggleRepost: (post: PostItem) => Promise<boolean | null>;
  onShare: (post: PostItem) => Promise<PostMetrics | null>;
  onLoadComments: (postId: number) => Promise<CommentItem[]>;
  onComment: (postId: number, content: string, parentCommentId?: number | null) => Promise<CommentItem | null>;
  onUpdatePickStatus: (postId: number, status: ResultStatus) => Promise<void>;
  onRegisterView: (postId: number) => Promise<void>;
  onToggleFollow?: (authorId: number, currentlyFollowing: boolean) => Promise<boolean | null>;
  followLoadingForAuthorId?: number | null;
  onOpenDetail?: (postId: number) => void;
  registerViewOnMount?: boolean;
  readOnly?: boolean;
  defaultCommentsOpen?: boolean;
  highlightCommentId?: number | null;
}

export function PostCard({
  post,
  currentUserId,
  onViewProfile,
  onToggleReaction,
  onToggleCommentLike,
  onToggleSave,
  onToggleRepost,
  onShare,
  onLoadComments,
  onComment,
  onUpdatePickStatus,
  onRegisterView,
  onToggleFollow,
  followLoadingForAuthorId = null,
  onOpenDetail,
  registerViewOnMount = true,
  readOnly = false,
  defaultCommentsOpen = false,
  highlightCommentId = null,
}: Props) {
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentValue, setCommentValue] = useState("");
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [activeReplyFor, setActiveReplyFor] = useState<number | null>(null);
  const [sendingReplyFor, setSendingReplyFor] = useState<number | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (!registerViewOnMount) {
      return;
    }
    void onRegisterView(post.id);
  }, [onRegisterView, post.id, registerViewOnMount]);

  useEffect(() => {
    if (readOnly || !commentsOpen || comments.length > 0) {
      return;
    }

    let cancelled = false;
    setLoadingComments(true);

    void (async () => {
      try {
        const loaded = await onLoadComments(post.id);
        if (!cancelled) {
          setComments(loaded);
        }
      } finally {
        if (!cancelled) {
          setLoadingComments(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [comments.length, commentsOpen, onLoadComments, post.id, readOnly]);

  useEffect(() => {
    if (!highlightCommentId || !commentsOpen || comments.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(`comment-${highlightCommentId}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [comments.length, commentsOpen, highlightCommentId]);

  const isOwner = currentUserId === post.author.id;
  const canOpenDetail = Boolean(onOpenDetail);
  const canFollowAuthor = Boolean(onToggleFollow) && !readOnly && !isOwner;
  const isFollowingAuthor = Boolean(post.author.followedByCurrentUser);
  const isFollowLoading = followLoadingForAuthorId === post.author.id;

  const handleOpenDetail = () => {
    if (!onOpenDetail) return;
    onOpenDetail(post.id);
  };

  const handleKeyboardOpenDetail = (event: KeyboardEvent<HTMLElement>) => {
    if (!onOpenDetail) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpenDetail(post.id);
  };

  const openComments = async () => {
    if (readOnly) {
      return;
    }
    setCommentsOpen((current) => !current);
  };

  const submitComment = async () => {
    if (readOnly) return;
    if (!commentValue.trim()) return;
    setSendingComment(true);
    try {
      const created = await onComment(post.id, commentValue);
      if (created) {
        setComments((current) => [...current, created]);
        setCommentValue("");
      }
    } finally {
      setSendingComment(false);
    }
  };

  const toggleCommentLike = async (commentId: number) => {
    if (readOnly) return;
    const updated = await onToggleCommentLike(post.id, commentId);
    if (!updated) return;
    setComments((current) =>
      updateCommentTree(current, commentId, (comment) => ({
        ...updated,
        replies: comment.replies,
      }))
    );
  };

  const submitReply = async (parentCommentId: number) => {
    const replyValue = replyDrafts[parentCommentId]?.trim();
    if (readOnly || !replyValue) return;

    setSendingReplyFor(parentCommentId);
    try {
      const created = await onComment(post.id, replyValue, parentCommentId);
      if (!created) return;

      setComments((current) => insertReplyIntoTree(current, parentCommentId, created));
      setReplyDrafts((current) => ({ ...current, [parentCommentId]: "" }));
      setActiveReplyFor(null);
    } finally {
      setSendingReplyFor(null);
    }
  };

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 shadow-[0_18px_55px_rgba(15,76,129,0.10)] backdrop-blur sm:rounded-[2rem]">
      <div className="p-4 sm:p-6">
        {post.repostEntry && post.repostedBy && (
          <div className="mb-4 flex items-center gap-2 rounded-full bg-[#edf5fb] px-4 py-2 text-sm font-medium text-[#0f4c81]">
            <Repeat2 className="h-4 w-4" />
            <span className="min-w-0 truncate">
              Reposteado por <strong>{post.repostedBy.name}</strong>
            </span>
            {post.repostedBy.validatedTipster && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
            {post.repostedAt && (
              <span className="ml-auto hidden text-xs text-slate-500 sm:inline">
                {formatDate(post.repostedAt)}
              </span>
            )}
          </div>
        )}

        <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <button
            type="button"
            onClick={() => onViewProfile(post.author.id)}
            className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-90 sm:gap-4"
          >
            <img
              src={post.author.avatarUrl || GENERIC_AVATAR}
              alt={post.author.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = GENERIC_AVATAR;
              }}
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-[#cfe1ee] sm:h-14 sm:w-14"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                  {post.author.name}
                </h3>
                {post.author.badge && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {post.author.badge}
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-slate-500">@{post.author.username}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </button>

          {canFollowAuthor && (
            <button
              type="button"
              disabled={isFollowLoading}
              onClick={(event) => {
                event.stopPropagation();
                void onToggleFollow?.(post.author.id, isFollowingAuthor);
              }}
              className={`inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                isFollowingAuthor
                  ? "border border-slate-200 bg-white text-slate-700"
                  : "bg-[#ed5f2f] text-white shadow-[0_16px_30px_rgba(237,95,47,0.22)]"
              }`}
            >
              {isFollowingAuthor ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isFollowLoading ? "Actualizando..." : isFollowingAuthor ? "Siguiendo" : "Seguir"}
            </button>
          )}
        </header>

        <div
          className={`mt-4 space-y-4 sm:mt-5 ${canOpenDetail ? "cursor-pointer" : ""}`}
          onClick={handleOpenDetail}
          onKeyDown={handleKeyboardOpenDetail}
          role={canOpenDetail ? "button" : undefined}
          tabIndex={canOpenDetail ? 0 : undefined}
          aria-label={canOpenDetail ? "Abrir detalle del post" : undefined}
        >
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-[15px]">
            {post.content}
          </p>

          {post.mediaUrls[0] && (
            <Dialog.Root open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsImageViewerOpen(true);
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
                className="block w-full overflow-hidden rounded-[1.35rem] border border-slate-200 text-left transition hover:border-[#0f4c81]/35 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/35 sm:rounded-[1.6rem]"
                aria-label="Abrir imagen en tamaño grande"
              >
                <img
                  src={post.mediaUrls[0]}
                  alt="Post media"
                  className="max-h-[320px] w-full object-contain sm:max-h-[420px]"
                />
              </button>

              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/80" />
                <Dialog.Viewport className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                  <Dialog.Popup className="relative flex max-h-full w-full max-w-6xl items-center justify-center outline-none">
                    <Dialog.Title className="sr-only">Imagen del post</Dialog.Title>
                    <Dialog.Close
                      className="absolute right-0 top-0 inline-flex h-11 w-11 -translate-y-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:right-2 sm:top-2 sm:translate-x-14 sm:translate-y-0"
                      aria-label="Cerrar visualizador"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>

                    <img
                      src={post.mediaUrls[0]}
                      alt="Post media en tamaño grande"
                      className="max-h-[85vh] w-auto max-w-full rounded-[1.5rem] object-contain shadow-[0_24px_80px_rgba(15,23,42,0.45)]"
                    />
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Portal>
            </Dialog.Root>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#edf5fb] px-3 py-1 text-xs font-semibold text-[#0f4c81]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {(post.simplePick || post.parley) && (
            <section className="rounded-[1.4rem] border border-[#cfe1ee] bg-[#f6fbfe] p-4 transition hover:border-[#0f4c81]/35 sm:rounded-[1.8rem]">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#ed5f2f]" />
                <h4 className="font-semibold text-slate-900">
                  {post.type === "PARLEY" ? "Ticket del parley" : "Detalle del pick"}
                </h4>
              </div>

              {post.simplePick && (
                <PickSummary
                  sport={post.simplePick.sport}
                  league={post.simplePick.league}
                  stake={post.simplePick.stake}
                  eventDate={post.simplePick.eventDate}
                  resultStatus={post.simplePick.resultStatus}
                  sportsbook={post.simplePick.sportsbook?.name ?? null}
                />
              )}

              {post.parley && (
                <PickSummary
                  sport={
                    post.parleySelections.length > 1
                      ? "Multi deporte"
                      : post.parleySelections[0]?.sport ?? "N/A"
                  }
                  league={
                    post.parleySelections.length > 1
                      ? `${post.parleySelections.length} selecciones`
                      : post.parleySelections[0]?.league ?? "N/A"
                  }
                  stake={post.parley.stake}
                  eventDate={post.parley.eventDate}
                  resultStatus={post.parley.resultStatus}
                  sportsbook={post.parley.sportsbook?.name ?? null}
                />
              )}

              {post.parleySelections.length > 0 && (
                <div className="mt-4 rounded-3xl border border-white bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">Selecciones incluidas</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.parleySelections.map((selection) => (
                      <span
                        key={selection.id}
                        className="rounded-full bg-[#edf5fb] px-3 py-1.5 text-xs font-semibold text-[#0f4c81]"
                      >
                        {selection.sport} · {selection.league}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {post.parley && (
                <div className="mt-4 rounded-3xl border border-white bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">Fecha de la boleta</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Esta fecha corresponde al ultimo juego del parley completo.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {!readOnly && isOwner && post.parley && (
          <div className="mt-4">
            <StatusQuickUpdate onChange={(status) => onUpdatePickStatus(post.id, status)} />
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
        {readOnly ? (
          <div className="flex flex-wrap items-center gap-2">
            <MetricPill icon={<ThumbsUp className="h-4 w-4" />} value={post.metrics.likesCount} />
            <MetricPill icon={<ThumbsDown className="h-4 w-4" />} value={post.metrics.dislikesCount} />
            <MetricPill icon={<MessageCircle className="h-4 w-4" />} value={post.metrics.commentsCount} />
            <MetricPill icon={<Repeat2 className="h-4 w-4" />} value={post.metrics.repostsCount} />
            <MetricPill icon={<Share2 className="h-4 w-4" />} value={post.metrics.sharesCount} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <ActionButton
                active={post.metrics.currentUserReaction === "LIKE"}
                onClick={() => void onToggleReaction(post.id, "LIKE")}
                icon={<ThumbsUp className="h-4 w-4" />}
                label=""
                count={post.metrics.likesCount}
              />
              <ActionButton
                active={post.metrics.currentUserReaction === "DISLIKE"}
                onClick={() => void onToggleReaction(post.id, "DISLIKE")}
                icon={<ThumbsDown className="h-4 w-4" />}
                label=""
                count={post.metrics.dislikesCount}
              />
              <ActionButton
                active={commentsOpen}
                onClick={() => void openComments()}
                icon={<MessageCircle className="h-4 w-4" />}
                label=""
                count={post.metrics.commentsCount}
              />
              <ActionButton
                active={post.metrics.repostedByCurrentUser}
                onClick={() => void onToggleRepost(post)}
                icon={<Repeat2 className="h-4 w-4" />}
                label=""
                count={post.metrics.repostsCount}
              />
            </div>
            <div className="flex gap-2">
              <ActionButton
                active={post.metrics.savedByCurrentUser}
                onClick={() => void onToggleSave(post.id)}
                icon={<Bookmark className="h-4 w-4" />}
                label=""
              />
              <ActionButton
                onClick={() => void onShare(post)}
                icon={<Share2 className="h-4 w-4" />}
                label=""
              />
            </div>
          </div>
        )}

        {!readOnly && commentsOpen && (
          <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 sm:rounded-[1.6rem]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <textarea
                value={commentValue}
                onChange={(event) => setCommentValue(event.target.value)}
                rows={2}
                placeholder="Escribe un comentario"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0f4c81] focus:bg-white"
              />
              <button
                type="button"
                disabled={sendingComment}
                onClick={() => void submitComment()}
                className="min-h-11 rounded-2xl bg-[#0f4c81] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:self-start"
              >
                Enviar
              </button>
            </div>

            {loadingComments ? (
              <p className="text-sm text-slate-500">Cargando comentarios...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay comentarios.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    depth={0}
                    activeReplyFor={activeReplyFor}
                    replyDrafts={replyDrafts}
                    sendingReplyFor={sendingReplyFor}
                    highlightCommentId={highlightCommentId}
                    onToggleLike={toggleCommentLike}
                    onToggleReply={(commentId) =>
                      setActiveReplyFor((current) => (current === commentId ? null : commentId))
                    }
                    onChangeReplyDraft={(commentId, value) =>
                      setReplyDrafts((current) => ({ ...current, [commentId]: value }))
                    }
                    onSubmitReply={submitReply}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}

function updateCommentTree(
  comments: CommentItem[],
  commentId: number,
  updater: (comment: CommentItem) => CommentItem
): CommentItem[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: updateCommentTree(comment.replies, commentId, updater),
    };
  });
}

function insertReplyIntoTree(
  comments: CommentItem[],
  parentCommentId: number,
  reply: CommentItem
): CommentItem[] {
  return comments.map((comment) => {
    if (comment.id === parentCommentId) {
      return {
        ...comment,
        replies: [...comment.replies, reply],
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: insertReplyIntoTree(comment.replies, parentCommentId, reply),
    };
  });
}

function CommentThread({
  comment,
  depth,
  activeReplyFor,
  replyDrafts,
  sendingReplyFor,
  highlightCommentId,
  onToggleLike,
  onToggleReply,
  onChangeReplyDraft,
  onSubmitReply,
}: {
  comment: CommentItem;
  depth: number;
  activeReplyFor: number | null;
  replyDrafts: Record<number, string>;
  sendingReplyFor: number | null;
  highlightCommentId: number | null;
  onToggleLike: (commentId: number) => Promise<void>;
  onToggleReply: (commentId: number) => void;
  onChangeReplyDraft: (commentId: number, value: string) => void;
  onSubmitReply: (parentCommentId: number) => Promise<void>;
}) {
  const isReplyBoxOpen = activeReplyFor === comment.id;
  const replyValue = replyDrafts[comment.id] ?? "";
  const canReply = depth < MAX_REPLY_DEPTH;
  const showReplyingTo = depth >= 2 && comment.replyingToUsername;

  return (
    <div className="space-y-3">
      <div
        id={`comment-${comment.id}`}
        className={`rounded-2xl px-4 py-3 ${
          highlightCommentId === comment.id
            ? "border border-[#ed5f2f]/40 bg-amber-50/70 ring-2 ring-[#ed5f2f]/15"
            : depth === 0
              ? "bg-slate-50"
              : "border border-slate-200/80 bg-white"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-sm font-semibold text-slate-800">{comment.author.name}</p>
              <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
            </div>
            {showReplyingTo && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#0f4c81]">
                Respondiendo a @{comment.replyingToUsername}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-600">{comment.content}</p>
          </div>
          <button
            type="button"
            onClick={() => void onToggleLike(comment.id)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
              comment.likedByCurrentUser
                ? "bg-[#0f4c81] text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#0f4c81]/35"
            }`}
            aria-label={comment.likedByCurrentUser ? "Quitar like del comentario" : "Dar like al comentario"}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{comment.likesCount}</span>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canReply && (
            <button
              type="button"
              onClick={() => onToggleReply(comment.id)}
              className="inline-flex min-h-9 items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:ring-[#0f4c81]/35"
            >
              {isReplyBoxOpen ? "Cancelar" : "Responder"}
            </button>
          )}
          {comment.replies.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              {comment.replies.length} {comment.replies.length === 1 ? "respuesta" : "respuestas"}
            </span>
          )}
        </div>

        {canReply && isReplyBoxOpen && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <textarea
              value={replyValue}
              onChange={(event) => onChangeReplyDraft(comment.id, event.target.value)}
              rows={2}
              placeholder="Escribe una respuesta"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f4c81]"
            />
            <button
              type="button"
              disabled={sendingReplyFor === comment.id}
              onClick={() => void onSubmitReply(comment.id)}
              className="min-h-11 rounded-2xl bg-[#0f4c81] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:self-start"
            >
              Responder
            </button>
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div
          className={
            depth === 0
              ? "ml-3 space-y-3 border-l border-slate-200 pl-3 sm:ml-4 sm:pl-4"
              : depth >= 1
                ? "ml-2 space-y-3 sm:ml-3"
                : "space-y-3"
          }
        >
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              activeReplyFor={activeReplyFor}
              replyDrafts={replyDrafts}
              sendingReplyFor={sendingReplyFor}
              highlightCommentId={highlightCommentId}
              onToggleLike={onToggleLike}
              onToggleReply={onToggleReply}
              onChangeReplyDraft={onChangeReplyDraft}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricPill({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 sm:px-4">
      <span className="shrink-0">{icon}</span>
      <span>{value}</span>
    </span>
  );
}

function ActionButton({
  active,
  label,
  count,
  icon,
  onClick,
  compact = false,
}: {
  active?: boolean;
  label: string;
  count?: number;
  icon: ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
        active
          ? "bg-[#0f4c81] text-white shadow-md"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#0f4c81]/40"
      } ${compact ? "w-full justify-start rounded-2xl" : ""}`}
    >
      <span className="shrink-0">{icon}</span>
      {(label || typeof count === "number") && (
        <span className="leading-none">
          {label}
          {typeof count === "number" ? `${label ? " " : ""}${count}` : ""}
        </span>
      )}
    </button>
  );
}

function PickSummary({
  sport,
  league,
  stake,
  eventDate,
  resultStatus,
  sportsbook,
}: {
  sport: string;
  league: string;
  stake: number | null;
  eventDate: string | null;
  resultStatus: ResultStatus;
  sportsbook: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatChip label="Deporte" value={sport} />
      <StatChip label="Liga" value={league} />
      <StatChip label="Stake" value={stake != null ? String(stake) : "N/A"} />
      <StatChip label="Casa" value={sportsbook ?? "N/A"} />
      <div className="rounded-3xl bg-white p-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Estado</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600">{formatDate(eventDate)}</span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getResultStatusClasses(
              resultStatus
            )}`}
          >
            {getResultStatusLabel(resultStatus)}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 wrap-break-word text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function StatusQuickUpdate({ onChange }: { onChange: (status: ResultStatus) => Promise<void> }) {
  const statuses: ResultStatus[] = ["PENDING", "WON", "LOST", "VOID"];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => void onChange(status)}
          className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 ${getResultStatusClasses(
            status
          )}`}
        >
          Marcar {getResultStatusLabel(status)}
        </button>
      ))}
    </div>
  );
}
