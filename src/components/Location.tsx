import { motion, circOut } from "framer-motion";
import {
  MapPin,
  Navigation,
  Store,
  ShieldCheck,
  Car,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

const MAPS_LINK = "https://maps.app.goo.gl/LQvqDuprPY4o4TDM8";
const PLACE_NAME = "Calypso Eventos";
const ADDRESS = "6337+3H5, 15800 Ciudad de la Costa, Departamento de Canelones";
const REFERENCE = "Supermercado XXI";

const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  `${PLACE_NAME}, ${ADDRESS}`,
)}&output=embed`;

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola! Necesito indicaciones para llegar a Calypso Eventos.",
);

const WHATSAPP_LINK = `https://wa.me/59899372068?text=${WHATSAPP_MESSAGE}`;

export default function Location() {
  return (
    <section
      id="location"
      className="relative overflow-hidden bg-[#f6f0e7] py-24"
    >
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/10 blur-3xl" />
        <div className="absolute right-[-130px] top-16 h-80 w-80 rounded-full bg-[#e8c17f]/13 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[420px] w-[240px] bg-[radial-gradient(ellipse_at_left,rgba(196,154,91,0.13),transparent_65%)]" />
        <div className="absolute left-0 top-0 h-72 w-72 opacity-[0.09] [background-image:radial-gradient(#0BB3A6_1.25px,transparent_1.25px)] [background-size:15px_15px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0BB3A6]/35 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087d75] shadow-[0_10px_28px_rgba(63,42,28,0.05)]">
              <MapPin size={15} />
              Dónde estamos
            </div>

            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[0.98] tracking-tight text-[#2f241e] md:text-6xl">
              Una ubicación simple de encontrar en{" "}
              <span className="relative inline-block text-[#0BB3A6]">
                El Pinar
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
              </span>
              <span className="text-[#b88945]">.</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#4a382e] md:text-lg">
              Estamos en Ciudad de la Costa, con una referencia clara para
              llegar: <b>{REFERENCE}</b>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06, ease: circOut }}
            className="rounded-[1.6rem] border border-[#dfc8ab] bg-[#fff9f0]/74 p-5 shadow-[0_18px_50px_rgba(90,64,50,0.08)] backdrop-blur"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <MiniInfo icon={Store} label="Referencia" value={REFERENCE} />
              <MiniInfo icon={MapPin} label="Dirección" value={ADDRESS} />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="mt-12 grid gap-7 lg:grid-cols-[1.55fr_0.95fr]">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
            className="overflow-hidden rounded-[1.8rem] border border-[#d8bd90] bg-[#fff9f0] shadow-[0_22px_60px_rgba(90,64,50,0.13)]"
          >
            <div className="relative overflow-hidden bg-[#17110d] px-5 py-4">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-[#0BB3A6]/18 blur-3xl" />
                <div className="absolute left-[-80px] bottom-[-120px] h-56 w-56 rounded-full bg-[#e8c17f]/12 blur-3xl" />
              </div>

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/14 text-[#7ff3e9] ring-1 ring-[#0BB3A6]/30 sm:h-14 sm:w-14">
                    <MapPin size={25} />
                  </div>

                  <div className="min-w-0">
                    <div className="font-display text-xl text-white">
                      {PLACE_NAME}
                    </div>
                    <div className="mt-1 inline-flex rounded-full bg-[#fff9f0]/10 px-3 py-1 text-sm font-medium text-[#f8efe2] ring-1 ring-white/10 backdrop-blur-sm">
                      Ciudad de la Costa, El Pinar
                    </div>
                  </div>
                </div>

                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden shrink-0 items-center gap-2 rounded-full bg-[#0BB3A6] px-5 py-3 text-xs font-bold uppercase tracking-[0.09em] text-white shadow-[0_14px_30px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94] sm:inline-flex"
                >
                  <ArrowUpRight size={16} />
                  Abrir Maps
                </a>
              </div>
            </div>

            <iframe
              title={`Mapa - ${PLACE_NAME}`}
              src={MAPS_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[300px] w-full md:h-[360px]"
            />

            <div className="grid gap-5 border-t border-[#e0c79d] bg-[#fff4e6]/82 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#0BB3A6]/25 bg-[#0BB3A6]/10 text-[#087d75]">
                  <Car size={27} />
                </div>

                <div>
                  <h3 className="font-display text-xl text-[#2f241e]">
                    Llegada cómoda
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#5c473b]">
                    Zona accesible, referencia clara y espacio pensado para que
                    la llegada al evento sea simple.
                  </p>
                </div>
              </div>

              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#4a2b17] px-7 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5 hover:bg-[#351f12]"
              >
                <Navigation size={18} className="text-[#e8c17f]" />
                Cómo llegar
              </a>
            </div>
          </motion.div>

          {/* Side */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06, ease: circOut }}
            className="grid gap-4"
          >
            <SideCard
              icon={MapPin}
              title="Referencia clara"
              desc={
                <>
                  Al lado de <b>Supermercado XXI</b>.
                </>
              }
            />

            <SideCard
              icon={Car}
              title="Acceso simple"
              desc={
                <>
                  Fácil llegada dentro de <b>Ciudad de la Costa</b>.
                </>
              }
            />

            <SideCard
              icon={ShieldCheck}
              title="Entorno tranquilo"
              desc={<>Ideal para disfrutar el evento con mayor comodidad.</>}
            />

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-[1.6rem] bg-[#0BB3A6] p-5 text-white shadow-[0_20px_55px_rgba(11,179,166,0.22)] transition hover:-translate-y-1 hover:bg-[#099f94]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_160px_at_100%_0%,rgba(255,255,255,0.22),transparent_65%)]" />

              <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-white/25 bg-white/12 text-white">
                  <MessageCircle size={27} />
                </div>

                <div>
                  <div className="font-display text-xl">
                    ¿Dudas para llegar?
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/86">
                    Te enviamos indicaciones por WhatsApp.
                  </p>
                </div>

                <div className="grid h-11 w-11 place-items-center rounded-full bg-white/16 text-white transition group-hover:translate-x-1">
                  <ArrowUpRight size={19} />
                </div>
              </div>
            </a>
          </motion.div>
        </div>

       
      </div>
    </section>
  );
}

function MiniInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/10 text-[#087d75]">
        <Icon size={22} />
      </div>

      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a6b2f]">
          {label}
        </div>
        <div className="mt-1 text-sm font-semibold leading-relaxed text-[#2f241e]">
          {value}
        </div>
      </div>
    </div>
  );
}

function SideCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-[1.45rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-5 shadow-[0_14px_38px_rgba(90,64,50,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#0BB3A6]/35 hover:bg-[#fff9f0]">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/10 text-[#087d75] transition group-hover:bg-[#0BB3A6] group-hover:text-white">
        <Icon size={24} />
      </div>

      <div>
        <h3 className="font-display text-xl text-[#2f241e]">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#5c473b]">{desc}</p>
      </div>
    </div>
  );
}
