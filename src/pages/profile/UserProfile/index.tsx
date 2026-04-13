import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, BadgeCheck, UserPlus, UserMinus } from "lucide-react";
import { TipsterLayout } from "@/layouts/TipsterLayout";
import { useApi } from "@/hooks/useApi";
import { getAuthUserId } from "@/lib/auth";
import { PostCard } from "@/components/posts/PostCard";
import type { ApiResponse, CompetitionItem, TeamItem } from "@/types/catalog";
import type {
  CommentItem,
  PagedResponse,
  PostItem,
  PostMetrics,
  ReactionType,
  ResultStatus,
} from "@/types/posts";

interface PublicProfile {
  id: number;
  name: string;
  lastname: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  validatedTipster: boolean;
  followedByCurrentUser: boolean;
  selfProfile: boolean;
  followersCount: number;
  followingCount: number;
  preferredCompetitions: CompetitionItem[];
  preferredTeams: TeamItem[];
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const api = useApi();
  const navigate = useNavigate();
  const currentUserId = useMemo(() => getAuthUserId(), []);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const targetUserId = Number(userId ?? currentUserId ?? NaN);

  const loadProfile = useCallback(async () => {
    const { data } = await api.get<PublicProfile>(`/users/${targetUserId}/profile`);
    setProfile(data);
  }, [api, targetUserId]);

  useEffect(() => {
    if (!Number.isFinite(targetUserId)) {
      navigate("/tipster/posts");
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [profileResponse, postsResponse] = await Promise.all([
          api.get<PublicProfile>(`/users/${targetUserId}/profile`),
          api.get<ApiResponse<PagedResponse<PostItem>>>(`/posts/users/${targetUserId}`, {
            params: { page: 0, size: 20 },
          }),
        ]);

        if (!cancelled) {
          setProfile(profileResponse.data);
          setPosts(postsResponse.data.data.items);
        }
      } catch {
        if (!cancelled) {
          toast.error("No se pudo cargar el perfil.");
          navigate("/tipster/posts");
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
  }, [api, navigate, targetUserId]);

  const updatePost = useCallback((postId: number, updater: (current: PostItem) => PostItem) => {
    setPosts((current) => current.map((post) => (post.id === postId ? updater(post) : post)));
  }, []);

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

  const handleSave = useCallback(
    async (postId: number) => {
      try {
        const { data } = await api.put<ApiResponse<{ active: boolean }>>(`/posts/${postId}/save`);
        updatePost(postId, (current) => ({
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
    async (postId: number) => {
      try {
        const { data } = await api.put<ApiResponse<{ active: boolean }>>(`/posts/${postId}/repost`);
        updatePost(postId, (current) => ({
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
    async (postId: number) => {
      try {
        const { data } = await api.post<ApiResponse<PostMetrics>>(`/posts/${postId}/share`, {
          channel: "WEB",
        });
        updatePost(postId, (current) => ({ ...current, metrics: data.data }));
        return data.data;
      } catch {
        toast.error("No se pudo registrar el share.");
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
    async (postId: number, content: string) => {
      try {
        const { data } = await api.post<ApiResponse<CommentItem>>(`/posts/${postId}/comments`, {
          content,
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

  const handleToggleFollow = useCallback(async () => {
    if (!profile || profile.selfProfile) return;
    setFollowLoading(true);
    try {
      if (profile.followedByCurrentUser) {
        await api.delete(`/posts/users/${profile.id}/follow`);
      } else {
        await api.post(`/posts/users/${profile.id}/follow`);
      }
      await loadProfile();
      toast.success(profile.followedByCurrentUser ? "Dejaste de seguir al usuario." : "Ahora sigues al usuario.");
    } catch {
      toast.error("No se pudo actualizar el seguimiento.");
    } finally {
      setFollowLoading(false);
    }
  }, [api, loadProfile, profile]);

  if (loading || !profile) {
    return (
      <TipsterLayout isFixed={false}>
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(237,95,47,0.22),_transparent_32%),linear-gradient(180deg,#f7fbff_0%,#eef5fa_55%,#f9fbfd_100%)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500">
            Cargando perfil...
          </div>
        </main>
      </TipsterLayout>
    );
  }

  const fullName = `${profile.name} ${profile.lastname}`.trim();
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <TipsterLayout isFixed={false}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(237,95,47,0.22),_transparent_32%),linear-gradient(180deg,#f7fbff_0%,#eef5fa_55%,#f9fbfd_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/tipster/posts")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al feed
            </button>

            {profile.selfProfile ? (
              <Link
                to="/tipster/perfil/editar"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f4c81] px-4 py-2 text-sm font-semibold text-white"
              >
                Editar perfil
              </Link>
            ) : (
              <button
                type="button"
                disabled={followLoading}
                onClick={() => void handleToggleFollow()}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  profile.followedByCurrentUser
                    ? "border border-slate-200 bg-white text-slate-700"
                    : "bg-[#ed5f2f] text-white"
                }`}
              >
                {profile.followedByCurrentUser ? (
                  <UserMinus className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {followLoading
                  ? "Actualizando..."
                  : profile.followedByCurrentUser
                    ? "Siguiendo"
                    : "Seguir"}
              </button>
            )}
          </div>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(13,38,76,0.12)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={fullName}
                    className="h-20 w-20 rounded-[1.75rem] object-cover ring-2 ring-[#cfe1ee]"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#0f4c81] text-2xl font-bold text-white">
                    {initials || "TP"}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{fullName}</h1>
                    {profile.validatedTipster && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <BadgeCheck className="h-4 w-4" />
                        Tipster validado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">@{profile.username}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    {profile.bio?.trim() || "Este usuario todavía no ha agregado una bio pública."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="Followers" value={profile.followersCount} />
                <MetricCard label="Following" value={profile.followingCount} />
                <MetricCard label="Ligas" value={profile.preferredCompetitions.length} />
                <MetricCard label="Equipos" value={profile.preferredTeams.length} />
              </div>
            </div>

            {(profile.preferredCompetitions.length > 0 || profile.preferredTeams.length > 0) && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <PreferencePanel
                  title="Ligas favoritas"
                  items={profile.preferredCompetitions.map((competition) => competition.name)}
                />
                <PreferencePanel
                  title="Equipos favoritos"
                  items={profile.preferredTeams.map((team) => team.name)}
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Publicaciones</h2>
              <span className="text-sm text-slate-500">{posts.length} posts</span>
            </div>

            {posts.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500">
                Este usuario todavía no tiene publicaciones visibles.
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onViewProfile={(authorId) => navigate(`/tipster/perfil/${authorId}`)}
                    onToggleReaction={handleReaction}
                    onToggleSave={handleSave}
                    onToggleRepost={handleRepost}
                    onShare={handleShare}
                    onLoadComments={handleLoadComments}
                    onComment={handleComment}
                    onUpdatePickStatus={handleUpdatePickStatus}
                    onRegisterView={handleRegisterView}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </TipsterLayout>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-[#f6fbfe] p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function PreferencePanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-slate-500">Sin datos todavía.</span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0f4c81] ring-1 ring-[#cfe1ee]"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
