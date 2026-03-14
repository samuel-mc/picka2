import { UserLayout } from "../../../layouts/UsersLayout";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import "../UserSignup/styles.css";
import { RegisterInput } from "../../../components/RegisterInput";
import { Loading } from "../../../components/Loading";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LandingLayout } from "../../../layouts/LandingLayout";

type Inputs = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  bio: string;
  // avatarUrl is handled internally for now, but we can add it here if needed
};

export const TipsterSignup = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>();

  const formatFormData = (data: Inputs) => ({
    name: data.name?.trim().toUpperCase(),
    username: data.username?.trim().toLowerCase(),
    email: data.email?.trim().toLowerCase(),
    password: data.password,
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
      // Sending to /auth/register-tipster. You can adjust this if the backend route is different.
      await api.post("/auth/register-tipster", payload);
      toast.success("Tipster creado correctamente");
      navigate("/user/login", { replace: true });
    } catch (error: any) {
      console.error("Error en registro:", error);
      toast.error(
        error?.response?.data?.message || "Error al generar el tipster"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LandingLayout>
      <Loading visible={isLoading} />
        <h1 className="text-3xl text-primary mb-6">Registro de Tipster</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col">
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
              name="password"
              label="Contraseña"
              register={register}
              fieldError={errors.password}
              type="password"
              required
              validation={{
                minLength: {
                  value: 8,
                  message: "Debe tener al menos 8 caracteres",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: "Debe incluir mayúsculas, minúsculas y números",
                },
              }}
            />
            <RegisterInput<Inputs>
              name="passwordConfirm"
              label="Confirmar Contraseña"
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
            <RegisterInput<Inputs>
              name="bio"
              label="Biografía"
              register={register}
              fieldError={errors.bio}
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
            <input
              type="submit"
              value="Enviar"
              className="bg-primary py-3 px-10 w-fit text-light mt-6 hover:cursor-pointer"
            />
          </div>
        </form>
    </LandingLayout>
  );
};
