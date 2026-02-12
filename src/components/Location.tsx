import { motion, circOut } from "framer-motion";
import { MapPin, Navigation, Store, ShieldCheck } from "lucide-react";

const MAPS_LINK = "https://maps.app.goo.gl/LQvqDuprPY4o4TDM8";

// Datos reales
const PLACE_NAME = "Calypso Eventos";
const ADDRESS = "6337+3H5, 15800 Ciudad de la Costa, Departamento de Canelones";
const REFERENCE = "Supermercado XXI";

// Embed por query (sin API key) apuntando a nombre + dirección
const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  `${PLACE_NAME}, ${ADDRESS}`
)}&output=embed`;

export default function Location() {
  return (
    <section id="location" className="relative py-24 bg-white overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        {/* ✅ glow seguro (responsive) */}
        <div className="absolute left-1/2 top-[-120px] h-[260px] w-[520px] sm:w-[680px] -translate-x-1/2 rounded-full bg-calypso/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="text-xs tracking-[0.22em] uppercase text-black/50">
            Dónde estamos
          </div>

          <h2 className="mt-2 font-display text-4xl tracking-tight">
            Ubicación<span className="text-calypso">.</span>
          </h2>

          <p className="mt-4 text-black/70">
            Estamos en <b>Canelones, El Pinar</b> (Ciudad de la Costa). Referencia:
            <b> {REFERENCE}</b> justo al lado.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90 transition"
            >
              Cómo llegar <Navigation size={16} className="ml-2 text-calypso" />
            </a>

            {/* ✅ chip dirección que no rompe mobile */}
            <div className="flex max-w-full items-start gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm text-black/70">
              <MapPin size={16} className="mt-0.5 shrink-0 text-calypso" />
              <span className="min-w-0 break-words">{ADDRESS}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
            className="lg:col-span-8 rounded-3xl border border-black/10 bg-white overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.10)]"
          >
            <div className="relative">
              <iframe
                title={`Mapa - ${PLACE_NAME}`}
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[360px] w-full"
              />

              {/* top overlay bar */}
              <div className="absolute left-4 top-4 right-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/85 px-4 py-3 backdrop-blur">
                  {/* ✅ min-w-0 + truncate para que no empuje ancho */}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black truncate">
                      {PLACE_NAME}
                    </div>
                    <div className="text-xs text-black/60 truncate">
                      {ADDRESS} • referencia: {REFERENCE}
                    </div>
                  </div>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/90 transition"
                  >
                    Abrir Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-7">
              <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                Tip
              </div>
              <p className="mt-2 text-sm text-black/70">
                Si venís en auto, no te preocupes: contamos con estacionamiento.
              </p>
            </div>
          </motion.div>

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06, ease: circOut }}
            className="lg:col-span-4 grid gap-4"
          >
            <InfoCard
              icon={Store}
              title="Referencia rápida"
              desc={`Ubicación fácil: al lado de ${REFERENCE}.`}
            />
            <InfoCard
              icon={ShieldCheck}
              title="Llegada simple"
              desc="Zona accesible en Ciudad de la Costa. Te pasamos indicaciones si lo necesitás."
            />

            {/* ✅ Dirección en card con wrap */}
            <div className="rounded-3xl border border-black/10 bg-zinc-50 p-6">
              <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                Dirección
              </div>
              <p className="mt-2 text-sm text-black/70 break-words">
                {ADDRESS}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-calypso/10 text-calypso">
        <Icon size={20} />
      </div>
      <div className="mt-4 font-display text-xl tracking-tight">{title}</div>
      <p className="mt-2 text-sm text-black/70 leading-relaxed">{desc}</p>
      <div className="mt-5 h-px w-12 bg-black/10" />
    </div>
  );
}
