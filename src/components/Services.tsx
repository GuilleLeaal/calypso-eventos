import { useState } from "react";
import { motion, AnimatePresence, circOut } from "framer-motion";
import {
  PartyPopper,
  Users,
  Building2,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  Check,
  X,
} from "lucide-react";

import cumpleImg from "../assets/servicios/cumpleanos.png";
import reunionesImg from "../assets/servicios/reuniones.png";
import corporativosImg from "../assets/servicios/corporativos.png";
import especialesImg from "../assets/servicios/especiales.png";

const services = [
  {
    icon: PartyPopper,
    title: "Cumpleaños",
    desc: "Celebraciones infantiles y familiares con espacios cómodos, juegos y asistencia para que el evento fluya sin complicaciones.",
    image: cumpleImg,
    tag: "Más pedido",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos",
      "Menú infantil",
      "1 ayudante de cocina",
      "1 mozo",
      "2 animadores",
    ],
    extras: [
      "Bebidas a consignación",
      "Menú para adultos",
      "Animador extra",
      "Mozo extra",
      "Uso del parrillero",
      "Leña",
      "Hielo",
    ],
  },
  {
    icon: Users,
    title: "Reuniones",
    desc: "Un entorno cálido para encuentros familiares o sociales, con buena distribución y opciones adaptables según la cantidad de invitados.",
    image: reunionesImg,
    tag: "Social",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos",
      "Menú infantil",
      "1 ayudante de cocina",
      "1 mozo",
      "2 animadores si hay 25 niños o más",
    ],
    extras: [
      "Bebidas a consignación",
      "Menú para adultos",
      "Animador extra",
      "Mozo extra",
      "Uso del parrillero",
      "Leña",
      "Hielo",
    ],
  },
  {
    icon: Building2,
    title: "Eventos corporativos",
    desc: "Espacio funcional para encuentros empresariales, reuniones de equipo, capacitaciones o jornadas corporativas en un ambiente diferente.",
    image: corporativosImg,
    tag: "Empresas",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos para adultos",
      "1 ayudante de cocina",
      "1 mozo",
    ],
    extras: [
      "Bebidas a consignación",
      "Menú para adultos",
      "Animador extra",
      "Mozo extra",
      "Uso del parrillero",
      "Leña",
      "Hielo",
    ],
  },
  {
    icon: CalendarDays,
    title: "Eventos especiales",
    desc: "Bautismos, aniversarios y celebraciones privadas con una propuesta flexible para adaptar el espacio al tipo de ocasión.",
    image: especialesImg,
    tag: "Premium",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos para niños y adultos",
      "Menú infantil",
      "1 ayudante de cocina",
      "1 mozo",
      "2 animadores si hay 25 niños o más",
    ],
    extras: [
      "Bebidas a consignación",
      "Menú para adultos",
      "Animador extra",
      "Mozo extra",
      "Uso del parrillero",
      "Leña",
      "Hielo",
    ],
  },
];

