import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { RegisterInput } from "../../../components/common/RegisterInput";
import { Loading } from "../../../components/common/Loading";
import { useLogin } from "../../../hooks/useLogin";
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
    await login(username, data.password);
    if (error) {
      toast.error(error);
    } 
  };
  
  return (
    <TipsterLayout isFixed={false}>
      <Loading visible={isLoading} />
      <div className="grid grid-cols-2">
        <div className="">
          <img src={sideImg} alt="logo" className="w-full" />
        </div>
        <div className="content-center bg-gray-50">
          <div className=" rounded py-10 px-8 max-w-2xl mx-auto">
            <h1 className="text-3xl text-primaryBlue mb-6">Iniciar sesión como Tipster</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col">
                <RegisterInput<Inputs>
                  name="username"
                  label="Username o correo electrónico"
                  register={register}
                  fieldError={errors.username}
                  required
                />
                <RegisterInput<Inputs>
                  name="password"
                  label="Contraseña"
                  register={register}
                  fieldError={errors.password}
                  type="password"
                  required
                />
                <input
                  type="submit"
                  value="Enviar"
                  className="bg-primaryBlue py-3 px-10 w-fit text-light mt-6 hover:cursor-pointer"
                />
              </div>
            </form>
            <div className="mt-6 text-center">
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <Link to="/registro" className="text-primaryBlue hover:underline font-semibold">
                Regístrate aquí
              </Link>
            </div>
        </div>
      </div>

      </div>
    </TipsterLayout>
  );
};
