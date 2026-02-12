// src/components/Footer.tsx
import { motion, circOut } from "framer-motion";
import {
  Instagram,
  Phone,
  MapPin,
  ArrowUpRight,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import LegalModal from "./LegalModal";
import TerminosContent from "./legal/TerminosContent";
import PrivacidadContent from "./legal/PrivacidadContent";

const fadeUp1 = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.0, ease: circOut },
  },
};

const fadeUp2 = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.06, ease: circOut },
  },
};

const fadeUp3 = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.12, ease: circOut },
  },
};

const year = new Date().getFullYear();

export default function Footer() {
  const scrollTop = () => {
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  };
  const [legalOpen, setLegalOpen] = useState<"terminos" | "privacidad" | null>(
    null,
  );

  return (
    <footer className="relative mt-24">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#11c5b7]/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-16 w-[70%] rounded-full bg-[#11c5b7]/10 blur-2xl" />

      <div className="relative bg-[#07090d]">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <motion.div
              className="md:col-span-5"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp1}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#11c5b7] to-[#0ea5e9] p-[1px]">
                  <div className="grid h-full w-full place-items-center rounded-2xl bg-[#0b0f16]">
                    <span className="text-sm font-semibold text-white">C</span>
                  </div>
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    Calypso Eventos
                  </p>
                  <p className="text-xs text-white/50">
                    Salón • Eventos • Experiencias
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
                Un espacio pensado para vivir momentos únicos: cumpleaños,
                casamientos, corporativos y celebraciones a medida.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:border-[#11c5b7]/40 hover:bg-white/10"
                >
                  <Instagram className="h-4 w-4 text-[#11c5b7]" />
                  Instagram
                  <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
                </a>

                <button
                  onClick={scrollTop}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
                >
                  <ChevronUp className="h-4 w-4" />
                  Volver arriba
                </button>
              </div>
            </motion.div>

            <motion.div
              className="md:col-span-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp2}
            >
              <p className="text-sm font-semibold text-white">Secciones</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="#services"
                    className="text-white/65 transition hover:text-white"
                  >
                    Servicios
                  </a>
                </li>
                <li>
                  <a
                    href="#sectors"
                    className="text-white/65 transition hover:text-white"
                  >
                    Sectores
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-white/65 transition hover:text-white"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="md:col-span-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp3}
            >
              <p className="text-sm font-semibold text-white">Contacto</p>

              <div className="mt-4 space-y-3 text-sm">
                <a
                  href="tel:+59899372068"
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 transition hover:border-white/20 hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 text-[#11c5b7]" />
                  <span>+598 99 372 068</span>
                  <ArrowUpRight className="ml-auto h-4 w-4 opacity-60 transition group-hover:opacity-100" />
                </a>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                  <MapPin className="h-4 w-4 text-[#11c5b7]" />
                  <span>El Pinar, Canelones, Uruguay</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="#contact"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#11c5b7] to-[#0ea5e9] px-5 py-3 text-sm font-semibold text-[#061016] shadow-lg shadow-[#11c5b7]/10 transition hover:shadow-[#11c5b7]/20"
                >
                  Consultar disponibilidad
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <p className="mt-2 text-xs text-white/45">
                  Respondemos rápido por Instagram o WhatsApp.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/45">
              © {year} Calypso Eventos. Todos los derechos reservados.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <button
                onClick={() => setLegalOpen("terminos")}
                className="text-white/45 transition hover:text-white"
              >
                Términos
              </button>

              <button
                onClick={() => setLegalOpen("privacidad")}
                className="text-white/45 transition hover:text-white"
              >
                Privacidad
              </button>
              <span className="hidden sm:inline text-white/25">•</span>
              <p className="text-white/45">
                Sitio por{" "}
                <a
                  href="https://www.instagram.com/calypso.eventos.uy/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 transition hover:text-white"
                >
                  GWeb
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-24 w-[80%] rounded-full bg-[#11c5b7]/10 blur-3xl" />
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
