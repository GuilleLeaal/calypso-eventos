import { BudgetButton } from "./BudgetInquiry";
import { ArrowRight, ArrowUp } from "lucide-react";
import logo from "../assets/Logo2.png";
import { Garland } from "./home/Garland";

const year = new Date().getFullYear();

const WHATSAPP_URL = `https://wa.me/59899372068?text=${encodeURIComponent(
  "¡Hola! Me gustaría consultar disponibilidad para un evento en Calypso.",
)}`;

const navLinks = [
  { label: "Servicios", href: "/#services" },
  { label: "Espacios", href: "/#sectors" },
  { label: "Nuestra historia", href: "/nuestra-historia" },
  { label: "Contacto", href: "/contacto" },
  { label: "Ubicación", href: "/#location" },
];

const contactLinks = [
  { label: "+598 99 372 068", href: "tel:+59899372068", external: false },
  { label: "@calypso.eventos.uy", href: "https://www.instagram.com/calypso.eventos.uy/", external: true },
  { label: "El Pinar, Ciudad de la Costa, Canelones, Uruguay", href: "/#location", external: false },
];

export default function Footer() {
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-night pt-24 font-texto text-paper lg:pt-32">
      <Garland lit spans={3} className="pointer-events-none absolute inset-x-0 top-0 sm:hidden" />
      <Garland lit spans={8} className="pointer-events-none absolute inset-x-0 top-0 hidden sm:block" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid gap-8 border-b border-night-line pb-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="font-titular text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.015em]">
            ¿Festejamos en{" "}
            <span className="whitespace-nowrap text-calypso">El Pinar</span>?
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <BudgetButton
              className="group inline-flex items-center justify-center gap-3 rounded-md bg-calypso px-7 py-4 font-semibold text-ink transition-colors hover:bg-[#25c3b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso"
            >
              Consultar presupuesto
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </BudgetButton>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="self-start font-semibold underline decoration-paper/40 decoration-1 underline-offset-[6px] transition-colors hover:decoration-calypso sm:self-auto"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-[1.3fr_0.7fr_1fr]">
          <div>
            <a href="/" aria-label="Calypso Eventos, ir al inicio" className="inline-flex">
              <img src={logo} alt="Calypso Eventos" className="h-16 w-auto invert" />
            </a>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/65">
              Calypso Eventos es un salón de eventos ubicado en El Pinar, Ciudad
              de la Costa, Canelones, Uruguay. Brindamos un espacio para
              cumpleaños, reuniones, celebraciones familiares y eventos sociales
              en un entorno cálido y natural.
            </p>
          </div>

          <nav aria-label="Pie de página">
            <h2 className="text-sm font-semibold text-paper/50">Navegación</h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[15px] text-paper/80 underline-offset-[6px] transition-colors hover:text-paper hover:underline hover:decoration-calypso"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-paper/50">Contacto</h2>
            <ul className="mt-5 space-y-3">
              {contactLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-[15px] text-paper/80 underline-offset-[6px] transition-colors hover:text-paper hover:underline hover:decoration-calypso"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-night-line py-7 text-sm text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Calypso Eventos. Todos los derechos reservados.</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="/terminos" className="transition-colors hover:text-paper">
              Términos y condiciones
            </a>
            <a href="/privacidad" className="transition-colors hover:text-paper">
              Política de privacidad
            </a>
            <p>
              Sitio por{" "}
              <a
                href="https://gweb.pages.dev/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-paper/75 transition-colors hover:text-paper"
              >
                GWeb
              </a>
            </p>
            <button
              type="button"
              onClick={scrollTop}
              className="inline-flex items-center gap-2 font-semibold text-paper/75 transition-colors hover:text-paper"
            >
              <ArrowUp size={15} aria-hidden="true" />
              Volver arriba
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