export default function Services() {
  const [selected, setSelected] = useState<(typeof services)[number] | null>(
    null
  );

  const whatsappVisitMessage = encodeURIComponent(
    "¡Hola! Me gustaría coordinar fecha y hora para ir a conocer el salón."
  );

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#f6f0e7] pb-24 pt-20"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(46,33,27,0.16)_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Separación suave desde reseñas, sin mancha calypso superior */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f6f0e7] via-[#f6f0e7]/86 to-transparent" />

        {/* Calidez lateral, más coherente con Services */}
        <div className="absolute left-[-140px] top-[18%] h-[300px] w-[300px] rounded-full bg-[#c9a46a]/9 blur-3xl" />
        <div className="absolute right-[-100px] top-[24%] h-[280px] w-[280px] rounded-full bg-[#c9a46a]/10 blur-3xl" />

        {/* Toque calypso más bajo y controlado */}
        <div className="absolute left-1/2 top-[46%] h-[260px] w-[620px] -translate-x-1/2 rounded-full bg-calypso/[0.055] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cdb79e]/70 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#2e211b]/70 backdrop-blur">
            <Sparkles size={14} className="text-calypso" />
            Servicios
          </div>

          <h2 className="mt-4 font-display text-4xl tracking-tight text-[#2e211b] md:text-5xl">
            Celebraciones pensadas para cada ocasión
            <span className="text-calypso">.</span>
          </h2>

          <p className="mt-4 text-[#2e211b]/72">
            Cada evento tiene necesidades distintas. Adaptamos el espacio, la
            atención y los detalles para brindar una experiencia clara, cómoda y
            memorable.
          </p>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a46a]/70 to-transparent" />
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: circOut }}
                className="group relative overflow-hidden rounded-3xl border border-[#cdb79e]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,240,231,0.98))] shadow-[0_16px_40px_rgba(90,64,50,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(90,64,50,0.16)]"
              >
                {/* subtle texture */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#2e211b_1px,transparent_1px)] [background-size:18px_18px]" />

                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2e211b]/62 via-[#2e211b]/10 to-transparent" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(201,164,106,0.08),transparent_35%)]" />

                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#2e211b]/55 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#f6f0e7] backdrop-blur">
                    {item.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="relative p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(11,179,166,0.14),rgba(11,179,166,0.08))] text-calypso ring-1 ring-[#cdb79e]/45">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-5 font-display text-xl tracking-tight text-[#2e211b]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#2e211b]/72">
                    {item.desc}
                  </p>

                  <div className="mt-5 h-px w-14 bg-gradient-to-r from-[#c9a46a] via-calypso/55 to-transparent transition-all duration-300 group-hover:w-24" />

                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2e211b]/88 transition hover:text-calypso"
                  >
                    Consultar detalles
                    <ArrowUpRight size={16} className="text-calypso" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.25, ease: circOut }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[#cdb79e]/45 bg-[#f8f3eb] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            >
              {/* texture */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:radial-gradient(#2e211b_1px,transparent_1px)] [background-size:18px_18px]" />

              {/* close */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/90 text-black shadow-md transition hover:bg-white"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

              <div className="grid md:grid-cols-[0.95fr_1.05fr]">
                {/* image side */}
                <div className="relative min-h-[320px] overflow-hidden md:min-h-full">
                  <img
                    src={selected.image}
                    alt={selected.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#2e211b]/75 via-[#2e211b]/20 to-transparent" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(201,164,106,0.10),transparent_35%)]" />

                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="rounded-full bg-calypso px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
                      {selected.tag}
                    </span>

                    <h3 className="mt-3 font-display text-3xl text-white">
                      {selected.title}
                    </h3>

                    <div className="mt-3 h-px w-20 bg-gradient-to-r from-[#c9a46a] to-transparent" />
                  </div>
                </div>

                {/* content side */}
                <div className="relative p-6 md:p-8">
                  <p className="text-sm leading-relaxed text-[#2e211b]/75">
                    {selected.desc}
                  </p>

                  <div className="mt-8 grid gap-7 md:grid-cols-2">
                    <div>
                      <h4 className="font-display text-xl text-[#2e211b]">
                        Incluye
                      </h4>

                      <div className="mt-4 grid gap-2.5">
                        {selected.included.map((item) => (
                          <div
                            key={item}
                            className="flex gap-2 text-sm text-[#2e211b]/76"
                          >
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-calypso/12 text-calypso">
                              <Check size={14} />
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display text-xl text-[#2e211b]">
                        Extras disponibles
                      </h4>

                      <div className="mt-4 grid gap-2.5">
                        {selected.extras.map((item) => (
                          <div
                            key={item}
                            className="flex gap-2 text-sm text-[#2e211b]/76"
                          >
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2e211b]/5 text-calypso">
                              <Check size={14} />
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#contact"
                      onClick={() => setSelected(null)}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#2e211b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1713]"
                    >
                      Reservar fecha
                      <span className="ml-2 text-calypso">●</span>
                    </a>

                    <a
                      href={`https://wa.me/59899372068?text=${whatsappVisitMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl border border-[#cdb79e] bg-white px-5 py-3 text-sm font-semibold text-[#2e211b] transition hover:bg-[#f4ede3]"
                    >
                      Reservar visita
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}