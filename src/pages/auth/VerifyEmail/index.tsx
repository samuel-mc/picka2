import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import { Loading } from "../../../components/common/Loading";
import { TipsterLayout } from "../../../layouts/TipsterLayout";
import { CheckCircle, XCircle } from "lucide-react";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const api = useApi();

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No se encontró el token de verificación.");
        setIsLoading(false);
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage("Tu correo electrónico ha sido verificado con éxito.");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Hubo un error al verificar tu correo. El enlace puede haber expirado o ser inválido."
        );
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token, api]);

  return (
    <TipsterLayout isFixed={false}>
      <Loading visible={isLoading} />
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        {!isLoading && (
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
            {status === "success" ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  ¡Correo Verificado!
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                  to="/login"
                  className="bg-primaryBlue hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors w-full"
                >
                  Ir a Iniciar Sesión
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Error de Verificación
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                  to="/"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded transition-colors w-full"
                >
                  Volver al Inicio
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </TipsterLayout>
  );
};
