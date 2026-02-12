import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  X,
  ArrowUpRight,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import parrillero from "../assets/sector-parrillero.jpg";
import parrillero2 from "../assets/Parrillero2.jpg";
import parrillero3 from "../assets/Parrillero3.jpg";
import adultos from "../assets/sector-adultos.jpeg";
import ninos from "../assets/sector-ninos.jpeg";
import cocina from "../assets/sector-cocina.jpg";
import cocina2 from "../assets/cocina2.png";
import cocina3 from "../assets/Cocina3.jpg";

type Sector = {
  title: string;
  desc: string;
  img: string;
  tag: string;
  gallery: string[];
  features: string[];
};

const items: Sector[] = [
  {
    title: "Parrillero",
    desc: "Espacio ideal para reuniones, cumpleaños y encuentros con un ambiente cálido y práctico.",
    img: parrillero,
    tag: "Reuniones",
    gallery: [parrillero, parrillero2, parrillero3],
    features: ["Ambiente cálido", "Ideal para grupos", "Zona flexible"],
  },
  {
    title: "Zona Adultos",
    desc: "Mesas amplias, circulación cómoda y un entorno ideal para disfrutar la celebración.",
    img: adultos,
    tag: "Comodidad",
    gallery: [adultos],
    features: ["Mesas amplias", "Circulación cómoda", "Espacio social"],
  },
  {
    title: "Zona Niños",
    desc: "Sector pensado para que los más chicos se diviertan mientras los adultos disfrutan tranquilos.",
    img: ninos,
    tag: "Familias",
    gallery: [ninos],
    features: ["Pensado para niños", "Más tranquilidad", "Zona dedicada"],
  },
  {
    title: "Cocina",
    desc: "Área funcional para organizar catering, preparaciones y apoyo durante el evento.",
    img: cocina,
    tag: "Soporte",
    gallery: [cocina, cocina2, cocina3],
    features: ["Área funcional", "Apoyo para catering", "Organización"],
  },
];

