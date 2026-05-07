import type { PostItem, ResultStatus } from "@/types/posts";

export const postTypeOptions = [
  { value: "ANALYSIS", label: "Análisis" },
  { value: "PICK_SIMPLE", label: "Pick simple" },
  { value: "PARLEY", label: "Parley" },
] as const;

export const visibilityOptions = [
  { value: "PUBLIC", label: "Público" },
  { value: "FOLLOWERS_ONLY", label: "Solo seguidores" },
  { value: "PRIVATE", label: "Privado" },
] as const;

export const resultStatusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "WON", label: "Ganado" },
  { value: "LOST", label: "Perdido" },
  { value: "VOID", label: "Void" },
] as const;

export const stakeOptions = Array.from({ length: 10 }, (_, index) => {
  const value = (index + 1) * 10;
  return { value, label: `${value}` };
});

export function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function getResultStatusLabel(status: ResultStatus | null | undefined) {
  return resultStatusOptions.find((item) => item.value === status)?.label ?? "Sin definir";
}

export function getResultStatusClasses(status: ResultStatus | null | undefined) {
  switch (status) {
    case "WON":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "LOST":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    case "VOID":
      return "bg-slate-200 text-slate-700 ring-slate-300";
    case "PENDING":
    default:
      return "bg-amber-100 text-amber-700 ring-amber-200";
  }
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "TP";
}

export function toDatetimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function getPostShareUrl(postId: number) {
  if (typeof window === "undefined") {
    return `/posts/${postId}`;
  }

  return new URL(`/posts/${postId}`, window.location.origin).toString();
}

export function getProfileShareUrl(userId: number) {
  if (typeof window === "undefined") {
    return `/perfil/${userId}`;
  }

  return new URL(`/perfil/${userId}`, window.location.origin).toString();
}

function truncateText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

export function composePostSharePayload(post: PostItem, variant: "short" | "long" = "short"): SharePayload {
  const url = getPostShareUrl(post.id);
  const author = post.author?.name ?? "Tipster";

  const sportOrLeague =
    post.simplePick?.sport ??
    (post.parleySelections.length > 1
      ? "Multi deporte"
      : post.parleySelections[0]?.sport ?? post.parleySelections[0]?.league ?? "Deportes");

  if (post.type === "PICK_SIMPLE") {
    const eventTime = post.simplePick?.eventDate ? formatDate(post.simplePick.eventDate) : null;
    const stake = post.simplePick?.stake != null ? `${post.simplePick.stake}u` : null;
    const pickLine = [sportOrLeague, post.simplePick?.league].filter(Boolean).join(" — ");

    if (variant === "long") {
      const rationale = truncateText(post.content ?? "", 180);
      const lines = [
        pickLine ? `${pickLine}` : "Pick",
        rationale ? `🧠 ${rationale}` : null,
        `Por: ${author} en Picka2`,
        `Detalles: ${url}`,
      ].filter(Boolean);

      return { title: `Picka2 | ${sportOrLeague} — ${author}`, text: lines.join("\n"), url };
    }

    const lines = [
      `Picka2 | ${sportOrLeague} — ${author}`,
      pickLine || "Pick",
      [eventTime ? `🕒 ${eventTime}` : null, stake ? `Stake: ${stake}` : null].filter(Boolean).join("  |  "),
      url,
    ].filter((line) => Boolean(line && String(line).trim().length > 0));

    return { title: `Picka2 | ${sportOrLeague} — ${author}`, text: lines.join("\n"), url };
  }

  if (post.type === "PARLEY") {
    const eventTime = post.parley?.eventDate ? formatDate(post.parley.eventDate) : null;
    const stake = post.parley?.stake != null ? `${post.parley.stake}u` : null;
    const legsCount = post.parleySelections.length;
    const legsTop = post.parleySelections.slice(0, 3);
    const legsBullets =
      legsTop.length > 0
        ? legsTop.map((s) => `- ${[s.sport, s.league].filter(Boolean).join(" · ")}`).join("\n")
        : null;
    const moreLegs = legsCount > legsTop.length ? `+${legsCount - legsTop.length} más…` : null;

    if (variant === "long") {
      const lines = [
        `Parley (${legsCount}):`,
        legsBullets,
        moreLegs,
        `Por: ${author} — ${sportOrLeague}`,
        `Ver post: ${url}`,
      ].filter(Boolean);

      return { title: `Picka2 | Parley — ${author}`, text: lines.join("\n"), url };
    }

    const headlineLegs = post.parleySelections.slice(0, 2);
    const headline =
      headlineLegs.length === 0
        ? "Parley"
        : headlineLegs.map((s) => s.league || s.sport).filter(Boolean).join(" + ") +
          (legsCount > 2 ? ` (+${legsCount - 2} más)` : "");

    const lines = [
      `Picka2 | Parley — ${author}`,
      `${legsCount} selecciones: ${headline}`,
      [eventTime ? `🕒 ${eventTime}` : null, stake ? `Stake: ${stake}` : null].filter(Boolean).join("  |  "),
      url,
    ].filter((line) => Boolean(line && String(line).trim().length > 0));

    return { title: `Picka2 | Parley — ${author}`, text: lines.join("\n"), url };
  }

  // ANALYSIS
  const hook = truncateText(post.content ?? "", variant === "long" ? 90 : 90);
  const snippet = truncateText(post.content ?? "", 220);

  if (variant === "long") {
    const lines = [
      hook || `Picka2 | Análisis — ${sportOrLeague}`,
      snippet && snippet !== hook ? `Resumen: ${snippet}` : null,
      `Por: ${author} en Picka2`,
      url,
    ].filter(Boolean);
    return { title: `Picka2 | Análisis — ${sportOrLeague}`, text: lines.join("\n"), url };
  }

  const lines = [
    `Picka2 | Análisis — ${sportOrLeague}`,
    hook,
    `Por: ${author}`,
    url,
  ].filter(Boolean);

  return { title: `Picka2 | Análisis — ${sportOrLeague}`, text: lines.join("\n"), url };
}

export function composeTipsterSharePayload(input: {
  userId: number;
  tipsterName: string;
  tipsterHook?: string | null;
  optionalStatsLine?: string | null;
  variant?: "short" | "long";
}): SharePayload {
  const url = getProfileShareUrl(input.userId);
  const tipsterHook = truncateText(input.tipsterHook ?? "", 90);
  const variant = input.variant ?? "short";

  if (variant === "long") {
    const lines = [
      `Sigue a ${input.tipsterName} en Picka2`,
      tipsterHook || null,
      input.optionalStatsLine?.trim() ? input.optionalStatsLine.trim() : null,
      url,
    ].filter(Boolean);
    return { title: `Picka2 | Tipster: ${input.tipsterName}`, text: lines.join("\n"), url };
  }

  const lines = [
    `Picka2 | Tipster: ${input.tipsterName}`,
    tipsterHook || null,
    `Perfil: ${url}`,
  ].filter(Boolean);
  return { title: `Picka2 | Tipster: ${input.tipsterName}`, text: lines.join("\n"), url };
}

export async function shareContent(payload: SharePayload) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload);
      return { completed: true, copied: false, url: payload.url };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { completed: false, copied: false, url: payload.url };
      }
    }
  }

  const clipboardText = `${payload.text}\n${payload.url}`.trim();
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(clipboardText);
    return { completed: true, copied: true, url: payload.url };
  }

  return { completed: true, copied: false, url: payload.url };
}

export async function sharePostLink(postId: number) {
  const url = getPostShareUrl(postId);
  return shareContent({
    title: "Picka2",
    text: "Mira este post en Picka2",
    url,
  });
}
