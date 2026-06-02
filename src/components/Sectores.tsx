import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  X,
  ArrowUpRight,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react";

type Sector = {
  title: string;
  desc: string;
  img?: string;
  tag: string;
  gallery: string[];
  features: string[];
  placeholder?: boolean;
};

function sectorImg(folder: string, index: number) {
  return `/Sectores/${folder}/${index}.webp`;
}

function makeGallery(folder: string, total: number) {
  return Array.from({ length: total }, (_, index) =>
    sectorImg(folder, index + 1),
  );
}

const juegosGallery = makeGallery("ZonasDeJuegos", 21);
const adultosGallery = makeGallery("ZonaDeAdultos", 5);
const parrilleroYCocinaGallery = makeGallery("ParrilleroYCocina", 11);
const ninosGallery = makeGallery("ZonaDeNinos", 8);
const mesaPrincipalGallery = makeGallery("MesaPrincipal", 4);
const exteriorGallery = makeGallery("ExteriorYJardin", 14);

const items: Sector[] = [
  {
    title: "Acceso inclusivo",
    desc: "Ingreso pensado para facilitar la llegada y circulación de los invitados con mayor comodidad.",
    tag: "Accesibilidad",
    gallery: [],
    features: ["Ingreso cómodo", "Circulación simple", "Mayor accesibilidad"],
    placeholder: true,
  },
  {
    title: "Zonas de juegos",
    desc: "Espacio pensado para que los chicos puedan divertirse durante el evento en un entorno cómodo.",
    img: juegosGallery[0],
    tag: "Diversión",
    gallery: juegosGallery,
    features: ["Juegos", "Entretenimiento", "Ideal para niños"],
  },
  {
    title: "Zona de adultos",
    desc: "Mesas amplias, circulación cómoda y un entorno pensado para disfrutar la celebración con tranquilidad.",
    img: adultosGallery[0],
    tag: "Comodidad",
    gallery: adultosGallery,
    features: ["Mesas amplias", "Circulación cómoda", "Espacio social"],
  },
  {
    title: "Parrillero y Cocina",
    desc: "Espacio ideal para reuniones, cumpleaños y encuentros con un ambiente cálido y práctico.",
    img: parrilleroYCocinaGallery[0],
    tag: "Encuentros",
    gallery: parrilleroYCocinaGallery,
    features: ["Ambiente cálido", "Ideal para grupos", "Zona flexible"],
  },
  {
    title: "Zona de niños",
    desc: "Sector pensado para que los más chicos se diviertan mientras los adultos disfrutan el evento.",
    img: ninosGallery[0],
    tag: "Familias",
    gallery: ninosGallery,
    features: ["Pensado para niños", "Más tranquilidad", "Zona dedicada"],
  },
  {
    title: "Mesa principal",
    desc: "Sector central para la torta, decoración, fotos y momentos importantes de la celebración.",
    img: mesaPrincipalGallery[0],
    tag: "Celebración",
    gallery: mesaPrincipalGallery,
    features: ["Punto central", "Ideal para fotos", "Decoración principal"],
  },
  {
    title: "Exterior y jardín",
    desc: "Área al aire libre para complementar el evento con más amplitud y un ambiente natural.",
    img: exteriorGallery[0],
    tag: "Exterior",
    gallery: exteriorGallery,
    features: ["Aire libre", "Más amplitud", "Ambiente natural"],
  },
];

function SectorPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(11,179,166,0.26),transparent_34%),linear-gradient(135deg,#3b2b22_0%,#2f241e_48%,#5a4032_100%)]">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur">
          <ImageIcon size={24} />
        </div>
        <div className="mt-4 font-display text-2xl text-white">{title}</div>
        <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/70">
          Foto próximamente
        </div>
      </div>
    </div>
  );
}

