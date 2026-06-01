import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import heroImg from "../assets/FotoPinar.jpg";

const stats = [
  { k: "Capacidad", v: "+50 adultos +30 niños" },
  { k: "Ubicación", v: "El Pinar, Canelones" },
  { k: "Contacto", v: "WhatsApp directo" },
];

export default function Hero() {
  const whatsappMessage = encodeURIComponent(
    "¡Hola! Me gustaría coordinar fecha y hora para ir a conocer el salón."
  );

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#140f0b]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Calypso Eventos en El Pinar"
          className="h-full w-full object-cover object-center"
        />

        {/* Oscurecido base */}
        <div className="absolute inset-0 bg-[#160f0a]/32" />

        {/* Lectura de texto */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,15,11,0.95)_0%,rgba(20,15,11,0.83)_34%,rgba(20,15,11,0.52)_60%,rgba(20,15,11,0.18)_100%)]" />

        {/* Firma Calypso más presente */}
        <div className="absolute inset-0 bg-[radial-gradient(760px_520px_at_18%_30%,rgba(11,179,166,0.31),transparent_48%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(620px_420px_at_76%_34%,rgba(11,179,166,0.20),transparent_52%)]" />

        {/* Calidez dorada editorial */}
        <div className="absolute inset-0 bg-[radial-gradient(840px_520px_at_82%_42%,rgba(232,193,127,0.18),transparent_50%)]" />

        {/* Viñeta */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(20,15,11,0.62)_100%)]" />

        {/* Fade inferior más suave hacia Services */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f6f0e7]/78 via-[#f6f0e7]/20 to-transparent" />

        {/* Corte cálido muy sutil para que no quede blanco plano */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(246,240,231,0.54))]" />

        {/* Textura sutil */}
        <div className="absolute left-0 top-0 h-full w-72 opacity-[0.09] [background-image:radial-gradient(#0bb3a6_1.15px,transparent_1.15px)] [background-size:15px_15px]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-24 pt-36 md:px-6 md:pb-28 md:pt-40">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-calypso/45 bg-calypso/12 px-4 py-2 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-md"
            >
              <Sparkles size={14} className="text-[#7ff3e9]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                Salón de eventos en El Pinar
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 font-display text-4xl leading-[1.02] tracking-[-0.03em] text-white drop-shadow-[0_14px_32px_rgba(0,0,0,0.42)] sm:text-5xl md:text-6xl"
            >
              Un lugar con historia para celebrar en{" "}
              <span className="relative inline-block text-[#7ff3e9]">
                El Pinar
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-calypso via-[#e8c17f] to-transparent" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/90 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] md:text-lg"
            >
              Un entorno cálido, natural y familiar para cumpleaños, reuniones y
              eventos especiales. Espacios interiores y exteriores pensados para
              disfrutar con comodidad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <a
                href={`https://wa.me/59899372068?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-calypso px-6 py-3.5 text-sm font-bold uppercase tracking-[0.09em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.30)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#099f94]"
              >
                <CalendarCheck size={17} className="text-white" />
                Solicitar visita
                <ArrowUpRight
                  size={16}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <a
                href="#services"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#e8c17f]/40 bg-[#fff9f0]/10 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.09em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-calypso/60 hover:bg-calypso/14"
              >
                Ver servicios
                <ArrowDown
                  size={16}
                  className="text-[#7ff3e9] transition group-hover:translate-y-0.5"
                />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-white sm:grid-cols-3"
            >
              {stats.map((item) => (
                <div
                  key={item.k}
                  className="border-l border-calypso/60 bg-gradient-to-r from-calypso/16 to-transparent px-4 py-3 backdrop-blur-[2px]"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7ff3e9]">
                    {item.k}
                  </div>
                  <div className="mt-1 text-sm font-medium text-white/92">
                    {item.v}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right editorial card */}
          <motion.div
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="hidden justify-end lg:flex"
          >
            <div className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-calypso/35 bg-[#fff9f0]/12 p-5 text-white shadow-[0_28px_70px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_220px_at_100%_0%,rgba(11,179,166,0.24),transparent_70%)]" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-calypso/70 to-transparent" />

              <div className="relative">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-calypso/45 bg-calypso/16">
                  <MapPin size={19} className="text-[#7ff3e9]" />
                </div>

                <p className="font-display text-2xl leading-tight text-white">
                  Naturaleza, comodidad y una ubicación ideal.
                </p>

                <p className="mt-4 text-sm leading-relaxed text-white/78">
                  Calypso combina el encanto de El Pinar con espacios preparados
                  para encuentros familiares, celebraciones infantiles y eventos
                  cuidados de principio a fin.
                </p>

                <div className="mt-6 h-px bg-gradient-to-r from-calypso/80 via-[#e8c17f]/45 to-transparent" />

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7ff3e9]">
                      Zona
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      Ciudad de la Costa
                    </div>
                  </div>

                  <a
                    href="#location"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-calypso text-white shadow-[0_12px_28px_rgba(11,179,166,0.24)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
                    aria-label="Ver ubicación"
                  >
                    <ArrowDown size={17} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.a
          href="#services"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.38 }}
          className="absolute bottom-7 left-4 hidden items-center gap-3 rounded-full border border-calypso/35 bg-[#140f0b]/38 px-4 py-2 text-white shadow-[0_12px_30px_rgba(0,0,0,0.20)] backdrop-blur-md transition hover:border-calypso/65 hover:bg-[#140f0b]/48 md:left-6 lg:flex"
        >
          <div className="h-px w-10 bg-calypso" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88">
            Deslizá para ver más
          </span>
          <ArrowDown size={15} className="text-[#7ff3e9]" />
        </motion.a>
      </div>
    </section>
  );
}