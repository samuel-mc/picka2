import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { BarChart3 } from "lucide-react";
import { UserLayout } from "../../../layouts/UsersLayout";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse } from "@/types/catalog";
import type { AdminAnalyticsResponse, AnalyticsBreakdownItem } from "@/types/analytics";

export const UserDashboard = () => {
  const api = useApi();
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<ApiResponse<AdminAnalyticsResponse>>("/analytics/admin/overview");
        if (!cancelled) {
          setAnalytics(data.data);
        }
      } catch {
        if (!cancelled) {
          toast.error("No se pudieron cargar las métricas del panel.");
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

  const topCards = analytics
    ? [
        { label: "Cuentas", value: analytics.totals.totalAccounts, accent: "from-slate-900 to-slate-700" },
        { label: "Tipsters", value: analytics.totals.totalTipsters, accent: "from-[#0f4c81] to-[#1b6aa5]" },
        { label: "Admins", value: analytics.totals.totalAdmins, accent: "from-[#475569] to-[#94a3b8]" },
      ]
    : [];

  const activityCards = analytics
    ? [
        { label: "Tipsters nuevos", value: analytics.last30Days.newTipsters },
        { label: "Posts nuevos", value: analytics.last30Days.newPosts },
        { label: "Comentarios", value: analytics.last30Days.newComments },
      ]
    : [];

  const communitySplit = analytics
    ? [
        {
          label: "Tipsters",
          value: analytics.totals.totalTipsters,
          helper: `${formatNumber(analytics.totals.validatedTipsters)} validados`,
          tone: "bg-[#eef4fb] text-[#0f4c81] border-[#cfe1ee]",
        },
        {
          label: "Administradores",
          value: analytics.totals.totalAdmins,
          helper: "Operación interna",
          tone: "bg-[#f8fafc] text-[#475569] border-[#cbd5e1]",
        },
      ]
    : [];

  const pendingTipsters = analytics
    ? Math.max(analytics.totals.totalTipsters - analytics.totals.validatedTipsters, 0)
    : 0;

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primaryBlue">Panel administrativo</h1>
          <p className="text-slate-600">
            Vista ejecutiva de la red, separando tipsters y operación interna.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
            Cargando analytics...
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-3xl bg-gradient-to-br ${card.accent} p-5 text-white shadow-lg`}
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-white/75">{card.label}</p>
                  <p className="mt-4 text-4xl font-black">{formatNumber(card.value)}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              {communitySplit.map((item) => (
                <div key={item.label} className={`rounded-3xl border p-5 ${item.tone}`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">{item.label}</p>
                  <p className="mt-4 text-4xl font-black">{formatNumber(item.value)}</p>
                  <p className="mt-2 text-sm opacity-80">{item.helper}</p>
                </div>
              ))}
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-amber-950">Cola de revisión de tipsters</h2>
                  <p className="mt-1 text-sm text-amber-900/80">
                    {formatNumber(pendingTipsters)} tipsters siguen pendientes de validación manual.
                  </p>
                </div>
                <Link
                  to="/admin/usuarios?role=TIPSTER&validation=pending"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  Revisar pendientes
                </Link>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primaryBlue" />
                  <h2 className="text-lg font-semibold text-slate-900">Tasas clave</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <RateCard label="Engagement por post" value={formatDecimal(analytics.rates.engagementPerPost)} />
                  <RateCard label="Interacción / views" value={formatPercent(analytics.rates.interactionRateOverViews)} />
                  <RateCard label="Save rate" value={formatPercent(analytics.rates.saveRateOverViews)} />
                  <RateCard label="Share rate" value={formatPercent(analytics.rates.shareRateOverViews)} />
                  <RateCard label="Comment rate" value={formatPercent(analytics.rates.commentRateOverViews)} />
                  <RateCard label="Win rate global" value={formatPercent(analytics.rates.winRate)} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Actividad últimos 30 días</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {activityCards.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(card.value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Shares</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatNumber(analytics.last30Days.newShares)}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <BreakdownCard title="Tipos de post" items={analytics.postTypeBreakdown} />
              <BreakdownCard title="Visibilidad" items={analytics.visibilityBreakdown} />
              <BreakdownCard title="Resultado de picks" items={analytics.pickResultBreakdown} />
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <BreakdownCard title="Competiciones preferidas" items={analytics.preferredCompetitions} />
              <BreakdownCard title="Equipos preferidos" items={analytics.preferredTeams} />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Tipsters con más tracción</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ranking por engagement social acumulado sobre sus posts.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="px-3 py-3 font-medium">Tipster</th>
                      <th className="px-3 py-3 font-medium">Followers</th>
                      <th className="px-3 py-3 font-medium">Posts</th>
                      <th className="px-3 py-3 font-medium">Engagement</th>
                      <th className="px-3 py-3 font-medium">Resueltos</th>
                      <th className="px-3 py-3 font-medium">WON</th>
                      <th className="px-3 py-3 font-medium">Win rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.topTipsters.map((tipster) => (
                      <tr key={tipster.userId}>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-slate-900">{tipster.displayName}</div>
                          <div className="text-slate-500">
                            @{tipster.username}
                            {tipster.validatedTipster ? " · validado" : ""}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-700">{formatNumber(tipster.followersCount)}</td>
                        <td className="px-3 py-3 text-slate-700">{formatNumber(tipster.postsCount)}</td>
                        <td className="px-3 py-3 text-slate-700">{formatNumber(tipster.totalEngagement)}</td>
                        <td className="px-3 py-3 text-slate-700">{formatNumber(tipster.resolvedPicks)}</td>
                        <td className="px-3 py-3 text-slate-700">{formatNumber(tipster.wonPicks)}</td>
                        <td className="px-3 py-3 font-semibold text-primaryBlue">{formatPercent(tipster.winRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              Las views mostradas representan registros únicos por usuario y post. Hoy no equivalen a impresiones reales del feed ni a sesiones.
            </section>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/admin/usuarios?role=TIPSTER&validation=pending"
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-300 hover:bg-amber-100"
          >
            <h2 className="text-lg font-semibold text-amber-950">Tipsters pendientes</h2>
            <p className="mt-2 text-sm text-amber-900/80">
              Acceso directo a la cola de validación manual.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/deportes"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Deportes</h2>
            <p className="mt-2 text-sm text-slate-600">
              Catálogo base para estructurar las competiciones.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/paises"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Países</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ubicaciones disponibles para relacionar ligas y torneos.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/competiciones"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Competiciones</h2>
            <p className="mt-2 text-sm text-slate-600">
              Relación entre deporte y país para cada competición.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/equipos"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Equipos</h2>
            <p className="mt-2 text-sm text-slate-600">
              Equipos asociados a cada competición disponible.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/home-prashes"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Home Prashes</h2>
            <p className="mt-2 text-sm text-slate-600">
              Textos principales del hero que se muestra en el feed de tipsters.
            </p>
          </Link>
        </div>
      </div>
    </UserLayout>
  );
};

function RateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: AnalyticsBreakdownItem[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos suficientes.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">{formatLabel(item.label)}</span>
              <span className="text-sm font-semibold text-slate-900">{formatNumber(item.value)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}

function formatLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
