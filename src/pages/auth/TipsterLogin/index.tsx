import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { RegisterInput } from "../../../components/common/RegisterInput";
import { Loading } from "../../../components/common/Loading";
import { useLogin } from "../../../hooks/useLogin";
import { getErrorMessage } from "../../../lib/errorMessage";
import toast from "react-hot-toast";
import { TipsterLayout } from "../../../layouts/TipsterLayout";
import sideImg from "../../../assets/side_login.png";
type Inputs = {
  username: string;
  password: string;
};

export const TipsterLogin = () => {
  const { login, error, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const username = data.username?.trim()?.toLowerCase();
    // Redirect tipsters to user dashboard for now (can be changed to /tipster/dashboard if it exists later)
    try {
      await login(username, data.password);
    } catch (errorResponse: unknown) {
      toast.error(getErrorMessage(errorResponse, error || "No fue posible iniciar sesión"));
    }
  };
  
  return (
    <TipsterLayout isFixed={false}>
      <Loading visible={isLoading} />
      <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(237,95,47,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,76,129,0.14),_transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef4f9_52%,#f8fafc_100%)] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-[0_35px_120px_rgba(15,76,129,0.18)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden bg-[#0d2f4f] lg:block">
            <img
              src={sideImg}
              alt="Tipster visual"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,47,0.2)_0%,rgba(8,28,47,0.82)_100%)]" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                <Sparkles className="h-4 w-4" />
                Picka2 Access
              </div>

              <div className="max-w-xl">
                <h1 className="text-4xl font-black leading-[1.02] xl:text-5xl">
                  Entra a tu espacio y sigue construyendo tu perfil de tipster.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/80 xl:text-lg">
                  Desde aquí entras al feed, guardas picks, comentas publicaciones y gestionas
                  tu presencia dentro de Picka2.
                </p>
              </div>

              <div className="grid gap-3 xl:grid-cols-3">
                <FeatureCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  title="Picks claros"
                  description="Comparte tickets, parleys y análisis en un solo flujo."
                />
                <FeatureCard
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Acceso seguro"
                  description="Tu cuenta protegida con acceso directo a recuperación."
                />
                <FeatureCard
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Marca personal"
                  description="Construye una presencia más sólida en tu feed."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-6 sm:px-8 sm:py-10 lg:px-10">
            <div className="w-full max-w-xl">
              <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_22px_70px_rgba(15,76,129,0.12)] sm:p-8">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#edf5fb] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#0f4c81]">
                    <ShieldCheck className="h-4 w-4" />
                    Login tipster
                  </div>
                  <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                    Iniciar sesión
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                    Entra con tu usuario o correo para continuar publicando, respondiendo y
                    gestionando tu perfil.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  autoComplete="on"
                  method="post"
                  action="/login"
                  name="tipster-login"
                >
                  <div className="flex flex-col">
                    <RegisterInput<Inputs>
                      name="username"
                      label="Username o correo electrónico"
                      register={register}
                      fieldError={errors.username}
                      autoComplete="username"
                      required
                    />
                    <RegisterInput<Inputs>
                      name="password"
                      label="Contraseña"
                      register={register}
                      fieldError={errors.password}
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                    <div className="mt-1 text-right">
                      <Link
                        to="/recuperar-contrasenia"
                        className="text-sm font-semibold text-primaryBlue transition hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,76,129,0.22)] transition hover:bg-[#0d416d]"
                    >
                      Entrar a mi cuenta
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                  <p className="text-sm text-slate-600">
                    ¿Todavía no tienes cuenta?{" "}
                    <Link
                      to="/registro"
                      className="font-semibold text-primaryBlue transition hover:underline"
                    >
                      Regístrate como tipster
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </TipsterLayout>
  );
};

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/12 bg-white/8 p-4 backdrop-blur">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/72">{description}</p>
    </div>
  );
}
