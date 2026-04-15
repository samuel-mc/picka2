import { Link } from "react-router-dom";
import { BadgeCheck, Mail, ShieldCheck, TrendingUp } from "lucide-react";

const footerSections = [
  {
    title: "Plataforma",
    links: [
      { label: "Inicio", to: "/" },
      { label: "Iniciar sesión", to: "/login" },
      { label: "Registro tipster", to: "/registro" },
      { label: "Panel admin", to: "/admin/login" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Recuperar contraseña", to: "/recuperar-contrasenia" },
      { label: "Verificación de correo", to: "/auth/verify-email" },
      { label: "Registro interno", to: "/admin/registro" },
    ],
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    text: "Estadísticas verificadas y perfiles con mayor claridad para la comunidad.",
  },
  {
    icon: TrendingUp,
    text: "Un espacio pensado para seguir desempeño real y construir credibilidad.",
  },
  {
    icon: BadgeCheck,
    text: "Onboarding simple para que nuevos tipsters publiquen con identidad profesional.",
  },
];

const Footer = () => {
  return (
    <footer className="mt-16 overflow-hidden bg-primaryBlue text-light">
      <div className="h-1.5 bg-secondaryBlue" />
      <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_35%,rgba(254,178,26,0.14)_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.9fr_1.1fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-light/85">
              Picka2
            </div>
            <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight text-white">
              Una plataforma para publicar, medir y seguir a los mejores tipsters.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-light/80">
              Diseñamos una experiencia más clara y confiable para que admins y tipsters trabajen con métricas, reputación y presencia profesional.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-light/85">
              <Mail size={18} />
              contacto@picka.app
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-light/65">
                  {section.title}
                </h3>
                <nav className="mt-4 flex flex-col gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-sm text-light/82 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-light/65">
              Confianza y desempeño
            </h3>
            <div className="mt-5 space-y-4">
              {trustPoints.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/6 p-4"
                >
                  <div className="mt-0.5 rounded-xl bg-[rgba(254,178,26,0.18)] p-2 text-[#FEB21A]">
                    <Icon size={18} />
                  </div>
                  <p className="text-sm leading-6 text-light/82">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[rgba(6,23,47,0.35)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-light/70 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© 2026 Picka2. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-5">
            <span>Estadísticas verificadas</span>
            <span>Acceso para tipsters</span>
            <span>Experiencia profesional</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
