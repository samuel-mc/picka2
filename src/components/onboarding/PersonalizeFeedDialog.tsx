import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Dialog } from "@base-ui/react/dialog";
import { Check, LoaderCircle, Users, X } from "lucide-react";
import type { AxiosInstance } from "axios";
import type { ApiResponse, CompetitionItem, TeamItem } from "@/types/catalog";
import type { PagedResponse, PostItem } from "@/types/posts";

type Step = "preferences" | "follow";

type SuggestedAuthor = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  validatedTipster: boolean;
  followedByCurrentUser?: boolean | null;
};

export function PersonalizeFeedDialog({
  open,
  api,
  onOpenChange,
  onCompleted,
}: {
  open: boolean;
  api: AxiosInstance;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [step, setStep] = useState<Step>("preferences");
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [followLoadingId, setFollowLoadingId] = useState<number | null>(null);

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<number[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

  const [suggested, setSuggested] = useState<SuggestedAuthor[]>([]);

  const selectedCompetitionSet = useMemo(() => new Set(selectedCompetitionIds), [selectedCompetitionIds]);
  const visibleTeams = useMemo(() => {
    if (selectedCompetitionIds.length === 0) return teams;
    return teams.filter((t) => selectedCompetitionSet.has(t.competitionId));
  }, [selectedCompetitionIds.length, selectedCompetitionSet, teams]);

  useEffect(() => {
    if (!open) return;
    setStep("preferences");
    setSuggested([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingPrefs(true);
    void (async () => {
      try {
        const [me, comps, tms] = await Promise.all([
          api.get<{
            preferredCompetitions: Array<{ id: number }> | null;
            preferredTeams: Array<{ id: number }> | null;
          }>("/me/profile"),
          api.get<ApiResponse<CompetitionItem[]>>("/catalogs/competitions"),
          api.get<ApiResponse<TeamItem[]>>("/catalogs/teams"),
        ]);

        if (cancelled) return;
        setCompetitions(comps.data.data.filter((c) => c.active));
        setTeams(tms.data.data.filter((t) => t.active));
        setSelectedCompetitionIds(me.data.preferredCompetitions?.map((c) => c.id) ?? []);
        setSelectedTeamIds(me.data.preferredTeams?.map((t) => t.id) ?? []);
      } catch {
        if (!cancelled) {
          toast.error("No se pudo cargar el onboarding.");
        }
      } finally {
        if (!cancelled) setLoadingPrefs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, open]);

  const toggleCompetition = (competitionId: number) => {
    setSelectedCompetitionIds((current) => {
      const exists = current.includes(competitionId);
      const next = exists ? current.filter((id) => id !== competitionId) : [...current, competitionId];

      if (exists) {
        setSelectedTeamIds((teamIds) =>
          teamIds.filter((teamId) => teams.find((t) => t.id === teamId)?.competitionId !== competitionId)
        );
      }

      return next;
    });
  };

  const toggleTeam = (team: TeamItem) => {
    setSelectedTeamIds((current) =>
      current.includes(team.id) ? current.filter((id) => id !== team.id) : [...current, team.id]
    );
    setSelectedCompetitionIds((current) =>
      current.includes(team.competitionId) ? current : [...current, team.competitionId]
    );
  };

  const savePreferencesAndContinue = async () => {
    if (selectedCompetitionIds.length === 0 && selectedTeamIds.length === 0) {
      toast.error("Selecciona al menos una liga o un equipo.");
      return;
    }
    setSavingPrefs(true);
    try {
      await api.put("/me/profile", {
        preferredCompetitionIds: selectedCompetitionIds,
        preferredTeamIds: selectedTeamIds,
      });
      setStep("follow");
      await loadSuggestions();
    } catch {
      toast.error("No se pudieron guardar tus preferencias.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data } = await api.get<ApiResponse<PagedResponse<PostItem>>>("/posts/feed/discover", {
        params: { page: 0, size: 30 },
      });
      const authors: SuggestedAuthor[] = [];
      const seen = new Set<number>();
      for (const post of data.data.items) {
        const a = post.author;
        if (!a || seen.has(a.id)) continue;
        seen.add(a.id);
        authors.push({
          id: a.id,
          name: a.name,
          username: a.username,
          avatarUrl: a.avatarUrl ?? null,
          validatedTipster: Boolean(a.validatedTipster),
          followedByCurrentUser: a.followedByCurrentUser ?? null,
        });
        if (authors.length >= 8) break;
      }
      setSuggested(authors);
    } catch {
      setSuggested([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleFollow = async (authorId: number, currentlyFollowing: boolean) => {
    setFollowLoadingId(authorId);
    try {
      if (currentlyFollowing) {
        await api.delete(`/posts/users/${authorId}/follow`);
      } else {
        await api.post(`/posts/users/${authorId}/follow`);
      }
      setSuggested((current) =>
        current.map((a) =>
          a.id === authorId ? { ...a, followedByCurrentUser: !currentlyFollowing } : a
        )
      );
    } catch {
      toast.error("No se pudo actualizar el seguimiento.");
    } finally {
      setFollowLoadingId(null);
    }
  };

  const finish = () => {
    onOpenChange(false);
    onCompleted();
  };

  const followedCount = suggested.filter((a) => Boolean(a.followedByCurrentUser)).length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/65" />
        <Dialog.Viewport className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
          <Dialog.Popup className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_90px_rgba(13,38,76,0.35)] outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <Dialog.Title className="text-lg font-black text-slate-900">
                  Personaliza tu feed
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-600">
                  Elige tus ligas/equipos y sigue tipsters para mejorar “Para ti”.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {step === "preferences" ? (
              <div className="space-y-5 p-6">
                {loadingPrefs ? (
                  <div className="flex items-center justify-center gap-3 rounded-3xl bg-slate-50 px-4 py-10 text-slate-600">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Cargando preferencias…
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">Ligas favoritas</p>
                      <p className="mt-1 text-sm text-slate-600">Selecciona 1–5 para mejores recomendaciones.</p>
                      <div className="mt-4 grid max-h-[320px] gap-2 overflow-y-auto pr-1">
                        {competitions.map((c) => {
                          const selected = selectedCompetitionSet.has(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleCompetition(c.id)}
                              className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                selected
                                  ? "border-[#0f4c81] bg-white shadow-[0_14px_30px_-24px_rgba(19,70,134,0.45)]"
                                  : "border-slate-200 bg-white hover:border-[#0f4c81]/30"
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-slate-900">{c.name}</p>
                                <p className="text-sm text-slate-500">
                                  {c.sportName} · {c.countryName}
                                </p>
                              </div>
                              <span
                                className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                                  selected ? "border-[#0f4c81] bg-[#0f4c81] text-white" : "border-slate-300 text-transparent"
                                }`}
                              >
                                <Check className="h-4 w-4" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">Equipos favoritos</p>
                      <p className="mt-1 text-sm text-slate-600">Opcional, para afinar aún más.</p>
                      <div className="mt-4 grid max-h-[320px] gap-2 overflow-y-auto pr-1">
                        {visibleTeams.map((t) => {
                          const selected = selectedTeamIds.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleTeam(t)}
                              className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                selected
                                  ? "border-[#ed5f2f] bg-white shadow-[0_14px_30px_-24px_rgba(237,95,47,0.35)]"
                                  : "border-slate-200 bg-white hover:border-[#ed5f2f]/30"
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-slate-900">{t.name}</p>
                                <p className="text-sm text-slate-500">{t.competitionName}</p>
                              </div>
                              <span
                                className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                                  selected ? "border-[#ed5f2f] bg-[#ed5f2f] text-white" : "border-slate-300 text-transparent"
                                }`}
                              >
                                <Check className="h-4 w-4" />
                              </span>
                            </button>
                          );
                        })}
                        {visibleTeams.length === 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            Selecciona una liga para ver sus equipos.
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    {selectedCompetitionIds.length} ligas · {selectedTeamIds.length} equipos
                  </p>
                  <button
                    type="button"
                    disabled={savingPrefs || loadingPrefs}
                    onClick={() => void savePreferencesAndContinue()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {savingPrefs ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Continuar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-6">
                <div className="flex items-start gap-3 rounded-3xl bg-[#f6fbfe] px-4 py-4 text-slate-700">
                  <Users className="h-5 w-5 text-[#ed5f2f]" />
                  <div>
                    <p className="text-sm font-semibold">Sigue tipsters recomendados</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Recomendados a partir de publicaciones recientes. Puedes seguir al menos 3 o saltar este paso.
                    </p>
                  </div>
                  <div className="ml-auto text-sm font-semibold text-slate-700">{followedCount} seguidos</div>
                </div>

                {loadingSuggestions ? (
                  <div className="flex items-center justify-center gap-3 rounded-3xl bg-slate-50 px-4 py-10 text-slate-600">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Cargando sugerencias…
                  </div>
                ) : suggested.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
                    No hay sugerencias disponibles por ahora.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggested.map((a) => {
                      const following = Boolean(a.followedByCurrentUser);
                      const loading = followLoadingId === a.id;
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{a.name}</p>
                            <p className="truncate text-sm text-slate-500">@{a.username}</p>
                          </div>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void toggleFollow(a.id, following)}
                            className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                              following ? "border border-slate-200 bg-white text-slate-700" : "bg-[#ed5f2f] text-white"
                            }`}
                          >
                            {loading ? "..." : following ? "Siguiendo" : "Seguir"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("preferences")}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={finish}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Terminar
                  </button>
                </div>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

