import React, { useState } from "react";
import { UserLayout } from "../../layouts/UsersLayout";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { RegisterInput } from "../../components/RegisterInput";

type Inputs = {
  username: string;
  password: string;
};

export const UserLogin = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
  };

  return (
    <UserLayout>
      <div className="content-center h-100">
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
                className="bg-primary py-3 px-10 w-fit text-light mt-6"
              />
            </div>
          </form>
      </div>

      </div>
    </UserLayout>
  );
};
