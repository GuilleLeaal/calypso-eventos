import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Garland } from "./home/Garland";

const YOUTUBE_ID = "7szBnd9UrbU";
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&autoplay=1`;
const THUMBNAIL_HD = `https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`;
const THUMBNAIL_FALLBACK = `https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`;

const WHATSAPP_URL = `https://wa.me/59899372068?text=${encodeURIComponent(
  "¡Hola! Vi el recorrido del salón y me gustaría consultar disponibilidad para un evento en Calypso.",
)}`;

export default function VideoTour() {
  const [playing, setPlaying] = useState(false);
  const [thumbnail, setThumbnail] = useState(THUMBNAIL_HD);

  return (
    <section
      id="recorrido"
      aria-labelledby="recorrido-titulo"
      className="relative bg-night pb-20 pt-24 font-texto text-paper lg:pb-28 lg:pt-32"
    >
      <Garland lit spans={3} className="pointer-events-none absolute inset-x-0 top-0 sm:hidden" />
      <Garland lit spans={8} className="pointer-events-none absolute inset-x-0 top-0 hidden sm:block" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[15px] font-semibold text-paper/60">
              Recorrido en video
            </p>
            <h2
              id="recorrido-titulo"
              className="mt-4 font-titular text-[clamp(2.4rem,4.6vw,3.8rem)] font-normal leading-[1] tracking-[-0.01em]"
            >
              Conocé Calypso por dentro.
            </h2>
          </div>

          <p className="max-w-md text-lg leading-relaxed text-paper/75 lg:justify-self-end">
            Un recorrido por los espacios principales para que puedas imaginar
            tu evento antes de coordinar una visita.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-sm border border-night-line bg-black">
          <div className="relative aspect-video w-full">
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={YOUTUBE_EMBED_URL}
                title="Recorrido por Calypso Eventos"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Reproducir el video del recorrido por Calypso Eventos"
                className="group absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-calypso"
              >
                <img
                  src={thumbnail}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onLoad={(event) => {
                    // YouTube devuelve una imagen gris de 120 px cuando no existe la versión HD.
                    if (event.currentTarget.naturalWidth < 200) {
                      setThumbnail(THUMBNAIL_FALLBACK);
                    }
                  }}
                  onError={() => setThumbnail(THUMBNAIL_FALLBACK)}
                  className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-95"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-calypso text-ink shadow-[0_0_60px_rgba(11,179,166,0.45)] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:h-24 sm:w-24">
                    <Play size={30} fill="currentColor" aria-hidden="true" className="translate-x-0.5" />
                  </span>
                </span>
                <span className="absolute bottom-4 left-5 text-left text-[15px] font-semibold text-paper sm:bottom-6 sm:left-7">
                  Ver el recorrido
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-night-line pt-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="font-titular text-[1.9rem] font-normal leading-tight">
              ¿Querés venir a conocerla?
            </h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-paper/70">
              Después de ver el recorrido, podés consultar disponibilidad o
              coordinar una visita para conocer el salón en persona.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <Link
              to="/reservar"
              className="group inline-flex items-center justify-center gap-3 rounded-md bg-calypso px-7 py-4 text-base font-semibold text-ink transition-colors hover:bg-[#25c3b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso"
            >
              Reservar fecha
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="self-start text-base font-semibold underline decoration-paper/40 decoration-1 underline-offset-[6px] transition-colors hover:decoration-calypso sm:self-auto"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
