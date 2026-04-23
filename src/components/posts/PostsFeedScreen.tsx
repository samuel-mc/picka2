import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Filter, Plus, RefreshCcw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { getAuthUserId } from "@/lib/auth";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";
import { sharePostLink } from "@/components/posts/post-utils";
import { useAuthStore } from "@/stores/authStore";
import type { ApiResponse, CatalogItem, CompetitionItem } from "@/types/catalog";
import type {
  CommentItem,
  CreatePostPayload,
  FollowingFeedResponse,
  PagedResponse,
  PostItem,
  PostMetrics,
  ReactionType,
  ResultStatus,
  Sportsbook,
} from "@/types/posts";

interface PostsFeedScreenProps {
  mode?: "feed" | "saved";
}

export function PostsFeedScreen({ mode = "feed" }: PostsFeedScreenProps) {
  const api = useApi();
  const navigate = useNavigate();
  const currentUserId = useMemo(() => getAuthUserId(), []);
  const role = useAuthStore((state) => state.role);
  const canCreatePosts = role === "ROLE_TIPSTER";
  const isSavedMode = mode === "saved";
  const [feedTab, setFeedTab] = useState<"following" | "discover">("discover");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [sportsbooks, setSportsbooks] = useState<Sportsbook[]>([]);
  const [homePrashe, setHomePrashe] = useState(
    ""
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [authorFilter, setAuthorFilter] = useState<number | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showFloatingComposerButton, setShowFloatingComposerButton] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [followLoadingAuthorId, setFollowLoadingAuthorId] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  const applyFeedResponse = useCallback(
    (response: PagedResponse<PostItem>, append = false) => {
      setPosts((current) => (append ? [...current, ...response.items] : response.items));
      setPage(response.page);
      setHasNext(response.hasNext);
    },
    []
  );

  const loadFeed = useCallback(
    async (nextPage = 0, append = false, authorId: number | null = authorFilter) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const endpoint = isSavedMode
          ? "/posts/saved"
          : authorId != null
            ? `/posts/users/${authorId}`
            : feedTab === "following"
              ? "/posts/feed/following"
              : "/posts/feed/discover";

        if (endpoint === "/posts/feed/following") {
          const { data } = await api.get<ApiResponse<FollowingFeedResponse>>(endpoint, {
            params: { page: nextPage, size: 10 },
          });
          setFollowingCount(data.data.followingCount);
          applyFeedResponse(data.data.feed, append);
        } else {
          const { data } = await api.get<ApiResponse<PagedResponse<PostItem>>>(endpoint, {
            params: { page: nextPage, size: 10 },
          });
          setFollowingCount(null);
          applyFeedResponse(data.data, append);
        }
      } catch {
        toast.error(isSavedMode ? "No se pudieron cargar los posts guardados." : "No se pudo cargar el feed.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [api, applyFeedResponse, authorFilter, feedTab, isSavedMode]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!canCreatePosts) {
          return;
        }

        const [sportsResponse, competitionsResponse, sportsbookResponse, homePrashesResponse] = await Promise.all([
          api.get<ApiResponse<CatalogItem[]>>("/catalogs/sports"),
          api.get<ApiResponse<CompetitionItem[]>>("/catalogs/competitions"),
          api.get<ApiResponse<Sportsbook[]>>("/sportsbooks"),
          api.get<ApiResponse<CatalogItem>>("/catalogs/generate-home-prashe"),
        ]);
        if (!cancelled) {
          setSports(sportsResponse.data.data);
          setCompetitions(competitionsResponse.data.data);
          setSportsbooks(sportsbookResponse.data.data);
          const activePhrase = homePrashesResponse.data.data?.name;
          if (activePhrase) {
            setHomePrashe(activePhrase);
          }
        }
      } catch {
        if (!cancelled) {
          toast.error("No se pudo cargar el catálogo de casas de apuesta.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, canCreatePosts]);

  useEffect(() => {
    void loadFeed(0, false, authorFilter);
  }, [authorFilter, feedTab, loadFeed]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingComposerButton(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = (event?: MediaQueryListEvent) => {
      setIsMobileViewport(event ? event.matches : mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  const updatePost = useCallback((postId: number, updater: (current: PostItem) => PostItem) => {
    setPosts((current) => current.map((post) => (post.id === postId ? updater(post) : post)));
  }, []);

  const updateAuthorFollowState = useCallback((authorId: number, followedByCurrentUser: boolean) => {
    setPosts((current) =>
      current.map((post) => ({
        ...post,
        author:
          post.author.id === authorId
            ? { ...post.author, followedByCurrentUser }
            : post.author,
      }))
    );
  }, []);

  const handleCreatePost = useCallback(
    async (payload: CreatePostPayload) => {
      setSubmitting(true);
      try {
        const { data } = await api.post<ApiResponse<PostItem>>("/posts", payload);
        setPosts((current) => [data.data, ...current]);
        setIsComposerOpen(false);
        toast.success("Post publicado.");
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "No se pudo publicar el post.";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [api]
  );

  const handleUploadImage = useCallback(
    async (file: File) => {
      const presignRes = await api.post<{ uploadUrl: string; objectKey: string }>(
        "/posts/media/presign",
        { contentType: file.type }
      );
      const { uploadUrl, objectKey } = presignRes.data;
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("No se pudo subir la imagen al almacenamiento.");
      }

      const completeRes = await api.post<ApiResponse<{ objectKey: string; mediaUrl: string }>>(
        "/posts/media/complete",
        { objectKey }
      );

      return completeRes.data.data;
    },
    [api]
  );

  const handleReaction = useCallback(
    async (postId: number, type: ReactionType) => {
      try {
        const { data } = await api.put<ApiResponse<PostMetrics>>(`/posts/${postId}/reaction`, {
          type,
        });
        updatePost(postId, (current) => ({ ...current, metrics: data.data }));
        return data.data;
      } catch {
        toast.error("No se pudo registrar la reacción.");
        return null;
      }
    },
    [api, updatePost]
  );

  const handleToggleCommentLike = useCallback(
    async (postId: number, commentId: number) => {
      try {
        const { data } = await api.put<ApiResponse<CommentItem>>(
          `/posts/${postId}/comments/${commentId}/like`
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
    async (postId: number) => {
      try {
        const { data } = await api.put<ApiResponse<{ active: boolean }>>(`/posts/${postId}/save`);
        if (isSavedMode && !data.data.active) {
          setPosts((current) => current.filter((post) => post.id !== postId));
        } else {
          updatePost(postId, (current) => ({
            ...current,
            metrics: {
              ...current.metrics,
              savedByCurrentUser: data.data.active,
              savesCount: Math.max(0, current.metrics.savesCount + (data.data.active ? 1 : -1)),
            },
          }));
        }
        return data.data.active;
      } catch {
        toast.error("No se pudo actualizar el guardado.");
        return null;
      }
    },
    [api, isSavedMode, updatePost]
  );

  const handleRepost = useCallback(
    async (post: PostItem) => {
      try {
        const { data } = await api.put<ApiResponse<{ active: boolean }>>(`/posts/${post.id}/repost`);
        if (post.repostEntry && post.repostedBy?.id === currentUserId && !data.data.active) {
          setPosts((current) => current.filter((item) => item.timelineEntryId !== post.timelineEntryId));
        } else {
          updatePost(post.id, (current) => ({
            ...current,
            metrics: {
              ...current.metrics,
              repostedByCurrentUser: data.data.active,
              repostsCount: Math.max(0, current.metrics.repostsCount + (data.data.active ? 1 : -1)),
            },
          }));
        }
        return data.data.active;
      } catch {
        toast.error("No se pudo actualizar el repost.");
        return null;
      }
    },
    [api, currentUserId, updatePost]
  );

  const handleShare = useCallback(
    async (post: PostItem) => {
      try {
        const shareResult = await sharePostLink(post.id);
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

      try {
        const { data } = await api.post<ApiResponse<PostMetrics>>(`/posts/${post.id}/share`, {
          channel: "WEB",
        });
        updatePost(post.id, (current) => ({ ...current, metrics: data.data }));
        return data.data;
      } catch {
        return null;
      }
    },
    [api, updatePost]
  );

  const handleLoadComments = useCallback(
    async (postId: number) => {
      const { data } = await api.get<ApiResponse<CommentItem[]>>(`/posts/${postId}/comments`);
      return data.data;
    },
    [api]
  );

  const handleComment = useCallback(
    async (postId: number, content: string, parentCommentId?: number | null) => {
      try {
        const { data } = await api.post<ApiResponse<CommentItem>>(`/posts/${postId}/comments`, {
          content,
          parentCommentId: parentCommentId ?? null,
        });
        updatePost(postId, (current) => ({
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
    async (postId: number, resultStatus: ResultStatus) => {
      try {
        const { data } = await api.put<ApiResponse<PostItem>>(`/posts/${postId}/pick-status`, {
          resultStatus,
        });
        updatePost(postId, () => data.data);
        toast.success("Estado del pick actualizado.");
      } catch {
        toast.error("No se pudo actualizar el estado.");
      }
    },
    [api, updatePost]
  );

  const handleRegisterView = useCallback(
    async (postId: number) => {
      try {
        await api.post(`/posts/${postId}/views`);
      } catch {
        // ignore
      }
    },
    [api]
  );

  const handleViewProfile = useCallback((authorId: number) => {
    navigate(`/perfil/${authorId}`);
  }, [navigate]);

  const handleOpenDetail = useCallback((postId: number) => {
    navigate(`/posts/${postId}`);
  }, [navigate]);

  const handleToggleFollow = useCallback(
    async (authorId: number, currentlyFollowing: boolean) => {
      setFollowLoadingAuthorId(authorId);
      try {
        if (currentlyFollowing) {
          await api.delete(`/posts/users/${authorId}/follow`);
        } else {
          await api.post(`/posts/users/${authorId}/follow`);
        }

        updateAuthorFollowState(authorId, !currentlyFollowing);
        toast.success(currentlyFollowing ? "Dejaste de seguir al usuario." : "Ahora sigues al usuario.");
        return !currentlyFollowing;
      } catch {
        toast.error("No se pudo actualizar el seguimiento.");
        return null;
      } finally {
        setFollowLoadingAuthorId(null);
      }
    },
    [api, updateAuthorFollowState]
  );

  const clearAuthorFilter = useCallback(() => {
    setAuthorFilter(null);
  }, []);

  const openComposer = useCallback(() => {
    if (!canCreatePosts) {
      return;
    }
    if (isMobileViewport) {
      navigate("/tipster/posts/nuevo");
      return;
    }

    setIsComposerOpen(true);
  }, [canCreatePosts, isMobileViewport, navigate]);

  const showAuthorFilter = !isSavedMode && authorFilter != null;
  const showTabs = !isSavedMode && authorFilter == null;

  const title = showAuthorFilter
    ? `Viendo posts del autor #${authorFilter}`
    : isSavedMode
      ? "Posts guardados"
      : feedTab === "following"
        ? "Siguiendo"
        : "Descubrir";

  const description = showAuthorFilter
    ? "Puedes volver al feed principal cuando quieras."
    : isSavedMode
      ? "Consulta y administra las publicaciones que guardaste."
      : feedTab === "following"
        ? "Publicaciones de los tipsters que sigues."
        : "Publicaciones destacadas de los últimos días.";
  const loadingMessage = isSavedMode ? "Cargando posts guardados..." : "Cargando feed...";
  const emptyMessage = isSavedMode
    ? "Todavia no has guardado publicaciones."
    : showAuthorFilter
      ? "Todavia no hay publicaciones para este filtro."
      : feedTab === "following"
        ? followingCount === 0
          ? "Aún no sigues a ningún tipster.\nExplora publicaciones en Descubrir y comienza a seguir usuarios para personalizar tu feed."
          : "Todavía no hay publicaciones de los usuarios que sigues."
        : "Aún no hay publicaciones destacadas para mostrar.";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(237,95,47,0.22),_transparent_32%),linear-gradient(180deg,#f7fbff_0%,#eef5fa_55%,#f9fbfd_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_14px_40px_rgba(15,76,129,0.08)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#edf5fb] p-3 text-[#0f4c81]">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {title}
                </p>
                <p className="text-sm text-slate-500">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {canCreatePosts && (
                <button
                  type="button"
                  onClick={openComposer}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ed5f2f] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(237,95,47,0.22)] transition hover:bg-[#d95225]"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo post
                </button>
              )}
              {showAuthorFilter && (
                <button
                  type="button"
                  onClick={clearAuthorFilter}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Limpiar filtro
                </button>
              )}
              <button
                type="button"
                onClick={() => void loadFeed(0, false, authorFilter)}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Refrescar
              </button>
            </div>
          </div>

          {showTabs && (
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-white/80 p-1 ring-1 ring-white/70 shadow-[0_10px_30px_rgba(15,76,129,0.06)] backdrop-blur">
                <button
                  type="button"
                  onClick={() => setFeedTab("following")}
                  className={
                    feedTab === "following"
                      ? "rounded-full bg-[#0f4c81] px-5 py-2 text-sm font-semibold text-white shadow-sm"
                      : "rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                  }
                >
                  Siguiendo
                </button>
                <button
                  type="button"
                  onClick={() => setFeedTab("discover")}
                  className={
                    feedTab === "discover"
                      ? "rounded-full bg-[#0f4c81] px-5 py-2 text-sm font-semibold text-white shadow-sm"
                      : "rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                  }
                >
                  Descubrir
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500">
              {loadingMessage}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500">
              <div className="space-y-2">
                {emptyMessage.split("\n").map((line, index) => (
                  <p key={`${index}-${line}`}>{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.timelineEntryId}
                  post={post}
                  currentUserId={currentUserId}
                  onViewProfile={handleViewProfile}
                  onToggleReaction={handleReaction}
                  onToggleCommentLike={handleToggleCommentLike}
                  onToggleSave={handleSave}
                  onToggleRepost={handleRepost}
                  onShare={handleShare}
                  onLoadComments={handleLoadComments}
                  onComment={handleComment}
                  onUpdatePickStatus={handleUpdatePickStatus}
                  onRegisterView={handleRegisterView}
                  onToggleFollow={handleToggleFollow}
                  followLoadingForAuthorId={followLoadingAuthorId}
                  onOpenDetail={handleOpenDetail}
                />
              ))}
              {hasNext && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void loadFeed(page + 1, true, authorFilter)}
                    className="rounded-full bg-[#ed5f2f] px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                  >
                    {loadingMore ? "Cargando..." : "Cargar más"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {canCreatePosts && showFloatingComposerButton && !isComposerOpen && (
        <button
          type="button"
          onClick={openComposer}
          className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ed5f2f] text-white shadow-[0_20px_40px_rgba(237,95,47,0.32)] transition hover:bg-[#d95225] sm:bottom-8 sm:right-8"
          aria-label="Crear nuevo post"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {canCreatePosts && isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 sm:items-center sm:px-6">
          <div className="relative w-full max-w-4xl rounded-[2rem] bg-[#eef5fa] p-3 shadow-[0_30px_90px_rgba(13,38,76,0.32)] sm:p-5">
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="absolute right-6 top-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/90 text-slate-600 shadow-sm transition hover:text-slate-900"
              aria-label="Cerrar modal de publicación"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[1.6rem]">
              <div className="space-y-6">
                <div className="rounded-[2.2rem] bg-[#0d2f4f] p-7 pr-20 text-white shadow-[0_30px_80px_rgba(13,47,79,0.28)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-[#9dc4e6]">Tipster Network</p>
                  <h1 className="mt-3 text-4xl font-black leading-tight">{homePrashe}</h1>
                </div>

                <PostComposer
                  sports={sports}
                  competitions={competitions}
                  sportsbooks={sportsbooks}
                  submitting={submitting}
                  onSubmit={handleCreatePost}
                  onUploadImage={handleUploadImage}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
