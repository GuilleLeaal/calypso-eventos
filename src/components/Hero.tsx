import { motion } from "framer-motion";
import heroImg from "../assets/hero.jpeg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[100svh]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Calypso Eventos - Salón"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_20%,rgba(0,0,0,0.15),rgba(0,0,0,0.75))]" />
        {/* Calypso accent glow */}
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-calypso/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-calypso" />
            <span className="text-xs tracking-[0.22em] text-white/80 uppercase">
              Salón para eventos
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
            className="mt-6 font-display text-5xl leading-[1.02] text-white md:text-6xl"
          >
            Un espacio elegante para celebrar{" "}
            <span className="text-calypso">momentos</span> inolvidables
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 text-base leading-relaxed text-white/80 md:text-lg"
          >
            Cumpleaños, reuniones, eventos corporativos y celebraciones.
            Consultá disponibilidad y armamos el evento a tu medida.
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
              href="#contact"
              className="inline-flex items-center justify-center rounded-2xl bg-calypso px-6 py-3 text-sm font-medium text-black hover:brightness-95 transition"
            >
              Reservar fecha
            </a>

            <a
              href="#sectors"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/15 transition"
            >
              Ver sectores
            </a>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-10 grid max-w-xl grid-cols-3 gap-3"
          >
            {[
              { k: "Capacidad", v: "+30 adulos +50 niños " },
              { k: "Ubicación", v: "El pinar" },
              { k: "Atención", v: "Rápida" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md"
              >
                <div className="text-[11px] tracking-[0.22em] uppercase text-white/60">
                  {x.k}
                </div>
                <div className="mt-1 text-sm text-white">{x.v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex items-center gap-3 text-white/60">
          <div className="h-px w-10 bg-white/20" />
          <span className="text-xs tracking-[0.22em] uppercase">
            Deslizá para ver más
          </span>
        </div>
      </div>
    </section>
  );
}
