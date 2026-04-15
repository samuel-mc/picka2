import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bookmark,
  MessageCircleMore,
  ShieldCheck,
  Star,
  Target,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import { TipsterLayout } from "@/layouts/TipsterLayout";
import { useAuthStore } from "@/stores/authStore";
import { PostsFeedScreen } from "@/components/posts/PostsFeedScreen";

const valueCards = [
  {
    icon: Target,
    title: "Picks con contexto",
    description:
      "Cada tipster puede publicar análisis, picks simples o parleys para que la comunidad entienda el razonamiento detrás de cada jugada.",
    tone: "bg-[#eef4fb] text-primaryBlue border-[#d5e4f4]",
  },
  {
    icon: ThumbsUp,
    title: "Reputación visible",
    description:
      "La comunidad comenta, guarda y comparte posts. Así la credibilidad se construye frente a todos.",
    tone: "bg-[#fff1ed] text-secondaryBlue border-[#ffd7cb]",
  },
  {
    icon: BarChart3,
    title: "Desempeño que sí importa",
    description:
      "Picka2 está pensada para seguir consistencia, conversación y nivel de respuesta, no solo promesas o capturas sueltas.",
    tone: "bg-[#fff7e1] text-[#9a6500] border-[#f6d98b]",
  },
];

const trustSignals = [
  {
    icon: BadgeCheck,
    label: "Perfil tipster",
    value: "Identidad y presencia profesional",
  },
  {
    icon: MessageCircleMore,
    label: "Comunidad activa",
    value: "Comentarios y feedback en cada pick",
  },
  {
    icon: Bookmark,
    label: "Contenido útil",
    value: "Posts guardados para volver después",
  },
];

const workflow = [
  {
    step: "01",
    title: "Publica tu pick",
    description:
      "El tipster comparte análisis, stake, liga y tipo de post desde una experiencia hecha para contenido deportivo.",
  },
  {
    step: "02",
    title: "Recibe reacción real",
    description:
      "La comunidad comenta, califica y comparte. Los mejores perfiles destacan por conversación y claridad, no por humo.",
  },
  {
    step: "03",
    title: "Construye autoridad",
    description:
      "Con el tiempo, tus publicaciones, engagement y desempeño ayudan a consolidar una reputación más confiable.",
  },
];

const showcasePosts = [
  {
    type: "Pick simple",
    title: "Moneyline con valor por bajas sensibles en defensa",
    author: "Mariana Lines",
    meta: "Liga MX · Stake 30",
    stats: ["142 likes", "28 comentarios", "64 guardados"],
    tone: "from-[#123f76] to-[#0d2f4f]",
  },
  {
    type: "Parley",
    title: "Combinada conservadora para cerrar la jornada",
    author: "DataBet Nico",
    meta: "NBA + NHL · Stake 20",
    stats: ["97 likes", "19 comentarios", "41 guardados"],
    tone: "from-[#ed5f2f] to-[#c7461b]",
  },
];

const audienceCards = [
  {
    icon: Trophy,
    title: "Para tipsters",
    description:
      "Crea presencia, publica contenido con formato claro y deja que tu trabajo se evalúe con interacción constante.",
  },
];

