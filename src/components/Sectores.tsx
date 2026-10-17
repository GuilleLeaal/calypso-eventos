import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Moon,
  Sun,
  X,
} from "lucide-react";
import accesoCover from "../assets/home/sector-acceso-inclusivo.webp";
import juegosCover from "../assets/home/sector-zonas-de-juegos.webp";
import adultosCover from "../assets/home/sector-zona-de-adultos.webp";
import parrilleroCover from "../assets/home/sector-parrillero-y-cocina.webp";
import ninosCover from "../assets/home/sector-zona-de-ninos.webp";
import mesaCover from "../assets/home/sector-mesa-principal.webp";
import exteriorCover from "../assets/home/sector-exterior-y-jardin.webp";

type GalleryMoment = "day" | "night";

type Sector = {
  title: string;
  desc: string;
  cover: string;
  galleries: {
    day: string[];
    night?: string[];
  };
  features: string[];
};

type OpenGallery = {
  sector: number;
  moment: GalleryMoment;
  photo: number;
};

function makeGallery(moment: GalleryMoment, folder: string, total: number) {
  const baseFolder = moment === "day" ? "FotosDia" : "FotosNoche";
  return Array.from(
    { length: total },
    (_, index) => `/Sectores/${baseFolder}/${folder}/${index + 1}.webp`,
  );
}

const items: Sector[] = [
  {
    title: "Acceso inclusivo",
    desc: "Ingreso pensado para facilitar la llegada y circulación de los invitados con mayor comodidad.",
    cover: accesoCover,
    galleries: { day: makeGallery("day", "AccesoInclusivo", 4) },
    features: ["Ingreso cómodo", "Circulación simple", "Mayor accesibilidad"],
  },
  {
    title: "Zonas de juegos",
    desc: "Espacio pensado para que chicos y adultos puedan divertirse durante el evento en un entorno cómodo.",
    cover: juegosCover,
    galleries: {
      day: makeGallery("day", "ZonasDeJuegos", 26),
      night: makeGallery("night", "ZonasDeJuegos", 21),
    },
    features: ["Juegos", "Entretenimiento", "Ideal para niños"],
  },
  {
    title: "Zona de adultos",
    desc: "Mesas amplias, circulación cómoda y un entorno pensado para disfrutar la celebración con tranquilidad.",
    cover: adultosCover,
    galleries: {
      day: makeGallery("day", "ZonaDeAdultos", 5),
      night: makeGallery("night", "ZonaDeAdultos", 5),
    },
    features: ["Mesas amplias", "Circulación cómoda", "Espacio social"],
  },
  {
    title: "Parrillero y cocina",
    desc: "Espacio ideal para reuniones, cumpleaños y encuentros con un ambiente cálido y práctico.",
    cover: parrilleroCover,
    galleries: {
      day: makeGallery("day", "ParrilleroYCocina", 12),
      night: makeGallery("night", "ParrilleroYCocina", 11),
    },
    features: ["Ambiente cálido", "Ideal para grupos", "Zona flexible"],
  },
  {
    title: "Zona de niños",
    desc: "Sector pensado para que los más chicos se diviertan mientras los adultos disfrutan el evento.",
    cover: ninosCover,
    galleries: {
      day: makeGallery("day", "ZonaDeNinos", 5),
      night: makeGallery("night", "ZonaDeNinos", 8),
    },
    features: ["Pensado para niños", "Más tranquilidad", "Zona dedicada"],
  },
  {
    title: "Mesa principal",
    desc: "Sector central para la torta, decoración, fotos y momentos importantes de la celebración.",
    cover: mesaCover,
    galleries: {
      day: makeGallery("day", "MesaPrincipal", 4),
      night: makeGallery("night", "MesaPrincipal", 4),
    },
    features: ["Punto central", "Ideal para fotos", "Decoración principal"],
  },
  {
    title: "Exterior y jardín",
    desc: "Área al aire libre para complementar el evento con más amplitud y un ambiente natural.",
    cover: exteriorCover,
    galleries: {
      day: makeGallery("day", "ExteriorYJardin", 11),
      night: makeGallery("night", "ExteriorYJardin", 14),
    },
    features: ["Aire libre", "Más amplitud", "Ambiente natural"],
  },
];

function galleryFor(state: OpenGallery) {
  const sector = items[state.sector];
  return state.moment === "night" && sector.galleries.night?.length
    ? sector.galleries.night
    : sector.galleries.day;
}

