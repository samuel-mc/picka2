import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@base-ui/react/dialog";
import { Gift, Sparkles, X } from "lucide-react";

const SNOOZE_MS = 5 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = "picka2_invite_nudge_snooze_until";

function readSnoozeUntil(): number {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

type InviteFriendsNudgeDialogProps = {
  /** Tipster en feed principal (no guardados). */
  enabled: boolean;
  /** No mostrar mientras el onboarding de feed está abierto. */
  onboardingOpen: boolean;
};

/**
 * Recordatorio ocasional de invitaciones: tras un delay al cargar el feed,
 * si no hay snooze activo. Al cerrar o “Ahora no”, no vuelve antes de ~5 días.
 */
export function InviteFriendsNudgeDialog({ enabled, onboardingOpen }: InviteFriendsNudgeDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || onboardingOpen) {
      return;
    }

    const now = Date.now();
    if (now < readSnoozeUntil()) {
      return;
    }

    const delayMs = 35_000 + Math.floor(Math.random() * 25_000);

    const id = window.setTimeout(() => {
      setOpen(true);
    }, delayMs);

    return () => {
      window.clearTimeout(id);
    };
  }, [enabled, onboardingOpen]);

  const snoozeAndClose = () => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_MS));
    setOpen(false);
  };

  const goInvite = () => {
    snoozeAndClose();
    navigate("/invitar");
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && snoozeAndClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[55] bg-slate-950/55" />
        <Dialog.Viewport className="fixed inset-0 z-[56] flex items-center justify-center p-4 sm:p-6">
          <Dialog.Popup className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_64px_rgba(15,76,129,0.2)] outline-none">
            <div className="border-b border-slate-100 bg-gradient-to-br from-[#f6fbfe] to-white px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f4c81]/12 text-[#0f4c81]">
                    <Gift className="h-6 w-6" />
                  </span>
                  <div>
                    <Dialog.Title className="text-lg font-black text-slate-900">
                      Invita a tus compas
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm leading-relaxed text-slate-600">
                      Comparte tu link: si se registran y empiezan a seguir tipsters, ambos salen ganando — tú
                      puedes ganar badge y un boost en el feed &quot;Para ti&quot;.
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={snoozeAndClose}
                className="order-2 inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 sm:order-1"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={goInvite}
                className="order-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ed5f2f] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(237,95,47,0.28)] transition hover:bg-[#d95225] sm:order-2"
              >
                <Sparkles className="h-4 w-4" />
                Ver mi invitación
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
