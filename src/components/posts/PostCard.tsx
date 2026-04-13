import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Bookmark,
  MessageCircle,
  Repeat2,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  UserRound,
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

interface Props {
  post: PostItem;
  currentUserId: number | null;
  onViewProfile: (authorId: number) => void;
  onToggleReaction: (postId: number, type: ReactionType) => Promise<PostMetrics | null>;
  onToggleSave: (postId: number) => Promise<boolean | null>;
  onToggleRepost: (postId: number) => Promise<boolean | null>;
  onShare: (postId: number) => Promise<PostMetrics | null>;
  onLoadComments: (postId: number) => Promise<CommentItem[]>;
  onComment: (postId: number, content: string) => Promise<CommentItem | null>;
  onUpdatePickStatus: (postId: number, status: ResultStatus) => Promise<void>;
  onRegisterView: (postId: number) => Promise<void>;
}

export function PostCard({
  post,
  currentUserId,
  onViewProfile,
  onToggleReaction,
  onToggleSave,
  onToggleRepost,
  onShare,
  onLoadComments,
  onComment,
  onUpdatePickStatus,
  onRegisterView,
}: Props) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentValue, setCommentValue] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    void onRegisterView(post.id);
  }, [onRegisterView, post.id]);

  const isOwner = currentUserId === post.author.id;

  const openComments = async () => {
    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);
    if (nextOpen && comments.length === 0) {
      setLoadingComments(true);
      try {
        const loaded = await onLoadComments(post.id);
        setComments(loaded);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const submitComment = async () => {
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

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 shadow-[0_18px_55px_rgba(15,76,129,0.10)] backdrop-blur sm:rounded-[2rem]">
      <div className="p-4 sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
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
          </div>
          <button
            type="button"
            onClick={() => onViewProfile(post.author.id)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#0f4c81] hover:text-[#0f4c81] sm:w-auto"
          >
            <UserRound className="h-4 w-4" />
            Ver perfil
          </button>
        </header>

        <div className="mt-4 space-y-4 sm:mt-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-[15px]">
            {post.content}
          </p>

          {post.mediaUrls[0] && (
            <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 sm:rounded-[1.6rem]">
              <img
                src={post.mediaUrls[0]}
                alt="Post media"
                className="max-h-[320px] w-full object-cover sm:max-h-[420px]"
              />
            </div>
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
            <section className="rounded-[1.4rem] border border-[#cfe1ee] bg-[#f6fbfe] p-4 sm:rounded-[1.8rem]">
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

              {isOwner && post.parley && (
                <div className="mt-4">
                  <StatusQuickUpdate onChange={(status) => onUpdatePickStatus(post.id, status)} />
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <footer className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
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
              onClick={() => void onToggleRepost(post.id)}
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
              count={post.metrics.savesCount}
            />
            <ActionButton
              onClick={() => void onShare(post.id)}
              icon={<Share2 className="h-4 w-4" />}
              label=""
              count={post.metrics.sharesCount}
            />
          </div>
        </div>

        {commentsOpen && (
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
                  <div key={comment.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.author.name}
                      </p>
                      <span className="text-xs text-slate-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </footer>
    </article>
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
      {label ? (
        <span className="leading-none">
          {label}
          {typeof count === "number" ? ` ${count}` : ""}
        </span>
      ) : null}
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
      <p className="mt-2 break-words text-sm font-medium text-slate-700">{value}</p>
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