function whatsappUrlFor(sectorTitle: string) {
  return `https://wa.me/59899372068?text=${encodeURIComponent(
    `¡Hola! Quería consultar por el sector "${sectorTitle}" de Calypso.`,
  )}`;
}

export default function Sectores() {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [open, setOpen] = useState<OpenGallery | null>(null);
  const [loadedSrc, setLoadedSrc] = useState("");
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const preview = items[previewIndex];
  const openSector = open ? items[open.sector] : null;
  const gallery = open ? galleryFor(open) : [];
  const activeSrc = open ? gallery[open.photo] : "";
  const isOpen = open !== null;

  function openGallery(index: number, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setOpen({ sector: index, moment: "day", photo: 0 });
  }

  function closeGallery() {
    setOpen(null);
    triggerRef.current?.focus();
  }

  function setMoment(moment: GalleryMoment) {
    setOpen((current) => (current ? { ...current, moment, photo: 0 } : current));
  }

  function stepPhoto(delta: number) {
    setOpen((current) => {
      if (!current) return current;
      const total = galleryFor(current).length;
      return { ...current, photo: (current.photo + delta + total) % total };
    });
  }

  function stepSector(delta: number) {
    setOpen((current) =>
      current
        ? {
            sector: (current.sector + delta + items.length) % items.length,
            moment: "day",
            photo: 0,
          }
        : current,
    );
  }

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(null);
        triggerRef.current?.focus();
        return;
      }

      const delta = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      if (!delta) return;

      if (event.shiftKey) {
        setOpen((current) =>
          current
            ? {
                sector: (current.sector + delta + items.length) % items.length,
                moment: "day",
                photo: 0,
              }
            : current,
        );
      } else {
        setOpen((current) => {
          if (!current) return current;
          const total = galleryFor(current).length;
          return { ...current, photo: (current.photo + delta + total) % total };
        });
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const previousSrc =
    open && gallery.length > 1
      ? gallery[(open.photo - 1 + gallery.length) % gallery.length]
      : "";
  const nextSrc =
    open && gallery.length > 1 ? gallery[(open.photo + 1) % gallery.length] : "";

  // Precarga la foto anterior y la siguiente para que las flechas respondan al instante.
  useEffect(() => {
    [previousSrc, nextSrc].filter(Boolean).forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, [previousSrc, nextSrc]);

  return (
    <section
      id="sectors"
      aria-labelledby="espacios-titulo"
      className="bg-paper py-20 font-texto text-ink lg:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[15px] font-semibold text-ink-mute">
              Espacios de la casa
            </p>
            <h2
              id="espacios-titulo"
              className="mt-4 font-titular text-[clamp(2.4rem,4.6vw,3.8rem)] font-normal leading-[1] tracking-[-0.01em]"
            >
              Siete espacios para cada momento de la fiesta.
            </h2>
          </div>

          <div className="lg:justify-self-end">
            <p className="max-w-md text-lg leading-relaxed text-ink-soft">
              Fotos reales de cada sector, de día y de noche. El acceso
              inclusivo tiene solo fotos de día.
            </p>
            <a
              href="/reservar"
              className="mt-5 inline-flex font-semibold underline decoration-ink/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-calypso"
            >
              Consultar disponibilidad
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] xl:grid-cols-[1fr_minmax(0,30rem)]">
          <ol className="border-t border-ink/15">
            {items.map((sector, index) => {
              const active = index === previewIndex;

              return (
                <li key={sector.title} className="border-b border-ink/15">
                  <button
                    type="button"
                    onClick={(event) => openGallery(index, event.currentTarget)}
                    onMouseEnter={() => setPreviewIndex(index)}
                    onFocus={() => setPreviewIndex(index)}
                    className="group grid w-full grid-cols-[4rem_1fr_auto] items-center gap-x-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700 sm:grid-cols-[3.5rem_1fr_auto] lg:py-5"
                  >
                    <img
                      src={sector.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-16 rounded-sm object-cover lg:hidden"
                    />
                    <span
                      aria-hidden="true"
                      className={[
                        "hidden font-titular text-2xl transition-colors lg:block",
                        active ? "text-calypso-700" : "text-ink-mute",
                      ].join(" ")}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>
                      <span
                        className={[
                          "block font-titular text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.05] transition-colors",
                          active ? "lg:text-calypso-700" : "",
                        ].join(" ")}
                      >
                        {sector.title}
                      </span>{" "}
                      <span className="mt-1 block text-sm text-ink-mute">
                        {sector.galleries.night?.length
                          ? `${sector.galleries.day.length + sector.galleries.night.length} fotos, de día y de noche`
                          : `${sector.galleries.day.length} fotos de día`}
                      </span>
                    </span>

                    <ArrowRight
                      size={20}
                      aria-hidden="true"
                      className="text-ink-mute transition-transform group-hover:translate-x-1 group-hover:text-calypso-700 motion-reduce:transition-none"
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          <figure className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <img
              key={preview.cover}
              src={preview.cover}
              alt={`${preview.title} de Calypso Eventos`}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
            <figcaption className="mt-5">
              <p className="text-base leading-relaxed text-ink-soft">{preview.desc}</p>
              <p className="mt-3 text-sm text-ink-mute">{preview.features.join(" · ")}</p>
            </figcaption>
          </figure>
        </div>
      </div>

      {open && openSector && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="galeria-titulo"
          className="fixed inset-0 z-[90] flex flex-col bg-night text-paper"
        >
          <div className="flex items-center justify-between gap-4 border-b border-night-line px-5 py-4 sm:px-8">
            <div className="min-w-0">
              <h3 id="galeria-titulo" className="truncate font-titular text-2xl sm:text-3xl">
                {openSector.title}
              </h3>
              <p className="mt-1 text-sm text-paper/60">
                Foto {open.photo + 1} de {gallery.length}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeGallery}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-night-line px-4 text-[15px] font-semibold transition-colors hover:border-paper/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso"
            >
              <X size={18} aria-hidden="true" />
              Cerrar
            </button>
          </div>

          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_24rem] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
            <div className="relative h-[58svh] shrink-0 bg-black lg:h-auto">
              <div
                className={[
                  "pointer-events-none absolute inset-0 z-10 grid place-items-center transition-opacity duration-300",
                  loadedSrc === activeSrc ? "opacity-0" : "opacity-100",
                ].join(" ")}
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-paper/80">
                  <Loader2 className="h-5 w-5 animate-spin text-calypso" aria-hidden="true" />
                  Cargando foto
                </span>
              </div>

              <img
                key={activeSrc}
                src={activeSrc}
                alt={`${openSector.title}, foto ${open.photo + 1} de ${gallery.length}`}
                decoding="async"
                onLoad={() => setLoadedSrc(activeSrc)}
                onError={() => setLoadedSrc(activeSrc)}
                className={[
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
                  loadedSrc === activeSrc ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => stepPhoto(-1)}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-night/80 text-paper transition-colors hover:bg-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso"
                  >
                    <ChevronLeft size={22} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepPhoto(1)}
                    aria-label="Foto siguiente"
                    className="absolute right-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-night/80 text-paper transition-colors hover:bg-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso"
                  >
                    <ChevronRight size={22} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-col gap-8 p-5 sm:p-8 lg:overflow-y-auto">
              <div>
                {openSector.galleries.night?.length ? (
                  <div
                    role="group"
                    aria-label="Ver el sector de día o de noche"
                    className="inline-flex rounded-md border border-night-line p-1"
                  >
                    {(
                      [
                        { value: "day", label: "Día", Icon: Sun },
                        { value: "night", label: "Noche", Icon: Moon },
                      ] as const
                    ).map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={open.moment === value}
                        onClick={() => setMoment(value)}
                        className={[
                          "inline-flex items-center gap-2 rounded-[5px] px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso",
                          open.moment === value ? "bg-paper text-night" : "text-paper/70 hover:text-paper",
                        ].join(" ")}
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-paper/60">Este sector tiene solo fotos de día.</p>
                )}

                <p className="mt-6 text-base leading-relaxed text-paper/80">{openSector.desc}</p>

                <ul className="mt-5 space-y-2">
                  {openSector.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-[15px]">
                      <span aria-hidden="true" className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-calypso" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={whatsappUrlFor(openSector.title)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-md bg-calypso px-6 py-4 font-semibold text-ink transition-colors hover:bg-[#25c3b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso"
              >
                Consultar por este sector
              </a>

              <div className="mt-auto flex items-center justify-between gap-4 border-t border-night-line pt-6 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => stepSector(-1)}
                  className="inline-flex items-center gap-2 text-paper/75 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  {items[(open.sector - 1 + items.length) % items.length].title}
                </button>
                <button
                  type="button"
                  onClick={() => stepSector(1)}
                  className="inline-flex items-center gap-2 text-right text-paper/75 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso"
                >
                  {items[(open.sector + 1) % items.length].title}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>

              <p className="hidden text-xs text-paper/45 lg:block">
                Esc para cerrar · ← → fotos · Shift + ← → sectores
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
