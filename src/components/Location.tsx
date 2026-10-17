import { ArrowUpRight } from "lucide-react";

const MAPS_LINK = "https://maps.app.goo.gl/LQvqDuprPY4o4TDM8";
const PLACE_NAME = "Calypso Eventos";
const ADDRESS = "6337+3H5, 15800 Ciudad de la Costa, Departamento de Canelones";
const REFERENCE = "Supermercado XXI";

const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  `${PLACE_NAME}, ${ADDRESS}`,
)}&output=embed`;

const WHATSAPP_LINK = `https://wa.me/59899372068?text=${encodeURIComponent(
  "Hola! Necesito indicaciones para llegar a Calypso Eventos.",
)}`;

export default function Location() {
  return (
    <section
      id="location"
      aria-labelledby="ubicacion-titulo"
      className="border-t border-ink/10 bg-paper py-20 font-texto text-ink lg:py-24"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:px-14 xl:px-20">
        <div>
          <p className="text-[15px] font-semibold text-ink-mute">Ubicación</p>
          <h2
            id="ubicacion-titulo"
            className="mt-4 font-titular text-[clamp(2.4rem,4.6vw,3.8rem)] font-normal leading-[1] tracking-[-0.01em]"
          >
            Cómo llegar.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Estamos en El Pinar, Ciudad de la Costa, al lado del {REFERENCE}.
          </p>
          <p className="mt-2 text-sm text-ink-mute">Plus Code: 6337+3H5, 15800</p>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-md bg-calypso px-7 py-4 font-semibold text-ink transition-colors hover:bg-[#25c3b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700"
            >
              Abrir en Google Maps
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="self-start whitespace-nowrap font-semibold underline decoration-ink/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-calypso sm:self-auto"
            >
              Pedir indicaciones por WhatsApp
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border border-ink/15 bg-paper-deep">
          <iframe
            title={`Mapa de ${PLACE_NAME} en El Pinar`}
            src={MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[320px] w-full sm:h-[380px] lg:h-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
