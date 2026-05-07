import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Gift, Loader2, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { TipsterLayout } from "@/layouts/TipsterLayout";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse } from "@/types/catalog";
import { Button } from "@/components/common/ui/button";
import { shareContent } from "@/components/posts/post-utils";

type ReferralMePayload = {
  code: string;
  shareUrl: string;
};

export default function InviteReferralsPage() {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState<ReferralMePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.get<ApiResponse<ReferralMePayload>>("/referrals/me");
      if (!data.success || !data.data) {
        setError(data.message || "No se pudo obtener tu link.");
        setReferral(null);
        return;
      }
      setReferral(data.data);
    } catch {
      setError("No se pudo cargar tu link de invitación.");
      setReferral(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const copyUrl = async () => {
    if (!referral?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(referral.shareUrl);
      toast.success("Link copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const copyCode = async () => {
    if (!referral?.code) return;
    try {
      await navigator.clipboard.writeText(referral.code);
      toast.success("Código copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const onShare = async () => {
    if (!referral) return;
    const result = await shareContent({
      title: "Únete a Picka2",
      text: `Únete a Picka2 con mi invitación. Al activarte (sigue 3 tipsters), desbloqueamos recompensas para ambos.`,
      url: referral.shareUrl,
    });
    if (result.copied) {
      toast.success("Texto copiado al portapapeles");
    }
  };

  return (
    <TipsterLayout isFixed={false}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f4c81]/10 text-[#0f4c81]">
            <Gift className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invita tipsters</h1>
            <p className="mt-1 text-sm text-slate-600">
              Comparte tu link. Cuando alguien se registre y llegue a seguir 3 tipsters, se considera activado y
              aplicamos la recompensa al invitador (badge + boost en “Para ti” 48h).
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando tu invitación…
            </div>
          )}

          {!loading && error && (
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-rose-600">{error}</p>
              <Button type="button" variant="outline" onClick={() => void load()}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && referral && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tu link</p>
                <p className="mt-2 break-all rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
                  {referral.shareUrl}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Código</p>
                <p className="mt-2 font-mono text-lg font-semibold tracking-wide text-[#0f4c81]">
                  {referral.code}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => void copyUrl()} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar link
                </Button>
                <Button type="button" variant="outline" onClick={() => void copyCode()} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar código
                </Button>
                <Button type="button" variant="secondary" onClick={() => void onShare()} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/feed" className="font-medium text-[#0f4c81] underline-offset-4 hover:underline">
            Volver al feed
          </Link>
        </p>
      </div>
    </TipsterLayout>
  );
}
