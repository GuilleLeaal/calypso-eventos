import { motion, circOut } from "framer-motion";
import { CalendarDays, Sparkles } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.10)]"
          >
            {/* Top banner (clean + legible) */}
            <div className="relative px-7 py-6 sm:px-10 sm:py-8">
              {/* base clara calypso */}
              <div className="absolute inset-0 bg-calypso/12" />
              {/* glow suave (no invade el texto) */}
              <div className="absolute inset-0 bg-[radial-gradient(700px_260px_at_70%_20%,rgba(11,179,166,0.18),transparent_60%)]" />
              {/* borde inferior para separar */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] tracking-[0.22em] uppercase text-black/55">
                    Información
                  </div>

                  <h2 className="mt-2 font-display text-4xl tracking-tight text-black">
                    Apertura<span className="text-calypso">.</span>
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/70">
                    Estamos ultimando detalles. Próximamente habilitaremos
                    reservas y canales de contacto.
                  </p>
                </div>

                <div className="hidden sm:flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 backdrop-blur">
                  <Sparkles size={14} className="text-calypso" />
                  <span className="text-xs font-medium text-black/70">
                    Próximamente
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-7 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 rounded-2xl border border-black/10 bg-zinc-50 p-5">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-calypso/10 text-calypso">
                    <CalendarDays size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                      Fecha de apertura
                    </div>
                    <div className="mt-1 font-display text-2xl tracking-tight text-black">
                      1° de abril<span className="text-calypso">.</span>
                    </div>
                    <p className="mt-2 text-sm text-black/70 leading-relaxed">
                      Hasta esa fecha, el salón permanece cerrado al público.
                      Gracias por tu interés.
                    </p>
                  </div>
                </div>

                {/* Note */}
                <div className="rounded-2xl border border-black/10 bg-white p-5">
                  <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                    Nota
                  </div>
                  <p className="mt-2 text-sm text-black/70 leading-relaxed">
                    Te invitamos a volver a visitar esta página luego de la
                    apertura para ver fotos actualizadas, disponibilidad y vías
                    de contacto.
                  </p>

                  <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-black/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-calypso" />
                      Apertura 1° de abril
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-black/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-black/40" />
                      Reservas próximamente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="bg-zinc-50 px-7 py-6 sm:px-10">
              <div className="text-xs text-black/50">
                Calypso Eventos — Apertura oficial: <b>1° de abril</b>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
