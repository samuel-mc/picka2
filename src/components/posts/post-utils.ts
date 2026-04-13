import type { ResultStatus } from "@/types/posts";

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
