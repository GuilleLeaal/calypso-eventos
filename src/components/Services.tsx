import { motion, circOut } from "framer-motion";
import {
  PartyPopper,
  Users,
  Building2,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  Check,
} from "lucide-react";

const services = [
  {
    icon: PartyPopper,
    title: "Cumpleaños",
    desc: "Celebraciones personalizadas para todas las edades con un armado flexible y cómodo.",
    points: ["Ambientación adaptable", "Ideal para grupos"],
    tag: "Más pedido",
  },
  {
    icon: Users,
    title: "Reuniones",
    desc: "Espacio ideal para encuentros familiares o sociales con excelente distribución.",
    points: ["Layout cómodo", "Clima íntimo"],
    tag: "Social",
  },
  {
    icon: Building2,
    title: "Eventos corporativos",
    desc: "Ambiente profesional para capacitaciones, presentaciones y reuniones empresariales.",
    points: ["Presentaciones", "Networking"],
    tag: "Empresas",
  },
  {
    icon: CalendarDays,
    title: "Eventos especiales",
    desc: "Bautismos, aniversarios y celebraciones privadas con organización adaptable.",
    points: ["Momentos únicos", "A medida"],
    tag: "Premium",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24">
      {/* Background: subtle cinematic */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.55] [background-image:radial-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        {/* calypso glow */}
        <div className="absolute left-1/2 top-[-120px] h-[260px] w-[680px] -translate-x-1/2 rounded-full bg-calypso/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs tracking-[0.22em] uppercase text-black/60 backdrop-blur">
            <Sparkles size={14} className="text-calypso" />
            Qué hacemos
          </div>

          <h2 className="mt-4 font-display text-4xl tracking-tight">
            Servicios<span className="text-calypso">.</span>
          </h2>

          <p className="mt-4 text-black/70">
            Adaptamos el espacio según el tipo de evento para ofrecer comodidad,
            estética y funcionalidad en cada ocasión.
          </p>

          <div className="mt-6 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-black/15 to-transparent" />
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: circOut }}
                className="group relative"
              >
                {/* gradient border wrapper */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-black/10 via-black/5 to-black/10 opacity-60 transition group-hover:opacity-100" />
                <div className="absolute inset-[1px] rounded-3xl bg-white/75 backdrop-blur-md transition group-hover:bg-white" />

                {/* glow on hover */}
                <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-calypso/10 opacity-0 blur-2xl transition group-hover:opacity-100" />

                <div className="relative rounded-3xl p-6">
                  {/* tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-calypso/10 text-calypso ring-1 ring-calypso/10 transition group-hover:ring-calypso/25">
                      <Icon size={20} />
                    </div>

                    <span className="select-none rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-black/60">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-black/70 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* points */}
                  <div className="mt-5 grid gap-2">
                    {item.points.map((p) => (
                      <div
                        key={p}
                        className="flex items-center gap-2 text-sm text-black/70"
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-black/5 text-calypso">
                          <Check size={14} />
                        </span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 h-px w-12 bg-black/10 transition group-hover:w-20 group-hover:bg-calypso/70" />

                  {/* micro CTA */}
                  <a
                    href="#contact"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-black/70 transition group-hover:text-black"
                  >
                    Consultar <ArrowUpRight size={16} className="text-calypso" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
