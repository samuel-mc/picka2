import { Link } from "react-router-dom";

import { TipsterLayout } from "@/layouts/TipsterLayout";

const lastUpdated = "27 de mayo de 2026";

export default function ResponsibleGamblingPage() {
  return (
    <TipsterLayout isFixed={false}>
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Juego responsable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Última actualización: {lastUpdated}
          </p>
          <p className="mt-5 text-base leading-7 text-slate-700">
            Apostar implica riesgo. Si decides apostar, hazlo de forma
            responsable: solo si eres mayor de edad, con límites claros y sin
            perseguir pérdidas.
          </p>
        </header>

        <section className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Recomendaciones prácticas
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>Define un presupuesto y no lo excedas.</li>
              <li>Evita apostar bajo estrés, enojo o presión.</li>
              <li>No tomes el contenido como garantía de ganancias.</li>
              <li>Descansa: toma pausas y limita el tiempo.</li>
              <li>Si pierdes el control, busca ayuda profesional.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm leading-7 text-amber-900">
              Importante: Picka2 no opera apuestas. El contenido publicado por
              usuarios es informativo y puede ser incorrecto o incompleto.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Enlaces útiles
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Consulta también nuestros{" "}
              <Link to="/terminos" className="font-semibold text-primaryBlue">
                Términos de uso
              </Link>{" "}
              y la{" "}
              <Link to="/privacidad" className="font-semibold text-primaryBlue">
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </TipsterLayout>
  );
}

