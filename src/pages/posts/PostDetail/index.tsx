import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, Share2 } from "lucide-react";
import { TipsterLayout } from "@/layouts/TipsterLayout";
import { useApi } from "@/hooks/useApi";
import { PostCard } from "@/components/posts/PostCard";
import { sharePostLink } from "@/components/posts/post-utils";
import { useAuthStore } from "@/stores/authStore";
import type { ApiResponse } from "@/types/catalog";
import type {
  CommentItem,
  PostItem,
  PostMetrics,
  ReactionType,
  ResultStatus,
} from "@/types/posts";

const noopLoadComments = async () => [] as CommentItem[];
const noopComment = async () => null as CommentItem | null;
const noopCommentLike = async () => null as CommentItem | null;
const noopMetrics = async () => null as PostMetrics | null;
const noopBoolean = async () => null as boolean | null;
const noopVoid = async () => {};

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const api = useApi();
  const navigate = useNavigate();
  const initialized = useAuthStore((state) => state.initialized);
  const authenticated = useAuthStore((state) => state.authenticated);
  const currentUserId = useAuthStore((state) => state.userId);
  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedPostId = useMemo(() => Number(postId ?? NaN), [postId]);
  const highlightCommentId = useMemo(() => {
    const rawValue = searchParams.get("commentId");
    if (!rawValue) {
      return null;
    }
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);
  const isPublicMode = initialized && !authenticated;

  useEffect(() => {
    if (!initialized) return;

    if (!Number.isFinite(resolvedPostId)) {
      setErrorMessage("El identificador del post no es válido.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    void (async () => {
      try {
        if (authenticated) {
          const { data } = await api.get<ApiResponse<PostItem>>(`/posts/${resolvedPostId}`);
          if (!cancelled) {
            setPost(data.data);
          }
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/public/${resolvedPostId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("No se pudo cargar el post.");
        }

        const data = (await response.json()) as ApiResponse<PostItem>;
        if (!cancelled) {
          setPost(data.data);
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          setErrorMessage(
            authenticated
              ? "No pudimos abrir este post con tu sesión actual."
              : "Este post no está disponible públicamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, authenticated, initialized, resolvedPostId]);

  const updatePost = useCallback((updater: (current: PostItem) => PostItem) => {
    setPost((current) => (current ? updater(current) : current));
  }, []);

  const handleReaction = useCallback(
    async (targetPostId: number, type: ReactionType) => {
      try {
        const { data } = await api.put<ApiResponse<PostMetrics>>(`/posts/${targetPostId}/reaction`, {
          type,
        });
        updatePost((current) => ({ ...current, metrics: data.data }));
        return data.data;
      } catch {
        toast.error("No se pudo registrar la reacción.");
        return null;
      }
    },
    [api, updatePost]
  );

  const handleToggleCommentLike = useCallback(
    async (targetPostId: number, commentId: number) => {
      try {
        const { data } = await api.put<ApiResponse<CommentItem>>(
          `/posts/${targetPostId}/comments/${commentId}/like`
        );
        return data.data;
      } catch {
        toast.error("No se pudo actualizar el like del comentario.");
        return null;
      }
    },
    [api]
  );

  const handleSave = useCallback(
    async (targetPostId: number) => {
      try {
        const { data } = await api.put<ApiResponse<{ active: boolean }>>(`/posts/${targetPostId}/save`);
        updatePost((current) => ({
          ...current,
          metrics: {
            ...current.metrics,
            savedByCurrentUser: data.data.active,
            savesCount: Math.max(0, current.metrics.savesCount + (data.data.active ? 1 : -1)),
          },
        }));
        return data.data.active;
      } catch {
        toast.error("No se pudo actualizar el guardado.");
        return null;
      }
    },
    [api, updatePost]
  );

  const handleRepost = useCallback(
    async (targetPost: PostItem) => {
      try {
        const { data } = await api.put<ApiResponse<{ active: boolean }>>(
          `/posts/${targetPost.id}/repost`
        );
        updatePost((current) => ({
          ...current,
          metrics: {
            ...current.metrics,
            repostedByCurrentUser: data.data.active,
            repostsCount: Math.max(0, current.metrics.repostsCount + (data.data.active ? 1 : -1)),
          },
        }));
        return data.data.active;
      } catch {
        toast.error("No se pudo actualizar el repost.");
        return null;
      }
    },
    [api, updatePost]
  );

  const handleShare = useCallback(
    async (targetPost: PostItem) => {
      try {
        const shareResult = await sharePostLink(targetPost.id);
        if (!shareResult.completed) {
          return null;
        }
        toast.success(
          shareResult.copied ? "Enlace copiado al portapapeles." : "Enlace listo para compartir."
        );
      } catch {
        toast.error("No se pudo preparar el enlace para compartir.");
        return null;
      }

      if (!authenticated) {
        return null;
      }

      try {
        const { data } = await api.post<ApiResponse<PostMetrics>>(`/posts/${targetPost.id}/share`, {
          channel: "WEB",
        });
        updatePost((current) => ({ ...current, metrics: data.data }));
        return data.data;
      } catch {
        return null;
      }
    },
    [api, authenticated, updatePost]
  );

  const handleLoadComments = useCallback(
    async (targetPostId: number) => {
      const { data } = await api.get<ApiResponse<CommentItem[]>>(`/posts/${targetPostId}/comments`);
      return data.data;
    },
    [api]
  );

  const handleComment = useCallback(
    async (targetPostId: number, content: string, parentCommentId?: number | null) => {
      try {
        const { data } = await api.post<ApiResponse<CommentItem>>(`/posts/${targetPostId}/comments`, {
          content,
          parentCommentId: parentCommentId ?? null,
        });
        updatePost((current) => ({
          ...current,
          metrics: {
            ...current.metrics,
            commentsCount: current.metrics.commentsCount + 1,
          },
        }));
        return data.data;
      } catch {
        toast.error("No se pudo comentar el post.");
        return null;
      }
    },
    [api, updatePost]
  );

  const handleUpdatePickStatus = useCallback(
    async (targetPostId: number, resultStatus: ResultStatus) => {
      try {
        const { data } = await api.put<ApiResponse<PostItem>>(`/posts/${targetPostId}/pick-status`, {
          resultStatus,
        });
        setPost(data.data);
        toast.success("Estado del pick actualizado.");
      } catch {
        toast.error("No se pudo actualizar el estado.");
      }
    },
    [api]
  );

  const handleRegisterView = useCallback(
    async (targetPostId: number) => {
      try {
        await api.post(`/posts/${targetPostId}/views`);
      } catch {
        // ignore
      }
    },
    [api]
  );

  const handleViewProfile = useCallback(
    (authorId: number) => {
      if (!authenticated) {
        navigate("/login");
        return;
      }
      navigate(`/perfil/${authorId}`);
    },
    [authenticated, navigate]
  );

  const goBack = useCallback(() => {
    if (authenticated) {
      navigate("/feed");
      return;
    }
    navigate("/");
  }, [authenticated, navigate]);

  return (
    <TipsterLayout isFixed={false}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(237,95,47,0.22),_transparent_32%),linear-gradient(180deg,#f7fbff_0%,#eef5fa_55%,#f9fbfd_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {authenticated ? "Volver al feed" : "Volver al inicio"}
            </button>

            {post && (
              <button
                type="button"
                onClick={() => void handleShare(post)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white"
              >
                <Share2 className="h-4 w-4" />
                Compartir post
              </button>
            )}
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500">
              Cargando detalle del post...
            </div>
          ) : errorMessage ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500">
              <p className="text-lg font-semibold text-slate-800">{errorMessage}</p>
              {!authenticated && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Registrarme como tipster
                  </Link>
                </div>
              )}
            </div>
          ) : post ? (
            <>
              <PostCard
                post={post}
                currentUserId={currentUserId}
                onViewProfile={handleViewProfile}
                onToggleReaction={isPublicMode ? noopMetrics : handleReaction}
                onToggleCommentLike={isPublicMode ? noopCommentLike : handleToggleCommentLike}
                onToggleSave={isPublicMode ? noopBoolean : handleSave}
                onToggleRepost={isPublicMode ? noopBoolean : handleRepost}
                onShare={handleShare}
                onLoadComments={isPublicMode ? noopLoadComments : handleLoadComments}
                onComment={isPublicMode ? noopComment : handleComment}
                onUpdatePickStatus={isPublicMode ? noopVoid : handleUpdatePickStatus}
                onRegisterView={isPublicMode ? noopVoid : handleRegisterView}
                registerViewOnMount={!isPublicMode}
                readOnly={isPublicMode}
                defaultCommentsOpen={!isPublicMode || highlightCommentId != null}
                highlightCommentId={highlightCommentId}
              />

              {isPublicMode && (
                <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_55px_rgba(15,76,129,0.10)]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        <Lock className="h-3.5 w-3.5" />
                        Vista pública
                      </div>
                      <h2 className="mt-4 text-2xl font-black text-slate-900">
                        Inicia sesión para interactuar con este post
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Con una cuenta puedes comentar, guardar picks, seguir tipsters y abrir perfiles completos desde el feed.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/login"
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#ed5f2f] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Entrar
                      </Link>
                      <Link
                        to="/registro"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Registrarme como tipster
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </>
          ) : null}
        </div>
      </main>
    </TipsterLayout>
  );
}
