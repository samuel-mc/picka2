import { useForm, type SubmitHandler } from "react-hook-form";
import { RegisterInput } from "../../../components/RegisterInput";
import { Loading } from "../../../components/Loading";
import { useLogin } from "../../../hooks/useLogin";
import toast from "react-hot-toast";
import { LandingLayout } from "../../../layouts/LandingLayout";

type Inputs = {
  username: string;
  password: string;
};

export const UserLogin = () => {
  // const navigate = useNavigate();

  // const [isLoading, setIsLoading] = useState(false);
  const { login, error, isLoading } = useLogin();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    const username = data.username?.trim()?.toLowerCase();
    await login(username, data.password);
    if (error) {
      toast.error(error);
    } 

  };
  
  return (
    <LandingLayout>
      <Loading visible={isLoading} />
      <div className="content-center">
        <div className="bg-white shadow rounded py-10 px-8 max-w-2xl mx-auto">
          <h1 className="text-3xl text-primary mb-6">Iniciar sesión</h1>
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
                className="bg-primary py-3 px-10 w-fit text-light mt-6 hover:cursor-pointer"
              />
            </div>
          </form>
      </div>

      </div>
    </LandingLayout>
  );
};