export default function Sectores() {
  const [expanded, setExpanded] = useState(false);

  // Modal state: index del sector seleccionado (más fácil para prev/next sector)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Imagen activa del mini carrusel
  const [activeImg, setActiveImg] = useState<string>("");

  const collapsedMobile = 2;
  const collapsedDesktop = 4;
  const hasMore = items.length > collapsedDesktop;

  const selected = selectedIndex !== null ? items[selectedIndex] : null;

  // cuando abrimos modal, setear imagen activa
  useEffect(() => {
    if (selected) setActiveImg(selected.gallery?.[0] ?? selected.img);
  }, [selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const goPrevImg = () => {
    if (!selected) return;
    const idx = selected.gallery.findIndex(
      (g) => g === (activeImg || selected.img),
    );
    const safeIdx = idx === -1 ? 0 : idx;
    const nextIdx =
      (safeIdx - 1 + selected.gallery.length) % selected.gallery.length;
    setActiveImg(selected.gallery[nextIdx]);
  };

  const goNextImg = () => {
    if (!selected) return;
    const idx = selected.gallery.findIndex(
      (g) => g === (activeImg || selected.img),
    );
    const safeIdx = idx === -1 ? 0 : idx;
    const nextIdx = (safeIdx + 1) % selected.gallery.length;
    setActiveImg(selected.gallery[nextIdx]);
  };

  const goPrevSector = () => {
    if (selectedIndex === null) return;
    const next = (selectedIndex - 1 + items.length) % items.length;
    setSelectedIndex(next);
  };

  const goNextSector = () => {
    if (selectedIndex === null) return;
    const next = (selectedIndex + 1) % items.length;
    setSelectedIndex(next);
  };

  const activeIndex = useMemo(() => {
    if (!selected) return 0;
    const idx = selected.gallery.findIndex(
      (g) => g === (activeImg || selected.img),
    );
    return idx === -1 ? 0 : idx;
  }, [selected, activeImg]);

  // cerrar con ESC + bloquear scroll + navegación por teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);

      if (!selected) return;

      // Flechas: imágenes
      if (e.key === "ArrowLeft") goPrevImg();
      if (e.key === "ArrowRight") goNextImg();

      // Flechas: sectores (Shift + ←/→)
      if (e.shiftKey && e.key === "ArrowLeft") goPrevSector();
      if (e.shiftKey && e.key === "ArrowRight") goNextSector();
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
  }, [selected, activeImg, selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleItems = useMemo(() => items, []);

  return (
    <section id="sectors" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs tracking-[0.22em] uppercase text-black/50">
              Espacios del local
            </div>
            <h2 className="mt-2 font-display text-4xl tracking-tight">
              Sectores<span className="text-calypso">.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-black/70">
              Explorá cada sector del salón. Tocá una tarjeta para ver fotos y
              detalles.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-2.5 text-sm hover:border-black/20 transition"
          >
            Consultar disponibilidad
          </a>
        </div>

        {/* Grid */}
        <div className="relative mt-10">
          <div
            className={[
              "grid gap-6 md:grid-cols-2",
              !expanded ? "max-h-[760px] sm:max-h-[720px]" : "max-h-none",
              "overflow-hidden",
            ].join(" ")}
          >
            {visibleItems.map((x, idx) => {
              const hiddenOnMobile = !expanded && idx >= collapsedMobile;
              const hiddenOnDesktop = !expanded && idx >= collapsedDesktop;

              return (
                <motion.button
                  key={x.title}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => setSelectedIndex(idx)}
                  className={[
                    "group relative overflow-hidden rounded-3xl border border-black/10 bg-black text-left",
                    "focus:outline-none focus:ring-4 focus:ring-calypso/15",
                    hiddenOnMobile ? "hidden sm:block" : "",
                    hiddenOnDesktop ? "sm:hidden" : "",
                  ].join(" ")}
                >
                  <img
                    src={x.img}
                    alt={x.title}
                    className="h-[320px] w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                  />

                  {/* overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-[radial-gradient(600px_220px_at_20%_20%,rgba(11,179,166,0.25),transparent)]" />

                  {/* tag */}
                  <div className="absolute left-5 top-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-white/75 backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-calypso" />
                      {x.tag}
                    </span>
                  </div>

                  {/* content */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-2xl text-white">
                        {x.title}
                      </h3>

                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-white/70 backdrop-blur">
                        Explorar <ArrowUpRight size={14} />
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      {x.desc}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-white/60">
                      <ImageIcon size={14} />
                      {x.gallery.length} fotos
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Fade cuando está colapsado */}
          {!expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white/90" />
          )}
        </div>

        {/* Ver más / Ver menos */}
        {(items.length > collapsedMobile || hasMore) && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-2.5 text-sm hover:border-black/20 transition"
            >
              {expanded ? "Ver menos" : "Ver más"}
              <ChevronDown
                size={16}
                className={expanded ? "rotate-180 transition" : "transition"}
              />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setSelectedIndex(null)}
            />

            {/* Flechas externas para cambiar de SECTOR */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrevSector();
              }}
              className="hidden md:inline-flex absolute left-6 top-1/2 -translate-y-1/2 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/50 backdrop-blur-md text-white/90 shadow-[0_20px_70px_rgba(0,0,0,0.55)] hover:bg-black/60 transition"
              aria-label="Sector anterior"
              title="Sector anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNextSector();
              }}
              className="hidden md:inline-flex absolute right-6 top-1/2 -translate-y-1/2 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/50 backdrop-blur-md text-white/90 shadow-[0_20px_70px_rgba(0,0,0,0.55)] hover:bg-black/60 transition"
              aria-label="Sector siguiente"
              title="Sector siguiente"
            >
              <ChevronRight size={18} />
            </button>

            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_40px_160px_rgba(0,0,0,0.55)]"
            >
              {/* top bar (más calypso) */}
              <div className="relative flex items-center justify-between gap-4 px-6 py-4">
                {/* base calypso más fuerte */}
                <div className="absolute inset-0 bg-calypso/45" />
                {/* contraste y profundidad */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/35" />
                {/* brillo superior sutil */}
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />

                <div className="relative min-w-0">
                  <div className="text-[11px] tracking-[0.22em] uppercase text-white/85">
                    {selected.tag}
                  </div>
                  <div className="font-display text-2xl text-white truncate">
                    {selected.title}
                    <span className="text-white/90">.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/25 backdrop-blur-md text-white/95 shadow hover:bg-black/35 transition"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* content */}
              <div className="grid max-h-[calc(90vh-64px)] overflow-hidden lg:grid-cols-[1.35fr_1fr]">
                {/* image */}
                <div className="relative bg-black">
                  <img
                    src={activeImg || selected.img}
                    alt={selected.title}
                    className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[calc(90vh-64px)]"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                  {/* Flechas de IMÁGENES (más visibles) */}
                  {selected.gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goPrevImg();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/55 backdrop-blur-md text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] hover:bg-black/65 transition"
                        aria-label="Foto anterior"
                        title="Foto anterior"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goNextImg();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/55 backdrop-blur-md text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] hover:bg-black/65 transition"
                        aria-label="Foto siguiente"
                        title="Foto siguiente"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}

                  {/* index */}
                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-white/90 backdrop-blur">
                    {activeIndex + 1}/{selected.gallery.length}
                  </div>

                  {/* thumbs: más margen al borde + base */}
                  <div className="hidden md:block absolute bottom-5 left-6 right-6">
                    <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md px-3 py-3">
                      <div className="flex gap-2 overflow-x-auto">
                        {selected.gallery.map((g, i) => {
                          const isActive = (activeImg || selected.img) === g;
                          return (
                            <button
                              key={`${selected.title}-g-${i}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg(g);
                              }}
                              className={[
                                "shrink-0 overflow-hidden rounded-xl border transition",
                                isActive
                                  ? "border-calypso/80"
                                  : "border-white/15 hover:border-white/30",
                              ].join(" ")}
                              aria-label={`Ver foto ${i + 1}`}
                              title={`Foto ${i + 1}`}
                            >
                              <img
                                src={g}
                                alt={`Foto ${i + 1}`}
                                className="h-14 w-20 object-cover opacity-95"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* details */}
                <div className="bg-white p-6 sm:p-7 overflow-auto">
                  <p className="text-black/75 leading-relaxed">
                    {selected.desc}
                  </p>

                  <div className="mt-6">
                    <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                      Características
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.features.map((f) => (
                        <span
                          key={f}
                          className="inline-flex rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-xs text-black/70"
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
                      className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90 transition"
                    >
                      Consultar por este sector{" "}
                      <span className="ml-2 text-calypso">●</span>
                    </a>

                    <a
                      href="#sectors"
                      onClick={() => setSelectedIndex(null)}
                      className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm hover:border-black/20 transition"
                    >
                      Volver a sectores
                    </a>

                    <div className="text-xs text-black/50">
                      Tip: cerrar con <b>ESC</b>. Fotos con <b>←</b> <b>→</b>.
                      Sectores con <b>Shift</b> + <b>←</b>/<b>→</b>.
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