export default function Sectores() {
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeImg, setActiveImg] = useState("");
  const [loadedImg, setLoadedImg] = useState("");

  const collapsedMobile = 2;
  const collapsedDesktop = 4;

  const selected = selectedIndex !== null ? items[selectedIndex] : null;
  const selectedGallery = selected?.gallery ?? [];

  useEffect(() => {
    if (!selected) return;

    const firstImage = selected.gallery[0] ?? "";

    setActiveImg(firstImage);
    setLoadedImg("");
  }, [selectedIndex, selected]);

  const activeIndex = useMemo(() => {
    if (!selected || selected.gallery.length === 0) return 0;

    const idx = selected.gallery.findIndex((g) => g === activeImg);
    return idx === -1 ? 0 : idx;
  }, [selected, activeImg]);

  useEffect(() => {
    if (!selected || selected.gallery.length <= 1 || !activeImg) return;

    const prev =
      selected.gallery[
        (activeIndex - 1 + selected.gallery.length) % selected.gallery.length
      ];

    const next = selected.gallery[(activeIndex + 1) % selected.gallery.length];

    [prev, next].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [selected, activeImg, activeIndex]);

  function changeActiveImage(src: string) {
    if (!src || src === activeImg) return;

    setLoadedImg("");
    setActiveImg(src);
  }

  const goPrevImg = () => {
    if (!selected || selected.gallery.length <= 1) return;

    const idx = selected.gallery.findIndex((g) => g === activeImg);
    const safe = idx === -1 ? 0 : idx;

    changeActiveImage(
      selected.gallery[
        (safe - 1 + selected.gallery.length) % selected.gallery.length
      ],
    );
  };

  const goNextImg = () => {
    if (!selected || selected.gallery.length <= 1) return;

    const idx = selected.gallery.findIndex((g) => g === activeImg);
    const safe = idx === -1 ? 0 : idx;

    changeActiveImage(selected.gallery[(safe + 1) % selected.gallery.length]);
  };

  const goPrevSector = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const goNextSector = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (!selected) return;

      if (e.shiftKey && e.key === "ArrowLeft") goPrevSector();
      else if (e.shiftKey && e.key === "ArrowRight") goNextSector();
      else if (e.key === "ArrowLeft") goPrevImg();
      else if (e.key === "ArrowRight") goNextImg();
    };

    if (selected) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [selected, activeImg, selectedIndex]);

  return (
    <section
      id="sectors"
      className="relative overflow-hidden bg-[#f6f0e7] py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(70,54,45,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute left-[-100px] top-20 h-[260px] w-[260px] rounded-full bg-calypso/10 blur-3xl" />
        <div className="absolute right-[-120px] bottom-10 h-[320px] w-[320px] rounded-full bg-[#c9a46a]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cdb79e]/70 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#6a5649] backdrop-blur">
              <ImageIcon size={14} className="text-calypso" />
              Espacios del salón
            </div>

            <h2 className="mt-4 font-display text-4xl tracking-tight text-[#2f241e] md:text-5xl">
              Sectores para disfrutar cada momento
              <span className="text-calypso">.</span>
            </h2>

            <p className="mt-4 text-[#46362d]">
              Explorá los distintos espacios de Calypso. Cada zona fue pensada
              para brindar comodidad, disfrute y una experiencia memorable.
            </p>

            <div className="mt-6 inline-flex items-start gap-3 rounded-2xl border border-[#cdb79e]/60 bg-white/70 px-4 py-3 shadow-[0_12px_28px_rgba(90,64,50,0.08)]">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-calypso/10 text-calypso">
                <Info size={18} />
              </div>

              <div className="text-sm leading-relaxed text-[#6a5649]">
                <b className="text-[#46362d]">Fotos reales del salón.</b> Los
                sectores ya muestran espacios de Calypso. El único material
                pendiente corresponde al acceso inclusivo.
              </div>
            </div>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-2xl border border-[#cdb79e]/70 bg-white/75 px-5 py-3 text-sm font-semibold text-[#46362d] transition hover:bg-white"
          >
            Consultar disponibilidad
            <span className="ml-2 text-calypso">●</span>
          </a>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((x, idx) => {
            const hiddenMobile = !expanded && idx >= collapsedMobile;
            const hiddenDesktop = !expanded && idx >= collapsedDesktop;

            return (
              <motion.button
                key={x.title}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.05 }}
                onClick={() => setSelectedIndex(idx)}
                className={[
                  "group relative overflow-hidden rounded-3xl border border-[#cdb79e]/55 bg-[#2f241e] text-left shadow-[0_18px_44px_rgba(90,64,50,0.14)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(90,64,50,0.22)]",
                  hiddenMobile ? "hidden sm:block" : "",
                  hiddenDesktop ? "sm:hidden" : "",
                ].join(" ")}
              >
                <div className="relative h-[330px] overflow-hidden">
                  {x.img ? (
                    <img
                      src={x.img}
                      alt={x.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <SectorPlaceholder title={x.title} />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/58 to-black/18" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(201,164,106,0.10),transparent_35%)]" />

                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                      {x.tag}
                    </span>

                    {x.placeholder && (
                      <span className="rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                        Foto pendiente
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-3xl text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]">
                      {x.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-relaxed text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.9)]">
                      {x.desc}
                    </p>

                    <div className="mt-4 h-px w-16 bg-gradient-to-r from-calypso via-white/60 to-transparent transition-all group-hover:w-28" />

                    <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                      <ImageIcon size={14} />
                      Explorar sector
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-9 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#cdb79e]/70 bg-white/75 px-5 py-3 text-sm font-semibold text-[#46362d]"
          >
            {expanded ? "Ver menos" : "Ver más sectores"}
            <ChevronDown
              size={16}
              className={expanded ? "rotate-180 transition" : "transition"}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/72 backdrop-blur-sm"
              onClick={() => setSelectedIndex(null)}
            />

            <motion.div
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-[#cdb79e]/45 bg-[#f8f3eb] shadow-[0_34px_90px_rgba(0,0,0,0.42)]"
            >
              <div className="flex items-center justify-between border-b border-[#cdb79e]/45 bg-[#2f241e] px-6 py-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#f6efe7]/72">
                    {selected.tag}
                  </div>

                  <div className="mt-1 font-display text-2xl text-[#f6efe7]">
                    {selected.title}
                    <span className="text-calypso">.</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedIndex(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid lg:grid-cols-[1.35fr_1fr]">
                <div className="relative bg-black">
                  {activeImg ? (
                    <>
                      <div
                        className={[
                          "absolute inset-0 z-10 grid place-items-center bg-black/45 transition-opacity duration-300",
                          loadedImg === activeImg
                            ? "pointer-events-none opacity-0"
                            : "opacity-100",
                        ].join(" ")}
                      >
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/45 px-5 py-4 text-white backdrop-blur-md">
                          <Loader2 className="h-6 w-6 animate-spin text-calypso" />
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                            Cargando foto
                          </span>
                        </div>
                      </div>

                      <img
                        key={activeImg}
                        src={activeImg}
                        alt={selected.title}
                        loading="eager"
                        decoding="async"
                        onLoad={() => setLoadedImg(activeImg)}
                        onError={() => {
                          console.error(
                            "No se pudo cargar la imagen:",
                            activeImg,
                          );
                          setLoadedImg(activeImg);
                        }}
                        className={[
                          "h-[300px] w-full object-cover transition duration-500 lg:h-[520px]",
                          loadedImg === activeImg
                            ? "scale-100 opacity-100"
                            : "scale-[1.015] opacity-0",
                        ].join(" ")}
                      />
                    </>
                  ) : (
                    <div className="h-[300px] lg:h-[520px]">
                      <SectorPlaceholder title={selected.title} />
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

                  {selectedGallery.length > 1 && (
                    <>
                      <button
                        onClick={goPrevImg}
                        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-black/55 text-white transition hover:bg-black/70"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        onClick={goNextImg}
                        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-black/55 text-white transition hover:bg-black/70"
                        aria-label="Foto siguiente"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}

                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">
                    {selectedGallery.length > 0
                      ? `${activeIndex + 1}/${selectedGallery.length}`
                      : "Foto pendiente"}
                  </div>
                </div>

                <div className="overflow-auto p-6 sm:p-7">
                  {selected.placeholder && (
                    <div className="mb-5 rounded-2xl border border-[#cdb79e]/60 bg-white/70 p-4 text-sm leading-relaxed text-[#6a5649]">
                      <b className="text-[#46362d]">Foto pendiente.</b> Este
                      sector se actualizará cuando esté disponible el material
                      del acceso inclusivo.
                    </div>
                  )}

                  <p className="leading-relaxed text-[#46362d]">
                    {selected.desc}
                  </p>

                  <div className="mt-7">
                    <div className="text-xs uppercase tracking-[0.22em] text-[#8b7667]">
                      Características
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.features.map((f) => (
                        <span
                          key={f}
                          className="rounded-full border border-[#cdb79e]/65 bg-white/70 px-3 py-1 text-xs text-[#46362d]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3">
                    <a
                      href="#contact"
                      onClick={() => setSelectedIndex(null)}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#2f241e] px-5 py-3 text-sm font-semibold text-[#f6efe7]"
                    >
                      Consultar por este sector
                      <span className="ml-2 text-calypso">●</span>
                    </a>

                    <button
                      onClick={() => setSelectedIndex(null)}
                      className="rounded-2xl border border-[#cdb79e]/70 bg-white/70 px-5 py-3 text-sm font-semibold text-[#46362d]"
                    >
                      Volver
                    </button>

                    <div className="text-xs text-[#8b7667]">
                      ESC para cerrar · ← → fotos · Shift + ← → sectores
                    </div>
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
