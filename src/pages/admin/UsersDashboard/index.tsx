import { UserLayout } from "../../../layouts/UsersLayout";
import { Link } from "react-router-dom";

export const UserDashboard = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primaryBlue">Panel administrativo</h1>
          <p className="text-slate-600">
            Desde aquí puedes gestionar usuarios y los catálogos maestros del sitio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/admin/catalogos/deportes"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Deportes</h2>
            <p className="mt-2 text-sm text-slate-600">
              Catálogo base para estructurar las competiciones.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/paises"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Países</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ubicaciones disponibles para relacionar ligas y torneos.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/competiciones"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Competiciones</h2>
            <p className="mt-2 text-sm text-slate-600">
              Relación entre deporte y país para cada competición.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/equipos"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Equipos</h2>
            <p className="mt-2 text-sm text-slate-600">
              Equipos asociados a cada competición disponible.
            </p>
          </Link>

          <Link
            to="/admin/catalogos/home-prashes"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primaryBlue hover:bg-white"
          >
            <h2 className="text-lg font-semibold text-slate-900">Home Prashes</h2>
            <p className="mt-2 text-sm text-slate-600">
              Textos principales del hero que se muestra en el feed de tipsters.
            </p>
          </Link>
        </div>
      </div>
    </UserLayout>
  );
};
