import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { RegisterInput } from "../../../components/common/RegisterInput";
import { Loading } from "../../../components/common/Loading";
import { TipsterLayout } from "../../../layouts/TipsterLayout";
import sideImg from "../../../assets/side_login.png";
import { buildPasswordValidation } from "../../../lib/passwordValidation";

type Inputs = {
  password: string;
  passwordConfirm: string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!token) {
      toast.error("El enlace no contiene un token válido");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: data.password,
      });
      toast.success("Contraseña actualizada correctamente");
      navigate("/login", { replace: true });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "No fue posible actualizar la contraseña"
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
          <img src={sideImg} alt="Actualizar contrasenia" className="w-full" />
        </div>
        <div className="content-center bg-gray-50 min-h-screen">
          <div className="rounded py-10 px-8 max-w-2xl mx-auto">
            <h1 className="text-3xl text-primaryBlue mb-3">
              Actualizar contraseña
            </h1>
            <p className="text-gray-600 mb-6">
              Crea una nueva contraseña para tu cuenta.
            </p>
            {!token && (
              <p className="mb-6 text-red-500">
                El enlace no es válido o no contiene token.
              </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col">
                <RegisterInput<Inputs>
                  name="password"
                  label="Nueva contraseña"
                  register={register}
                  fieldError={errors.password}
                  type="password"
                  required
                  validation={buildPasswordValidation<Inputs>()}
                />
                <RegisterInput<Inputs>
                  name="passwordConfirm"
                  label="Confirmar nueva contraseña"
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
                <input
                  type="submit"
                  value="Actualizar contraseña"
                  className="bg-primaryBlue py-3 px-10 w-fit text-light mt-6 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!token}
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
