import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import "../UserSignup/styles.css";
import { RegisterInput } from "../../../components/common/RegisterInput";
import { Loading } from "../../../components/common/Loading";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { TipsterLayout } from "../../../layouts/TipsterLayout";
import { buildPasswordValidation } from "../../../lib/passwordValidation";
import { BadgeCheck, LockKeyhole, Sparkles, Trophy, UserRound } from "lucide-react";
import "./styles.css";

type Inputs = {
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  birthDate: string;
  bio: string;
  // avatarUrl is handled internally for now, but we can add it here if needed
};

const getAdultBirthDateLimit = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return today.toISOString().split("T")[0];
};

export const TipsterSignup = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const passwordValue = watch("password");
  const maxBirthDate = getAdultBirthDateLimit();

  useEffect(() => {
    void trigger("passwordConfirm");
  }, [passwordValue, trigger]);

  const formatFormData = (data: Inputs) => ({
    name: data.name?.trim().toUpperCase(),
    lastname: data.lastname?.trim().toUpperCase(),
    username: data.username?.trim().toLowerCase(),
    email: data.email?.trim().toLowerCase(),
    password: data.password,
    birthDate: data.birthDate,
    bio: data.bio?.trim(),
    avatarUrl: "/register-tipster", // dummy value as requested
  });

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    try {
      const payload = formatFormData(data);
      await api.post("/auth/register-tipster", payload);
      toast.success("Tipster creado correctamente", { duration: 5000 });
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      console.error("Error en registro:", error);
      const apiMessage =
        axios.isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(
              (error.response.data as { message?: unknown }).message ?? ""
            )
          : "";
      toast.error(apiMessage || "Error al generar el tipster");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TipsterLayout isFixed={false}>
      <Loading visible={isLoading} />
      <div className="tipster-signup-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-stretch">
          <section className="tipster-signup-hero flex h-full flex-col overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Sparkles size={16} />
              Comunidad Picka2
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              No sigas al gurú, conviértete en uno.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
              Crea tu perfil, comparte tu criterio y empieza a construir una presencia que inspire confianza.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="tipster-signup-stat">
                <Trophy size={18} />
                <span>Perfil profesional</span>
              </div>
              <div className="tipster-signup-stat">
                <BadgeCheck size={18} />
                <span>Acceso inmediato</span>
              </div>
              <div className="tipster-signup-stat">
                <LockKeyhole size={18} />
                <span>Registro seguro</span>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm uppercase tracking-[0.22em] text-white/60">
                Lo que te pediremos
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/85">
                <li className="flex items-start gap-3">
                  <UserRound size={18} className="mt-0.5 shrink-0" />
                  Tus datos básicos para crear una cuenta clara y profesional.
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0" />
                  Un username y correo que te identifiquen dentro de la plataforma.
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles size={18} className="mt-0.5 shrink-0" />
                  Una biografía breve para contar tu enfoque y estilo.
                </li>
              </ul>
            </div>
          </section>

          <section className="flex h-full flex-col rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primaryBlue/70">
                Registro de tipster
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Completa tu perfil
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Cuida estos detalles porque serán la base de cómo te verán dentro de Picka.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="grid gap-x-5 md:grid-cols-2">
                <RegisterInput<Inputs>
                  name="name"
                  label="Nombre"
                  register={register}
                  fieldError={errors.name}
                  required
                  validation={{
                    minLength: {
                      value: 2,
                      message: "Debe tener al menos 2 caracteres",
                    },
                    maxLength: {
                      value: 50,
                      message: "No puede exceder 50 caracteres",
                    },
                    pattern: { value: /^[A-Za-z\s]+$/, message: "Solo letras" },
                  }}
                />
                <RegisterInput<Inputs>
                  name="lastname"
                  label="Apellido"
                  register={register}
                  fieldError={errors.lastname}
                  required
                  validation={{
                    minLength: {
                      value: 2,
                      message: "Debe tener al menos 2 caracteres",
                    },
                    maxLength: {
                      value: 50,
                      message: "No puede exceder 50 caracteres",
                    },
                    pattern: { value: /^[A-Za-z\s]+$/, message: "Solo letras" },
                  }}
                />
                <RegisterInput<Inputs>
                  name="username"
                  label="Username"
                  register={register}
                  fieldError={errors.username}
                  required
                  validation={{
                    minLength: {
                      value: 5,
                      message: "Debe tener al menos 5 caracteres",
                    },
                    maxLength: {
                      value: 20,
                      message: "No puede exceder 20 caracteres",
                    },
                    pattern: {
                      value: /^[A-Za-z0-9]+$/,
                      message: "Solo se permiten letras y números",
                    },
                  }}
                />
                <RegisterInput<Inputs>
                  name="email"
                  label="Correo"
                  register={register}
                  fieldError={errors.email}
                  required
                  validation={{
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Correo inválido",
                    },
                  }}
                />
                <RegisterInput<Inputs>
                  name="birthDate"
                  label="Fecha de nacimiento"
                  register={register}
                  fieldError={errors.birthDate}
                  type="date"
                  required
                  validation={{
                    validate: (value) =>
                      value <= maxBirthDate || "Debes ser mayor de 18 años para registrarte como tipster",
                  }}
                />
                <RegisterInput<Inputs>
                  name="password"
                  label="Contraseña"
                  register={register}
                  fieldError={errors.password}
                  type="password"
                  required
                  validation={buildPasswordValidation<Inputs>()}
                />
                <RegisterInput<Inputs>
                  name="passwordConfirm"
                  label="Confirmar contraseña"
                  register={register}
                  fieldError={errors.passwordConfirm}
                  type="password"
                  required
                  validation={{
                    validate: (value) =>
                      value === getValues("password") ||
                      "Las contraseñas no coinciden",
                  }}
                />
                <div className="md:col-span-2">
                  <RegisterInput<Inputs>
                    name="bio"
                    label="Biografía"
                    register={register}
                    fieldError={errors.bio}
                    type="textarea"
                    required
                    validation={{
                      minLength: {
                        value: 10,
                        message: "Debe tener al menos 10 caracteres",
                      },
                      maxLength: {
                        value: 500,
                        message: "No puede exceder 500 caracteres",
                      },
                    }}
                  />
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Al registrarte, preparas tu perfil para empezar a publicar con identidad propia.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-primaryBlue hover:shadow-lg hover:shadow-primaryBlue/20"
                >
                  Crear mi cuenta
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </TipsterLayout>
  );
};
