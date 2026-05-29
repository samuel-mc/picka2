import { TipsterLayout } from "@/layouts/TipsterLayout";

const lastUpdated = "27 de mayo de 2026";

export default function TermsOfUsePage() {
  return (
    <TipsterLayout isFixed={false}>
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Términos de uso
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Última actualización: {lastUpdated}
          </p>
          <p className="mt-5 text-base leading-7 text-slate-700">
            Estos Términos regulan el acceso y uso de Picka2 (la “Plataforma”).
            Al navegar o usar la Plataforma, aceptas estos Términos.
          </p>
        </header>

        <section className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Naturaleza del servicio
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Picka2 es una plataforma de contenido y comunidad donde usuarios
              publican análisis, opiniones y picks. Picka2 no opera una casa de
              apuestas, no recibe ni procesa apuestas, depósitos o retiros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Elegibilidad y cuenta
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Debes tener la mayoría de edad legal aplicable para participar en
              contenido relacionado con apuestas. Eres responsable de la
              información que proporcionas, de mantener la confidencialidad de
              tus credenciales y de toda actividad realizada desde tu cuenta.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Contenido de usuarios
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              El contenido publicado por usuarios (incluyendo picks, estadísticas
              o resultados) puede ser inexacto o estar desactualizado. Picka2 no
              garantiza su veracidad. No publiques contenido ilegal, engañoso,
              difamatorio, infractor o que promueva actividades prohibidas.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Uso aceptable
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>Respeta a la comunidad: no acoso, odio o spam.</li>
              <li>No intentes vulnerar la seguridad o disponibilidad.</li>
              <li>
                No uses la Plataforma para suplantación o recolección indebida
                de datos.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Propiedad intelectual
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              La Plataforma, su diseño y software son propiedad de Picka2 o sus
              licenciantes. Los usuarios conservan derechos sobre su contenido,
              otorgando a Picka2 una licencia no exclusiva para alojarlo y
              mostrarlo dentro de la Plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Riesgos y juego responsable
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Apostar implica riesgo de pérdida. Si decides apostar, hazlo de
              forma responsable, con límites y solo si eres mayor de edad. El
              contenido en Picka2 no es asesoría financiera ni promesa de
              resultados.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Limitación de responsabilidad
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              En la medida permitida por la ley, Picka2 no será responsable por
              pérdidas derivadas del uso del contenido, interrupciones del
              servicio, o decisiones tomadas con base en información publicada
              por terceros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Cambios a los Términos
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Podemos actualizar estos Términos en cualquier momento. La fecha
              de “Última actualización” indica la versión vigente.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Contacto
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Para preguntas sobre estos Términos, contáctanos en{" "}
              <span className="font-semibold">contacto@picka.app</span>.
            </p>
          </div>
        </section>
      </main>
    </TipsterLayout>
  );
}

