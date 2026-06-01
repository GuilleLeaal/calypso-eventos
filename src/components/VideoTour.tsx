import { motion, circOut } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Film,
  MessageCircle,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const VIDEO_SRC = "/videos/calypso-recorrido-comprimido.mp4";
const VIDEO_POSTER = "/videos/recorrido-poster.jpg";

const WHATSAPP_MESSAGE = encodeURIComponent(
  "¡Hola! Vi el recorrido del salón y me gustaría consultar disponibilidad para un evento en Calypso.",
);

export default function VideoTour() {
  return (
    <section
      id="recorrido"
      className="relative overflow-hidden bg-[#f6f0e7] py-24"
    >
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/10 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
        <div className="absolute left-0 top-0 h-72 w-72 opacity-[0.07] [background-image:radial-gradient(#0BB3A6_1.2px,transparent_1.2px)] [background-size:15px_15px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0BB3A6]/35 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087d75] shadow-[0_10px_28px_rgba(63,42,28,0.05)]">
              <Film size={15} />
              Recorrido por el salón
            </div>

            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-[#2f241e] md:text-6xl">
              Conocé Calypso por{" "}
              <span className="relative inline-block text-[#0BB3A6]">
                dentro
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
              </span>
              .
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06, ease: circOut }}
            className="max-w-xl text-base leading-relaxed text-[#4a382e] md:text-lg lg:justify-self-end"
          >
            Un recorrido visual por los espacios principales del salón para que
            puedas imaginar mejor tu evento antes de coordinar una visita.
          </motion.p>
        </div>

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: circOut }}
          className="mt-12 overflow-hidden rounded-[2rem] border border-[#d8bd90] bg-[#17110d] shadow-[0_28px_80px_rgba(90,64,50,0.18)]"
        >
          <div className="relative overflow-hidden bg-[#17110d] px-5 py-4">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-[#0BB3A6]/18 blur-3xl" />
              <div className="absolute left-[-80px] bottom-[-120px] h-56 w-56 rounded-full bg-[#e8c17f]/12 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/14 text-[#7ff3e9] ring-1 ring-[#0BB3A6]/30 sm:h-14 sm:w-14">
                  <PlayCircle size={27} />
                </div>

                <div>
                  <h3 className="font-display text-xl text-white">
                    Video recorrido
                  </h3>
                  <p className="mt-1 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-[#f8efe2] ring-1 ring-white/10 backdrop-blur-sm">
                    Espacios reales de Calypso Eventos
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f8efe2] backdrop-blur">
                <Sparkles size={14} className="text-[#e8c17f]" />
                Salón real
              </div>
            </div>
          </div>

          <div className="relative bg-black">
            <video
              className="aspect-video w-full bg-black object-cover"
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              controls
              preload="metadata"
              playsInline
            >
              Tu navegador no puede reproducir este video.
            </video>
          </div>

          <div className="grid gap-5 border-t border-white/10 bg-[#17110d] p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#0BB3A6]/25 bg-[#0BB3A6]/10 text-[#7ff3e9]">
                <MessageCircle size={24} />
              </div>

              <div>
                <h3 className="font-display text-xl text-white">
                  ¿Querés venir a conocerlo?
                </h3>
                <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-[#f8efe2]">
                  Después de ver el recorrido, podés consultar disponibilidad o
                  coordinar una visita para conocer el salón en persona.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link
                to="/reservar"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.09em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
              >
                <CalendarDays size={18} />
                Reservar fecha
                <ArrowUpRight
                  size={17}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <a
                href={`https://wa.me/59899372068?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/16 bg-white/8 px-6 py-4 text-sm font-bold uppercase tracking-[0.09em] text-white transition hover:-translate-y-0.5 hover:bg-white/12"
              >
                <MessageCircle size={18} className="text-[#7ff3e9]" />
                Consultar
              </a>
            </div>
          </div>
        </motion.div>

        {/* Cierre */}
        <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-5 text-[#c49a5b]">
          <div className="h-px flex-1 bg-[#c49a5b]/55" />
          <span className="font-display text-3xl">✦</span>
          <div className="h-px flex-1 bg-[#c49a5b]/55" />
        </div>
      </div>
    </section>
  );
}