export default function Landing() {
  const authenticated = useAuthStore((state) => state.authenticated);
  const role = useAuthStore((state) => state.role);

  if (authenticated && role === "ROLE_TIPSTER") {
    return (
      <TipsterLayout isFixed={false}>
        <PostsFeedScreen />
      </TipsterLayout>
    );
  }

  return (
    <TipsterLayout>
      <main className="overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef4fa_46%,#fffaf2_100%)]">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(237,63,39,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(19,70,134,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,251,255,0.9)_100%)]" />
          <div className="absolute -left-16 top-28 h-44 w-44 rounded-full bg-secondaryBlue/12 blur-3xl" />
          <div className="absolute right-0 top-16 h-56 w-56 rounded-full bg-primaryBlue/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-18 pt-28 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pb-24 lg:pt-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e4f2] bg-white/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primaryBlue shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Comunidad de tipsters y picks
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 md:text-6xl">
                Donde los tipsters
                <span className="block text-primaryBlue">publican picks</span>
                y la comunidad
                <span className="block text-secondaryBlue">los pone a prueba</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                Picka2 conecta a tipsters que comparten análisis y picks con una experiencia social
                enfocada en comentarios, guardados, shares y reputación visible.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-secondaryBlue px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(237,63,39,0.26)] transition hover:translate-y-[-1px] hover:bg-[#d73922]"
                >
                  Quiero publicar picks
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d2dfed] bg-white/92 px-7 py-4 text-base font-semibold text-primaryBlue transition hover:border-primaryBlue/35 hover:bg-white"
                >
                  Entrar al feed
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {trustSignals.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-[1.6rem] border border-white/80 bg-white/80 p-4 shadow-[0_18px_50px_rgba(16,53,95,0.08)] backdrop-blur"
                  >
                    <div className="inline-flex rounded-2xl bg-[#edf4fb] p-3 text-primaryBlue">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-[#d7e2ef] bg-white/92 p-5 shadow-[0_28px_70px_rgba(12,39,76,0.16)] backdrop-blur sm:p-6">
                <div className="rounded-[1.8rem] bg-[linear-gradient(160deg,#123f76_0%,#0d2f4f_72%)] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a9c6e3]">
                        Home del feed
                      </p>
                      <h2 className="mt-3 text-3xl font-black leading-tight">
                        Publica, mide, responde y crece.
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 text-[#feb21a]">
                      <Star className="h-6 w-6 fill-current" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    {showcasePosts.map((post) => (
                      <article
                        key={post.title}
                        className={`rounded-[1.6rem] bg-gradient-to-br ${post.tone} p-5 shadow-[0_16px_34px_rgba(0,0,0,0.18)]`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
                            {post.type}
                          </span>
                          <span className="text-xs text-white/70">{post.meta}</span>
                        </div>
                        <h3 className="mt-4 text-xl font-bold leading-7">{post.title}</h3>
                        <p className="mt-2 text-sm text-white/75">por {post.author}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {post.stats.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-10">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondaryBlue">
              Lo que hace diferente a Picka2
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              No es solo un escaparate de picks; es una red donde el contenido gana valor con interacción.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {valueCards.map(({ icon: Icon, title, description, tone }) => (
              <article
                key={title}
                className={`rounded-[1.9rem] border p-7 shadow-[0_18px_45px_rgba(18,50,90,0.06)] ${tone}`}
              >
                <div className="inline-flex rounded-2xl bg-white/75 p-3 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-700">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-primaryBlue py-18 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a6c2df]">
                Flujo del producto
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight">
                El valor aparece cuando el pick se publica y la comunidad responde.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#d7e4f0]">
                Picka2 está pensada para que el tipster no solo comparta un pronóstico: también abra conversación,
                reciba validación social y genere una huella pública alrededor de su criterio.
              </p>
            </div>

            <div className="grid gap-4">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#feb21a] text-lg font-black text-[#16325a]">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#d7e4f0]">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            {audienceCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[2rem] border border-[#dde7f1] bg-white p-7 shadow-[0_22px_50px_rgba(12,39,76,0.08)]"
              >
                <div className="inline-flex rounded-2xl bg-[#eef4fb] p-3 text-primaryBlue">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] bg-[linear-gradient(135deg,#fff3ed_0%,#fff8ea_46%,#eef4fb_100%)] p-8 shadow-[0_22px_55px_rgba(18,50,90,0.08)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondaryBlue">
                  Empieza en Picka2
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">
                  Si tienes criterio para leer el juego, aquí puedes convertirlo en reputación.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Abre tu cuenta, comparte picks con contexto y deja que la comunidad te siga, te comente y valore tu trabajo.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center rounded-full bg-primaryBlue px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#103a6f]"
                >
                  Crear cuenta tipster
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-primaryBlue/15 bg-white px-6 py-3.5 text-sm font-semibold text-primaryBlue transition hover:border-primaryBlue/30"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </TipsterLayout>
  );
}
