import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImageUp, LoaderCircle } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse } from "@/types/catalog";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

interface CatalogLogoUploaderProps {
  currentLogoUrl: string | null;
  entityId: number | null;
  entityLabel: string;
  presignEndpoint: string;
  completeEndpoint: string;
  onUploaded: (logoUrl: string | null) => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const responseData = error.response.data as { message?: string };
    if (responseData?.message) return responseData.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const CatalogLogoUploader = ({
  currentLogoUrl,
  entityId,
  entityLabel,
  presignEndpoint,
  completeEndpoint,
  onUploaded,
}: CatalogLogoUploaderProps) => {
  const api = useApi();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !entityId) return;

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      toast.error("Usa una imagen JPG, PNG o WebP");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      toast.error("La imagen no debe pesar más de 5 MB");
      return;
    }

    try {
      setUploading(true);
      const presignResponse = await api.post<
        ApiResponse<{ uploadUrl: string; objectKey: string }>
      >(presignEndpoint, { contentType: file.type });

      const { uploadUrl, objectKey } = presignResponse.data.data;

      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!putResponse.ok) {
        toast.error("No se pudo subir la imagen al almacenamiento");
        return;
      }

      const completeResponse = await api.post<ApiResponse<{ logoUrl: string | null }>>(
        completeEndpoint,
        { objectKey }
      );

      onUploaded(completeResponse.data.data.logoUrl ?? null);
      toast.success(`Logo de ${entityLabel} actualizado`);
    } catch (error) {
      toast.error(
        getErrorMessage(error, `No fue posible subir el logo de ${entityLabel}`)
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {currentLogoUrl ? (
              <img
                src={currentLogoUrl}
                alt={`Logo de ${entityLabel}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold uppercase text-slate-400">
                Sin logo
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Logo actual</p>
            <p className="text-sm text-slate-500">
              JPG, PNG o WebP hasta 5 MB.
            </p>
          </div>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="sr-only"
            disabled={uploading || !entityId}
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !entityId}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImageUp className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Subiendo..." : currentLogoUrl ? "Cambiar logo" : "Subir logo"}
          </Button>
        </div>
      </div>
    </div>
  );
};
