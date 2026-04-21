import { useCallback, useEffect, useMemo, useState } from "react";
import { UserLayout } from "@/layouts/UsersLayout";
import { TipsterLayout } from "@/layouts/TipsterLayout";
import { useAuthStore } from "@/stores/authStore";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/common/ui/button";
import { Loading } from "@/components/common/Loading";
import type { ApiResponse, CompetitionItem, TeamItem } from "@/types/catalog";
import {
  Check,
  Camera,
  ImageUp,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

interface MeProfile {
  id: number;
  name: string;
  lastname: string;
  username?: string | null;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  preferredCompetitions: CompetitionItem[];
  preferredTeams: TeamItem[];
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function MiPerfilForm() {
  const api = useApi();
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [bio, setBio] = useState("");
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<number[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedAvatarName, setSelectedAvatarName] = useState<string | null>(null);

  const applyProfile = useCallback((p: MeProfile) => {
    setProfile(p);
    setName(p.name ?? "");
    setLastname(p.lastname ?? "");
    setBio(p.bio ?? "");
    setSelectedCompetitionIds(p.preferredCompetitions?.map((competition) => competition.id) ?? []);
    setSelectedTeamIds(p.preferredTeams?.map((team) => team.id) ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const [profileResponse, competitionsResponse, teamsResponse] = await Promise.all([
          api.get<MeProfile>("/me/profile"),
          api.get<ApiResponse<CompetitionItem[]>>("/catalogs/competitions"),
          api.get<ApiResponse<TeamItem[]>>("/catalogs/teams"),
        ]);
        if (!cancelled) {
          applyProfile(profileResponse.data);
          setCompetitions(competitionsResponse.data.data.filter((competition) => competition.active));
          setTeams(teamsResponse.data.data.filter((team) => team.active));
        }
      } catch {
        if (!cancelled) setLoadError("No se pudo cargar el perfil.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, applyProfile]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const avatarSrc = avatarPreviewUrl ?? profile?.avatarUrl ?? null;
  const selectedCompetitionIdsSet = useMemo(
    () => new Set(selectedCompetitionIds),
    [selectedCompetitionIds]
  );
  const selectedTeamIdsSet = useMemo(() => new Set(selectedTeamIds), [selectedTeamIds]);
  const visibleTeams = useMemo(() => {
    if (selectedCompetitionIds.length === 0) return teams;
    return teams.filter((team) => selectedCompetitionIdsSet.has(team.competitionId));
  }, [selectedCompetitionIds.length, selectedCompetitionIdsSet, teams]);
  const initials = useMemo(() => {
    const fullName = [name || profile?.name, lastname || profile?.lastname]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(" ");

    if (!fullName) return "PP";

    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [lastname, name, profile?.lastname, profile?.name]);
  const username = profile?.username?.trim() || null;

  const toggleCompetition = (competitionId: number) => {
    setSelectedCompetitionIds((current) => {
      const exists = current.includes(competitionId);
      const nextCompetitionIds = exists
        ? current.filter((id) => id !== competitionId)
        : [...current, competitionId];

      if (exists) {
        setSelectedTeamIds((teamIds) =>
          teamIds.filter((teamId) => {
            const team = teams.find((entry) => entry.id === teamId);
            return team ? team.competitionId !== competitionId : true;
          })
        );
      }

      return nextCompetitionIds;
    });
  };

  const toggleTeam = (team: TeamItem) => {
    setSelectedTeamIds((current) =>
      current.includes(team.id)
        ? current.filter((id) => id !== team.id)
        : [...current, team.id]
    );

    setSelectedCompetitionIds((current) =>
      current.includes(team.competitionId) ? current : [...current, team.competitionId]
    );
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      const { data } = await api.put<MeProfile>("/me/profile", {
        name: name.trim(),
        lastname: lastname.trim(),
        bio: bio.trim(),
        preferredCompetitionIds: selectedCompetitionIds,
        preferredTeamIds: selectedTeamIds,
      });
      applyProfile(data);
    } catch {
      setSaveError("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      setAvatarError("Usa una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("La imagen no debe pesar más de 5 MB.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreviewUrl;
    });
    setSelectedAvatarName(file.name);
    setAvatarError(null);
    setUploadingAvatar(true);
    try {
      const presignRes = await api.post<{ uploadUrl: string; objectKey: string }>(
        "/me/profile/avatar/presign",
        { contentType: file.type }
      );
      const { uploadUrl, objectKey } = presignRes.data;
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) {
        setAvatarError("No se pudo subir la imagen al almacenamiento.");
        return;
      }
      const completeRes = await api.post<MeProfile>("/me/profile/avatar/complete", { objectKey });
      applyProfile(completeRes.data);
      setAvatarPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setSelectedAvatarName(null);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { error?: string } } };
      if (ax.response?.status === 503) {
        setAvatarError(
          ax.response.data?.error ??
            "Subida de avatares no disponible (configura R2 en el servidor)."
        );
      } else {
        setAvatarError("No se pudo actualizar la foto de perfil.");
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loadError) {
    return (
      <p className="text-red-600 dm-sans" role="alert">
        {loadError}
      </p>
    );
  }

  if (!profile) {
    return <Loading visible={true} />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_28px_100px_-48px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(19,70,134,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(254,178,26,0.22),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.96),_rgba(255,255,255,1))]" />

        <div className="relative space-y-6 p-6 sm:p-8 lg:p-10">
          <aside className="rounded-[28px] border border-white/70 bg-slate-950 px-6 py-7 text-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.9)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="dm-sans text-sm font-medium text-slate-300">Mi perfil</p>
                <h1 className="dm-sans text-3xl font-bold tracking-tight">Tu espacio personal</h1>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-slate-200">
                <Sparkles className="size-3.5" />
                Perfil activo
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white/15 bg-gradient-to-br from-sky-400 via-primaryBlue to-orange-500 text-4xl font-semibold text-white shadow-[0_20px_45px_-30px_rgba(14,165,233,0.8)]">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Foto de perfil" className="h-full w-full object-cover" />
                    ) : (
                      <span className="dm-sans">{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 right-2 rounded-full border border-white/15 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-md">
                    {uploadingAvatar ? "Subiendo..." : "Foto visible"}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="dm-sans text-2xl font-semibold text-white">
                    {[name.trim(), lastname.trim()].filter(Boolean).join(" ") || "Tu nombre"}
                  </h2>
                  {username && <p className="text-sm font-medium text-sky-200">@{username}</p>}
                  <p className="flex items-center gap-2 text-sm text-slate-300">
                    <Mail className="size-4" />
                    {profile.email}
                  </p>
                  <p className="max-w-xl text-sm leading-6 text-slate-300">
                    Administra tu identidad pública, actualiza tu foto y mantén tu información lista para que tu perfil se vea más sólido y confiable.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="grid gap-6 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="dm-sans text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                    Imagen de perfil
                  </p>
                  <h2 className="dm-sans mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Sube una foto que se vea profesional
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Acepta JPG, PNG o WebP hasta 5 MB. Mostramos una vista previa antes de que termine la subida.
                </p>
              </div>

              <label className="mt-5 block cursor-pointer rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-5 transition hover:border-primaryBlue/60 hover:bg-white">
                <input
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  className="sr-only"
                  disabled={uploadingAvatar}
                  onChange={onAvatarSelected}
                />

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primaryBlue/10 text-primaryBlue">
                      {uploadingAvatar ? <LoaderCircle className="size-5 animate-spin" /> : <ImageUp className="size-5" />}
                    </div>
                    <div className="space-y-1">
                      <p className="dm-sans text-base font-semibold text-slate-900">
                        {uploadingAvatar ? "Subiendo tu nueva foto..." : "Seleccionar una nueva imagen"}
                      </p>
                      <p className="text-sm leading-6 text-slate-500">
                        {selectedAvatarName
                          ? `Archivo seleccionado: ${selectedAvatarName}`
                          : "Haz clic para elegir una imagen y actualizar tu avatar."}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                    <Camera className="size-4" />
                    {uploadingAvatar ? "Procesando" : "Cambiar foto"}
                  </span>
                </div>
              </label>

              {avatarError && (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {avatarError}
                </p>
              )}

              <div className="mt-6">
                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dm-sans">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(ev) => setBio(ev.target.value)}
                  rows={5}
                  placeholder="Cuéntanos algo sobre ti, tu estilo o lo que quieres que otros vean en tu perfil."
                  className="mt-2 min-h-[140px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10"
                />
              </div>
            </section>

            <form onSubmit={saveProfile} className="space-y-6">
              <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="dm-sans text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                    Información personal
                  </p>
                  <h2 className="dm-sans mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Mantén tus datos al día
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                  <UserRound className="size-4" />
                  Tu correo no se puede editar
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dm-sans">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="text"
                    readOnly
                    value={profile.email}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 shadow-inner outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dm-sans">
                    Nombre
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10"
                    placeholder="Escribe tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-slate-700 dm-sans">
                    Apellido
                  </label>
                  <input
                    id="lastname"
                    value={lastname}
                    onChange={(ev) => setLastname(ev.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10"
                    placeholder="Escribe tu apellido"
                  />
                </div>

              </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="dm-sans text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                      Preferencias deportivas
                    </p>
                    <h2 className="dm-sans mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      Ligas y equipos que quieres seguir
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
                    <ShieldCheck className="size-4" />
                    {selectedCompetitionIds.length} ligas y {selectedTeamIds.length} equipos
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Trophy className="size-4 text-primaryBlue" />
                      <h3 className="dm-sans text-lg font-semibold text-slate-900">Ligas favoritas</h3>
                    </div>
                    <p className="mb-4 text-sm leading-6 text-slate-500">
                      Elige las competiciones que más te interesan. Si marcas un equipo, su liga se agrega automáticamente.
                    </p>

                    <div className="grid gap-3 max-h-[320px] overflow-y-auto pr-1">
                      {competitions.map((competition) => {
                        const selected = selectedCompetitionIdsSet.has(competition.id);
                        return (
                          <button
                            key={competition.id}
                            type="button"
                            onClick={() => toggleCompetition(competition.id)}
                            className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${
                              selected
                                ? "border-primaryBlue bg-primaryBlue/5 shadow-[0_14px_30px_-24px_rgba(19,70,134,0.7)]"
                                : "border-slate-200 bg-white hover:border-primaryBlue/40 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="dm-sans font-semibold text-slate-900">{competition.name}</p>
                              <p className="text-sm text-slate-500">
                                {competition.sportName} · {competition.countryName}
                              </p>
                            </div>
                            <span
                              className={`mt-0.5 flex size-6 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-primaryBlue bg-primaryBlue text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              <Check className="size-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <UserRound className="size-4 text-orange-500" />
                      <h3 className="dm-sans text-lg font-semibold text-slate-900">Equipos favoritos</h3>
                    </div>
                    <p className="mb-4 text-sm leading-6 text-slate-500">
                      Te mostramos todos los equipos o solo los de las ligas elegidas para ayudarte a elegir más rápido.
                    </p>

                    <div className="grid gap-3 max-h-[320px] overflow-y-auto pr-1">
                      {visibleTeams.map((team) => {
                        const selected = selectedTeamIdsSet.has(team.id);
                        return (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => toggleTeam(team)}
                            className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${
                              selected
                                ? "border-orange-400 bg-orange-50 shadow-[0_14px_30px_-24px_rgba(249,115,22,0.55)]"
                                : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="dm-sans font-semibold text-slate-900">{team.name}</p>
                              <p className="text-sm text-slate-500">
                                {team.competitionName} · {team.countryName}
                              </p>
                            </div>
                            <span
                              className={`mt-0.5 flex size-6 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-orange-500 bg-orange-500 text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              <Check className="size-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {visibleTeams.length === 0 && (
                      <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Selecciona una liga para ver sus equipos disponibles.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {saveError && (
                <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {saveError}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-500">
                  Los cambios se reflejan en tu perfil apenas termina el guardado.
                </p>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-2xl bg-primaryBlue px-5 text-sm text-white hover:opacity-95"
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export function MiPerfilPage() {
  const role = useAuthStore((state) => state.role);
  if (role === "ROLE_ADMIN") {
    return (
      <UserLayout>
        <MiPerfilForm />
      </UserLayout>
    );
  }
  return (
    <TipsterLayout>
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">
        <MiPerfilForm />
      </div>
    </TipsterLayout>
  );
}
