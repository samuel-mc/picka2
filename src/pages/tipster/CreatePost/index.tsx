import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TipsterLayout } from "@/layouts/TipsterLayout";
import { useApi } from "@/hooks/useApi";
import { PostComposer } from "@/components/posts/PostComposer";
import type { ApiResponse, CatalogItem, CompetitionItem } from "@/types/catalog";
import type { CreatePostPayload, PostItem, Sportsbook } from "@/types/posts";

export default function CreatePostPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [sportsbooks, setSportsbooks] = useState<Sportsbook[]>([]);
  const [homePrashe, setHomePrashe] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [sportsResponse, competitionsResponse, sportsbookResponse, homePrashesResponse] =
          await Promise.all([
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
          toast.error("No se pudo cargar el formulario de publicación.");
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
  }, [api]);

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

  const handleCreatePost = useCallback(
    async (payload: CreatePostPayload) => {
      setSubmitting(true);
      try {
        await api.post<ApiResponse<PostItem>>("/posts", payload);
        toast.success("Post publicado.");
        navigate("/tipster/posts");
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "No se pudo publicar el post.";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [api, navigate]
  );

  return (
    <TipsterLayout isFixed={false}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(237,95,47,0.22),_transparent_32%),linear-gradient(180deg,#f7fbff_0%,#eef5fa_55%,#f9fbfd_100%)] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
          <button
            type="button"
            onClick={() => navigate("/tipster/posts")}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al feed
          </button>

          <div className="rounded-[1.75rem] bg-[#0d2f4f] p-5 text-white shadow-[0_24px_60px_rgba(13,47,79,0.24)] sm:rounded-[2rem] sm:p-7 sm:shadow-[0_30px_80px_rgba(13,47,79,0.28)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9dc4e6] sm:text-sm sm:tracking-[0.28em]">
              Tipster Network
            </p>
            <h1 className="mt-3 max-w-2xl text-[1.75rem] font-black leading-[1.05] sm:text-4xl">
              {homePrashe || "Crea un post que se vea claro y contundente."}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d5e5f4] sm:text-base">
              Diseña tu publicación con contexto, ticket y visibilidad desde una vista pensada para mobile.
            </p>
          </div>

          {loading ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 sm:rounded-[2rem] sm:p-12">
              Cargando formulario...
            </div>
          ) : (
            <PostComposer
              sports={sports}
              competitions={competitions}
              sportsbooks={sportsbooks}
              submitting={submitting}
              onSubmit={handleCreatePost}
              onUploadImage={handleUploadImage}
            />
          )}
        </div>
      </main>
    </TipsterLayout>
  );
}
