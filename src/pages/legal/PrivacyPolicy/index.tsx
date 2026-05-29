import { TipsterLayout } from "@/layouts/TipsterLayout";

const lastUpdated = "27 de mayo de 2026";

export default function PrivacyPolicyPage() {
  return (
    <TipsterLayout isFixed={false}>
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Última actualización: {lastUpdated}
          </p>
          <p className="mt-5 text-base leading-7 text-slate-700">
            Esta Política describe cómo recopilamos, usamos y protegemos tus
            datos al usar Picka2.
          </p>
        </header>

        <section className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Datos que recopilamos
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>
                Datos de cuenta: nombre, username, correo y fecha de nacimiento
                (si aplica).
              </li>
              <li>
                Contenido: posts, comentarios, reacciones y otra información que
                publiques.
              </li>
              <li>
                Datos técnicos: IP aproximada, navegador/dispositivo, eventos de
                uso, y cookies/local storage (según configuración del sitio).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Cómo usamos tus datos
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>Operar y mejorar la Plataforma.</li>
              <li>Autenticación, seguridad y prevención de fraude/abuso.</li>
              <li>Atención a solicitudes y soporte.</li>
              <li>
                Comunicaciones transaccionales (por ejemplo, verificación de
                correo o restablecimiento de contraseña).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Base legal y consentimiento
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Tratamos tus datos para proveer el servicio, cumplir obligaciones
              legales y, cuando corresponda, con tu consentimiento.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Compartición de datos
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Podemos compartir datos con proveedores que nos ayudan a operar la
              Plataforma (hosting, analítica, correo transaccional), bajo
              obligaciones de confidencialidad y seguridad. No vendemos tus
              datos personales.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Conservación y seguridad
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Conservamos datos mientras sea necesario para las finalidades
              descritas o lo exija la ley. Implementamos medidas razonables para
              proteger la información, aunque ningún sistema es 100% infalible.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Tus derechos
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Puedes solicitar acceso, corrección o eliminación de tus datos,
              según corresponda. Escríbenos a{" "}
              <span className="font-semibold">contacto@picka.app</span>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Cambios a esta Política
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Podemos actualizar esta Política. Publicaremos la versión vigente
              con su fecha de actualización.
            </p>
          </div>
        </section>
      </main>
    </TipsterLayout>
  );
}

