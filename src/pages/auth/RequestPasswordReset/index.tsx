import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { RegisterInput } from "../../../components/common/RegisterInput";
import { Loading } from "../../../components/common/Loading";
import { TipsterLayout } from "../../../layouts/TipsterLayout";
import sideImg from "../../../assets/side_login.png";

type Inputs = {
  email: string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const RequestPasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);

    try {
      await api.post("/auth/request-password-reset", {
        email: data.email.trim().toLowerCase(),
      });
      toast.success("Te enviamos un enlace para actualizar tu contraseña");
      reset();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "No fue posible procesar la solicitud"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TipsterLayout isFixed={false}>
      <Loading visible={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:block">
          <img src={sideImg} alt="Recuperar contrasenia" className="w-full" />
        </div>
        <div className="content-center bg-gray-50 min-h-screen">
          <div className="rounded py-10 px-8 max-w-2xl mx-auto">
            <h1 className="text-3xl text-primaryBlue mb-3">
              Recuperar contraseña
            </h1>
            <p className="text-gray-600 mb-6">
              Ingresa tu correo y te enviaremos un enlace temporal para
              actualizarla.
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col">
                <RegisterInput<Inputs>
                  name="email"
                  label="Correo electrónico"
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
                <input
                  type="submit"
                  value="Enviar enlace"
                  className="bg-primaryBlue py-3 px-10 w-fit text-light mt-6 hover:cursor-pointer"
                />
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-primaryBlue hover:underline font-semibold"
              >
                Volver al login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TipsterLayout>
  );
};
