// src/components/Footer.tsx
import { useState } from "react";
import { motion, circOut } from "framer-motion";
import {
  Instagram,
  Phone,
  MapPin,
  ArrowUpRight,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import logo from "../assets/Logo2.png";
import LegalModal from "./LegalModal";
import TerminosContent from "./legal/TerminosContent";
import PrivacidadContent from "./legal/PrivacidadContent";

const year = new Date().getFullYear();

const whatsappMessage = encodeURIComponent(
  "¡Hola! Me gustaría consultar disponibilidad para un evento en Calypso."
);

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: circOut },
  },
};

const navLinks = [
  { label: "Servicios", href: "/#services" },
  { label: "Sectores", href: "/#sectors" },
  { label: "Nuestra historia", href: "/nuestra-historia" },
  { label: "Contacto", href: "/#contact" },
  { label: "Ubicación", href: "/#location" },
];

export default function Footer() {
  const [legalOpen, setLegalOpen] = useState<"terminos" | "privacidad" | null>(
    null
  );

  const scrollTop = () => {
    const topElement = document.getElementById("top");

    if (topElement) {
      topElement.scrollIntoView({ behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden bg-[#17110d] text-[#f8efe2]">
      {/* Línea superior */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-calypso/70 to-transparent" />

      {/* Decoración sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-72 w-72 rounded-full bg-calypso/12 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[-140px] h-72 w-72 rounded-full bg-[#e8c17f]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]"
        >
          {/* Marca */}
          <div>
            <a href="/" aria-label="Ir al inicio" className="inline-flex">
              <img
                src={logo}
                alt="Calypso Eventos"
                className="h-10 w-auto max-w-[210px] object-contain brightness-0 invert"
              />
            </a>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#f8efe2]/72">
              Salón de eventos en El Pinar para cumpleaños, reuniones y
              celebraciones familiares en un entorno cálido y natural.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/59899372068?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-calypso px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_14px_32px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <button
                onClick={scrollTop}
                className="inline-flex items-center gap-2 rounded-full border border-[#f8efe2]/18 px-5 py-3 text-sm font-semibold text-[#f8efe2]/82 transition hover:border-[#e8c17f]/55 hover:text-white"
              >
                <ChevronUp className="h-4 w-4 text-[#e8c17f]" />
                Arriba
              </button>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c17f]">
              Navegación
            </p>

            <ul className="mt-5 space-y-3">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm text-[#f8efe2]/66 transition hover:text-white"
                  >
                    <span className="h-px w-4 bg-calypso/80 transition group-hover:w-6" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c17f]">
              Contacto
            </p>

            <div className="mt-5 space-y-4 text-sm">
              <a
                href="tel:+59899372068"
                className="group flex items-center gap-3 text-[#f8efe2]/70 transition hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#7ff3e9]" />
                <span>+598 99 372 068</span>
              </a>

              <a
                href="https://www.instagram.com/calypso.eventos.uy/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-[#f8efe2]/70 transition hover:text-white"
              >
                <Instagram className="h-4 w-4 shrink-0 text-[#7ff3e9]" />
                <span>Instagram</span>
                <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>

              <a
                href="/#location"
                className="group flex items-center gap-3 text-[#f8efe2]/70 transition hover:text-white"
              >
                <MapPin className="h-4 w-4 shrink-0 text-[#e8c17f]" />
                <span>El Pinar, Canelones</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[#f8efe2]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#f8efe2]/45">
            © {year} Calypso Eventos. Todos los derechos reservados.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <button
              onClick={() => setLegalOpen("terminos")}
              className="text-[#f8efe2]/45 transition hover:text-white"
            >
              Términos
            </button>

            <button
              onClick={() => setLegalOpen("privacidad")}
              className="text-[#f8efe2]/45 transition hover:text-white"
            >
              Privacidad
            </button>

            <span className="hidden text-[#f8efe2]/20 sm:inline">•</span>

            <p className="text-[#f8efe2]/45">
              Sitio por{" "}
              <a
                href="https://gweb.com.uy"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#f8efe2]/70 transition hover:text-[#7ff3e9]"
              >
                GWeb
              </a>
            </p>
          </div>
        </div>
      </div>

      <LegalModal
        open={legalOpen === "terminos"}
        title="Términos y Condiciones"
        onClose={() => setLegalOpen(null)}
      >
        <TerminosContent />
      </LegalModal>

      <LegalModal
        open={legalOpen === "privacidad"}
        title="Política de Privacidad"
        onClose={() => setLegalOpen(null)}
      >
        <PrivacidadContent />
      </LegalModal>
    </footer>
  );
}