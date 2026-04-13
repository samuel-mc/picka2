import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CalendarClock, SendHorizontal, Sparkles, Ticket } from "lucide-react";
import { useForm } from "react-hook-form";
import type { CompetitionItem, CatalogItem } from "@/types/catalog";
import type { CreatePostPayload, PostType, ResultStatus, Sportsbook } from "@/types/posts";
import {
  postTypeOptions,
  resultStatusOptions,
  stakeOptions,
  visibilityOptions,
} from "@/components/posts/post-utils";

type ComposerFormValues = {
  type: PostType;
  content: string;
  tagsInput: string;
  visibility: "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE";
  simplePick: {
    sportId: string;
    leagueId: string;
    stake: string;
    sportsbookId: string;
    eventDate: string;
    resultStatus: ResultStatus;
  };
  parley: {
    stake: string;
    sportsbookId: string;
    eventDate: string;
    resultStatus: ResultStatus;
  };
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0f4c81] focus:ring-4 focus:ring-[#0f4c81]/10";

interface Props {
  sports: CatalogItem[];
  competitions: CompetitionItem[];
  sportsbooks: Sportsbook[];
  submitting: boolean;
  onUploadImage: (file: File) => Promise<{ objectKey: string; mediaUrl: string }>;
  onSubmit: (payload: CreatePostPayload) => Promise<void>;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function PostComposer({
  sports,
  competitions,
  sportsbooks,
  submitting,
  onUploadImage,
  onSubmit,
}: Props) {
  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComposerFormValues>({
    defaultValues: {
      type: "ANALYSIS",
      content: "",
      tagsInput: "",
      visibility: "PUBLIC",
      simplePick: {
        sportId: "",
        leagueId: "",
        stake: "",
        sportsbookId: "",
        eventDate: "",
        resultStatus: "PENDING",
      },
      parley: {
        stake: "",
        sportsbookId: "",
        eventDate: "",
        resultStatus: "PENDING",
      },
    },
  });

  const selectedType = watch("type");
  const selectedSimpleSportId = watch("simplePick.sportId");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedParleyCompetitionIds, setSelectedParleyCompetitionIds] = useState<number[]>([]);
  const [parleySelectionError, setParleySelectionError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const visibleSimpleCompetitions = competitions.filter(
    (competition) =>
      competition.active &&
      (selectedSimpleSportId ? String(competition.sportId) === String(selectedSimpleSportId) : true)
  );
  const parleyCompetitionGroups = sports
    .filter((sport) => sport.active)
    .map((sport) => ({
      sport,
      competitions: competitions.filter(
        (competition) => competition.active && competition.sportId === sport.id
      ),
    }))
    .filter((group) => group.competitions.length > 0);

  const submitForm = handleSubmit(async (values) => {
    let uploadedImageKey: string | null = null;
    if (selectedFile) {
      setUploadingImage(true);
      setImageError(null);
      try {
        const uploaded = await onUploadImage(selectedFile);
        uploadedImageKey = uploaded.objectKey;
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          (error instanceof Error ? error.message : "No se pudo subir la imagen del post.");
        setImageError(message);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    const payload: CreatePostPayload = {
      type: values.type,
      content: values.content.trim(),
      imageKey: uploadedImageKey,
      tags: values.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      visibility: values.visibility,
    };

    if (values.type === "PICK_SIMPLE") {
      payload.simplePick = {
        sportId: Number(values.simplePick.sportId),
        leagueId: Number(values.simplePick.leagueId),
        stake: Number(values.simplePick.stake),
        sportsbookId: values.simplePick.sportsbookId
          ? Number(values.simplePick.sportsbookId)
          : null,
        eventDate: values.simplePick.eventDate,
        resultStatus: values.simplePick.resultStatus,
      };
    }

    if (values.type === "PARLEY") {
      if (selectedParleyCompetitionIds.length === 0) {
        setParleySelectionError("Selecciona al menos una liga para el parley.");
        return;
      }

      payload.parley = {
        selections: selectedParleyCompetitionIds
          .map((competitionId) => {
            const competition = competitions.find((item) => item.id === competitionId);
            return competition
              ? { sportId: Number(competition.sportId), leagueId: Number(competition.id) }
              : null;
          })
          .filter((selection): selection is { sportId: number; leagueId: number } => selection != null),
        stake: Number(values.parley.stake),
        sportsbookId: values.parley.sportsbookId ? Number(values.parley.sportsbookId) : null,
        eventDate: values.parley.eventDate,
        resultStatus: values.parley.resultStatus,
      };
    }

    await onSubmit(payload);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setImageError(null);
    setSelectedParleyCompetitionIds([]);
    setParleySelectionError(null);
    reset({
      type: "ANALYSIS",
      content: "",
      tagsInput: "",
      visibility: "PUBLIC",
      simplePick: {
        sportId: "",
        leagueId: "",
        stake: "",
        sportsbookId: "",
        eventDate: "",
        resultStatus: "PENDING",
      },
      parley: {
        stake: "",
        sportsbookId: "",
        eventDate: "",
        resultStatus: "PENDING",
      },
    });
  });

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      setImageError("Usa una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("La imagen no debe pesar más de 5 MB.");
      return;
    }

    setImageError(null);
    setSelectedFile(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const toggleParleyCompetition = (competitionId: number) => {
    setParleySelectionError(null);
    setSelectedParleyCompetitionIds((current) =>
      current.includes(competitionId)
        ? current.filter((id) => id !== competitionId)
        : [...current, competitionId]
    );
  };

  return (
    <form
      onSubmit={submitForm}
      className="rounded-[1.75rem] border border-white/70 bg-white/92 p-4 shadow-[0_20px_60px_rgba(13,38,76,0.1)] backdrop-blur sm:rounded-[2rem] sm:p-6 sm:shadow-[0_24px_80px_rgba(13,38,76,0.12)]"
    >
      <div className="mb-5 sm:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f4c81]">
          Crear publicación
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
          Comparte tu lectura del evento con un formato claro.
        </h2>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {postTypeOptions.map((option) => {
          const active = selectedType === option.value;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition sm:text-left ${
                active
                  ? "border-[#0f4c81] bg-[#0f4c81] text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#0f4c81]/35 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register("type")}
              />
              {option.label}
            </label>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-5">
        <section className="rounded-[1.4rem] border border-slate-200/80 bg-linear-to-br from-slate-50 to-white p-4 sm:rounded-[1.75rem] sm:p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Contexto del post</h3>
            <p className="text-sm text-slate-500">
              Explica el razonamiento detrás del análisis o del ticket.
            </p>
          </div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Contenido</label>
          <textarea
            {...register("content", { required: "Escribe el contenido del post" })}
            rows={5}
            placeholder="Comparte tu análisis, pick o contexto del parley..."
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0f4c81] focus:ring-4 focus:ring-[#0f4c81]/10"
          />
          {errors.content && (
            <p className="mt-2 text-sm text-rose-600">{errors.content.message}</p>
          )}
        </section>

        <section className="rounded-[1.4rem] border border-slate-200/80 bg-linear-to-br from-[#f7fbff] to-white p-4 sm:rounded-[1.75rem] sm:p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Presentación</h3>
            <p className="text-sm text-slate-500">
              Ajusta visibilidad, apoyo visual y etiquetas para ordenar el contenido.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Imagen opcional">
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onFileSelected}
                  className="block w-full text-sm text-slate-600 file:mb-2 file:mr-0 file:w-full file:rounded-2xl file:border-0 file:bg-[#edf5fb] file:px-4 file:py-3 file:font-semibold file:text-[#0f4c81] sm:file:mb-0 sm:file:mr-4 sm:file:w-auto sm:file:rounded-full sm:file:py-2"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="max-h-40 w-full rounded-2xl object-cover"
                  />
                )}
                {uploadingImage && <p className="text-xs text-slate-500">Subiendo imagen...</p>}
                {imageError && <p className="text-xs text-rose-600">{imageError}</p>}
              </div>
            </Field>
            <Field label="Tags">
              <input
                type="text"
                {...register("tagsInput")}
                placeholder="NBA, underdogs, value"
                className={inputClassName}
              />
            </Field>
            <Field label="Visibilidad">
              <select {...register("visibility")} className={inputClassName}>
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {selectedType === "PICK_SIMPLE" && (
          <section className="rounded-[1.4rem] border border-[#d5e3ef] bg-linear-to-br from-[#f4f8fb] to-white p-4 sm:rounded-[1.75rem] sm:p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Datos del pick</h3>
              <p className="text-sm text-slate-500">
                Selecciona el contexto del pick y el stake de forma estructurada.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Deporte">
                <select
                  {...register("simplePick.sportId", { required: "El deporte es obligatorio" })}
                  className={inputClassName}
                >
                  <option value="">Selecciona deporte</option>
                  {sports
                    .filter((sport) => sport.active)
                    .map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Liga">
                <select
                  {...register("simplePick.leagueId", { required: "La liga es obligatoria" })}
                  className={inputClassName}
                >
                  <option value="">Selecciona liga</option>
                  {visibleSimpleCompetitions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Stake">
                <select
                  {...register("simplePick.stake", { required: "El stake es obligatorio" })}
                  className={inputClassName}
                >
                  <option value="">Selecciona stake</option>
                  {stakeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Casa de apuesta">
                <select {...register("simplePick.sportsbookId")} className={inputClassName}>
                  <option value="">Selecciona una casa</option>
                  {sportsbooks
                    .filter((sportsbook) => sportsbook.active)
                    .map((sportsbook) => (
                      <option key={sportsbook.id} value={sportsbook.id}>
                        {sportsbook.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Fecha del evento">
                <input
                  type="datetime-local"
                  {...register("simplePick.eventDate", { required: "La fecha es obligatoria" })}
                  className={inputClassName}
                />
              </Field>
              <Field label="Estado inicial">
                <select {...register("simplePick.resultStatus")} className={inputClassName}>
                  {resultStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>
        )}

        {selectedType === "PARLEY" && (
          <section className="rounded-[1.4rem] border border-[#d5e3ef] bg-linear-to-br from-[#f4f8fb] to-white p-4 sm:rounded-[1.75rem] sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl bg-[#0f4c81] p-3 text-white">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Datos generales de la boleta</h3>
                <p className="text-sm text-slate-500">
                  Marca una o varias ligas, incluso de deportes distintos, para armar el parley.
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Selecciones del parley</p>
                    <p className="text-xs text-slate-500">
                      Puedes elegir varias ligas de uno o varios deportes.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf5fb] px-3 py-1 text-xs font-semibold text-[#0f4c81]">
                    {selectedParleyCompetitionIds.length} seleccionadas
                  </span>
                </div>

                <div className="space-y-4">
                  {parleyCompetitionGroups.map((group) => (
                    <div key={group.sport.id} className="space-y-2">
                      <p className="text-sm font-semibold text-slate-800">{group.sport.name}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.competitions.map((competition) => {
                          const checked = selectedParleyCompetitionIds.includes(competition.id);
                          return (
                            <label
                              key={competition.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition ${
                                checked
                                  ? "border-[#0f4c81] bg-[#edf5fb] shadow-sm"
                                  : "border-slate-200 bg-white hover:border-[#0f4c81]/35"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleParleyCompetition(competition.id)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0f4c81] focus:ring-[#0f4c81]"
                              />
                              <span className="text-sm font-medium text-slate-700">
                                {competition.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {parleySelectionError && (
                  <p className="mt-3 text-sm text-rose-600">{parleySelectionError}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stake">
                <select
                  {...register("parley.stake", { required: "El stake es obligatorio" })}
                  className={inputClassName}
                >
                  <option value="">Selecciona stake</option>
                  {stakeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Casa de apuesta">
                <select {...register("parley.sportsbookId")} className={inputClassName}>
                  <option value="">Selecciona una casa</option>
                  {sportsbooks
                    .filter((sportsbook) => sportsbook.active)
                    .map((sportsbook) => (
                      <option key={sportsbook.id} value={sportsbook.id}>
                        {sportsbook.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Fecha del ultimo juego">
                <div className="space-y-2">
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="datetime-local"
                      {...register("parley.eventDate", {
                        required: "La fecha del ultimo juego es obligatoria",
                      })}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0f4c81] focus:ring-4 focus:ring-[#0f4c81]/10"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Debe ser la fecha del ultimo partido o evento que cierre la boleta.
                  </p>
                </div>
              </Field>
              <Field label="Estado general">
                <select {...register("parley.resultStatus")} className={inputClassName}>
                  {resultStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-[#c8d9e8] bg-white/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Boleta general</p>
                  <p className="mt-1 text-sm text-slate-500">
                    El resultado ganado/perdido y la fecha se registran de forma general para toda la boleta.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="sticky bottom-3 mt-6 flex justify-stretch sm:static sm:justify-end">
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ed5f2f] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(237,95,47,0.28)] transition hover:bg-[#d95225] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <SendHorizontal className="h-4 w-4" />
          {submitting || uploadingImage ? "Publicando..." : "Publicar post"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
