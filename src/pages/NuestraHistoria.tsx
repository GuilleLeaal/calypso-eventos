import { useEffect, useState } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Trees,
  Hammer,
  HeartHandshake,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import historia1 from "/historia/historia-1.webp";
import historia2 from "/historia/historia-2.webp";
import historia3 from "/historia/historia-3.webp";
import historia4 from "/historia/historia-4.webp";
import historia5 from "/historia/historia-5.webp";

import cipreses1 from "/historia/cipreses-1.webp";
import cipreses2 from "/historia/cipreses-2.webp";

import img2018 from "/timeline/2018.webp";
import img2019 from "/timeline/2019.webp";
import img2020 from "/timeline/2020.webp";
import img2021 from "/timeline/2021.webp";
import img2022 from "/timeline/2022.webp";
import img2023 from "/timeline/2023.webp";
import img2024 from "/timeline/2024.webp";
import img2025 from "/timeline/2025.webp";
import img2026 from "/timeline/2026.webp";

const timeline = [
  {
    year: "2018",
    image: img2018,
    title: "La maqueta",
    text: "Se diseña la maqueta del proyecto y se inicia la nivelación y preparación del terreno.",
  },
  {
    year: "2019",
    image: img2019,
    title: "El primer avance",
    text: "Se construye el piso, marcando el primer avance concreto.",
  },
  {
    year: "2020",
    image: img2020,
    title: "La estructura",
    text: "Se levantan columnas, vigas, estructura general y también las paredes.",
  },
  {
    year: "2021",
    image: img2021,
    title: "Techo y barra",
    text: "Se construye el techo, pensado desde el inicio para un futuro segundo nivel. También se crea la primera versión de la barra.",
  },
  {
    year: "2022",
    image: img2022,
    title: "Baños y conexiones",
    text: "Se desarrollan los baños, se modifica la barra y se realizan nuevas conexiones de agua.",
  },
  {
    year: "2023",
    image: img2023,
    title: "Una decisión clave",
    text: "Se realiza la instalación eléctrica y sistemas de seguridad. El proyecto se convierte en salón de eventos.",
  },
  {
    year: "2024",
    image: img2024,
    title: "Aberturas y cerramientos",
    text: "Se colocan aberturas y cerramientos. Empiezan a llegar las primeras personas interesadas en el espacio.",
  },
  {
    year: "2025",
    image: img2025,
    title: "Detalles finales",
    text: "Revestimientos, nivelación del terreno, seguridad y primeras compras clave.",
  },
  {
    year: "2026",
    image: img2026,
    title: "Calypso abre sus puertas",
    text: "Se completa el equipamiento, se afinan los detalles, se construye el portón artesanal, se realizan los trámites necesarios y finalmente Calypso abre sus puertas.",
  },
];

const memorialImages = [
  {
    image: cipreses1,
    alt: "Vista de los cipreses originales de Calypso al atardecer",
    label: "Los cuatro cipreses",
  },
  {
    image: cipreses2,
    alt: "Cipreses que forman parte de la historia de Calypso",
    label: "Un símbolo que permanece",
  },
];

// Las originales se reservan para la galería ampliada.
function getPreviewSources(src: string) {
  const widths = src.includes("/timeline/") ? [480, 960] : [640, 1280];
  const variant = (width: number) =>
    src.replace(/([^/]+)\.webp$/, `optimized/$1-${width}.webp`);

  return {
    src: variant(widths[0]),
    srcSet: widths.map((width) => `${variant(width)} ${width}w`).join(", "),
  };
}

export default function NuestraHistoria() {
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<
    number | null
  >(null);

  const selectedTimelineItem =
    selectedTimelineIndex !== null ? timeline[selectedTimelineIndex] : null;

  const closeTimelineModal = () => {
    setSelectedTimelineIndex(null);
  };

  const showPreviousTimelineImage = () => {
    setSelectedTimelineIndex((current) => {
      if (current === null) return current;
      return current === 0 ? timeline.length - 1 : current - 1;
    });
  };

  const showNextTimelineImage = () => {
    setSelectedTimelineIndex((current) => {
      if (current === null) return current;
      return current === timeline.length - 1 ? 0 : current + 1;
    });
  };

  useEffect(() => {
    if (selectedTimelineIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTimelineModal();
      if (event.key === "ArrowLeft") showPreviousTimelineImage();
      if (event.key === "ArrowRight") showNextTimelineImage();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTimelineIndex]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper pt-28 font-texto text-ink lg:pt-32">
      <section className="relative mx-auto max-w-[1440px] px-5 pb-20 sm:px-10 lg:px-14 lg:pb-28 xl:px-20">
        <a
          href="/"
          className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 transition hover:text-calypso-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </a>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-calypso-700">
              <Sparkles size={14} />
              Nuestra historia
            </div>

            <h1 className="mt-5 font-titular font-normal text-5xl leading-[0.96] tracking-tight text-ink md:text-7xl">
              Una historia construida con tiempo
              <span className="text-calypso">.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Hay lugares que se construyen con materiales. Y hay otros que se
              construyen con tiempo, paciencia y sueños.{" "}
              <b>Calypso pertenece a estos últimos.</b>
            </p>
          </div>

          <PhotoCard
            src={historia1}
            priority
            alt="Primeros años del terreno en El Pinar"
            label="El comienzo"
            title="El Pinar Norte"
            className="min-h-[420px]"
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: circOut }}
          className="mt-20 grid gap-8 lg:mt-28 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch"
        >
          <div className="rounded-md border border-ink/15 bg-paper p-7  sm:p-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-paper-deep text-calypso-700">
              <Trees size={25} />
            </div>

            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-calypso-700">
              1982
            </div>

            <h2 className="mt-3 font-titular font-normal text-4xl text-ink">
              El primer paso
              <span className="text-calypso">.</span>
            </h2>

            <div className="mt-6 space-y-5 leading-relaxed text-ink-soft">
              <p>
                Todo empezó en 1982, cuando Julio, con apenas 18 años, compró un
                terreno en una zona donde prácticamente no había nada. El Pinar
                Norte era tranquilidad, dunas y futuro.
              </p>

              <p>
                Y él, sin saberlo, estaba dando el primer paso de algo mucho más
                grande que una barbacoa.
              </p>

              <p>
                Durante años, cada avance fue fruto del esfuerzo. Cada ladrillo,
                cada mejora, cada decisión implicaba trabajo, sacrificio y
                constancia.
              </p>

              <p>
                No era solo construir… era apostar a un lugar propio, a un
                espacio que algún día iba a tener vida.
              </p>
            </div>
          </div>

          <div className="grid gap-7">
            <PhotoCard
              src={historia2}
              alt="Construcción inicial de la barbacoa en El Pinar"
              label="Primeras etapas"
              title="Un lugar propio"
              className="min-h-[260px]"
            />

            <PhotoCard
              src={historia3}
              alt="Julio trabajando en la construcción"
              label="Esfuerzo"
              title="Cada ladrillo"
              className="min-h-[260px]"
            />
          </div>
        </motion.section>

        <section className="mt-20 grid gap-8 lg:mt-28 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <PhotoCard
            src={historia4}
            alt="Recuerdos familiares en El Pinar"
            label="Familia"
            title="Un refugio"
            className="min-h-[480px]"
          />

          <div className="rounded-md border border-ink/15 bg-paper p-7  sm:p-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-paper-deep text-calypso-700">
              <HeartHandshake size={25} />
            </div>

            <h2 className="mt-6 font-titular font-normal text-4xl text-ink">
              Un lugar de encuentro
              <span className="text-calypso">.</span>
            </h2>

            <div className="mt-6 space-y-5 leading-relaxed text-ink-soft">
              <p>
                A los 34 años, después de mucho camino recorrido, la barbacoa
                finalmente tomó forma. En ese momento, Julio ya había formado
                pareja con Mónica, y juntos comenzaron una nueva etapa en
                Montevideo, donde construyeron su vida, su familia y su día a
                día.
              </p>

              <p>
                Con el paso de los años, nacieron Santiago y Romina, y ese
                terreno en El Pinar se transformó en algo especial: un lugar de
                encuentro. Un escape. Un refugio.
              </p>

              <p>
                Mientras la ciudad marcaba el ritmo de la rutina, El Pinar era
                pausa. Era familia. Era recuerdos.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-8 lg:mt-28 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="rounded-md border border-night-line bg-night p-7 text-paper  sm:p-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-calypso/15 text-calypso">
              <Hammer size={25} />
            </div>

            <h2 className="mt-6 font-titular font-normal text-4xl text-white">
              Una idea esperando su momento
              <span className="text-calypso">.</span>
            </h2>

            <div className="mt-6 space-y-5 leading-relaxed text-paper/80">
              <p>
                Pero había una idea que siempre volvía. Algo que estaba ahí,
                esperando su momento.
              </p>

              <p>
                Julio siempre supo que ese espacio tenía un potencial distinto.
                Durante años imaginó mil posibilidades: una barbacoa, una
                posada, apartamentos, un salón… algo que le diera vida al fondo
                del terreno.
              </p>

              <p className="font-medium text-white">
                Solo que, como muchas cosas importantes, necesitaba tiempo. Y
                ese momento finalmente llegó.
              </p>
            </div>
          </div>

          <PhotoCard
            src={historia5}
            alt="Vista actual del espacio exterior de Calypso"
            label="El espacio"
            title="La idea toma forma"
            className="min-h-[440px]"
          />
        </section>

        <section className="mt-20 overflow-hidden lg:mt-28 rounded-md border border-ink/15 bg-paper ">
          <div className="border-b border-ink/15 px-7 py-7 sm:px-10">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-calypso-700">
              El nacimiento de Calypso
            </div>

            <h2 className="mt-3 font-titular font-normal text-4xl text-ink">
              Desde 2018, el sueño tomó forma real
              <span className="text-calypso">.</span>
            </h2>

            <p className="mt-3 max-w-2xl text-ink-soft">
              Año a año, el espacio empezó a transformarse hasta convertirse en
              el salón de eventos que hoy abre sus puertas.
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-3">
            {timeline.map((item, index) => (
              <motion.article
                key={item.year}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.04,
                  ease: circOut,
                }}
                className="group overflow-hidden rounded-md border border-night-line bg-night transition-colors hover:border-calypso-700"
              >
                <button
                  type="button"
                  onClick={() => setSelectedTimelineIndex(index)}
                  className="relative block h-56 w-full overflow-hidden bg-night text-left"
                  aria-label={`Ver imagen ampliada de ${item.year}`}
                >
                  <img
                    {...getPreviewSources(item.image)}
                    sizes="(min-width: 1440px) 380px, (min-width: 1024px) 30vw, 100vw"
                    loading="lazy"
                    decoding="async"
                    alt={`${item.year} - ${item.title}`}
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/26 to-black/6" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/55 to-transparent" />

                  <div className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                    <Maximize2 size={17} />
                  </div>

                  <div className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                    {item.year}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                    <h3 className="font-titular font-normal text-2xl text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.95)]">
                      {item.title}
                    </h3>
                  </div>
                </button>

                <div className="p-5">
                  <p className="text-sm leading-relaxed text-paper/80">
                    {item.text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-20 overflow-hidden lg:mt-28 rounded-md border border-ink/15 bg-paper-deep/40 ">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative min-h-[520px] overflow-hidden bg-night">
              <div className="grid h-full min-h-[520px] grid-rows-2">
                {memorialImages.map((item) => (
                  <div
                    key={item.label}
                    className="group relative overflow-hidden"
                  >
                    <img
                      {...getPreviewSources(item.image)}
                      sizes="(min-width: 1440px) 600px, (min-width: 1024px) 45vw, 100vw"
                      loading="lazy"
                      decoding="async"
                      alt={item.alt}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 rounded-full border border-white/18 bg-black/45 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative p-7 sm:p-10 lg:p-12">

              <div className="relative">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-calypso-700">
                  <Trees size={14} />
                  Memorial
                </div>

                <h2 className="mt-5 font-titular font-normal text-4xl leading-tight text-ink md:text-5xl">
                  Y también están ellos
                  <span className="text-calypso">.</span>
                </h2>

                <div className="mt-7 space-y-5 leading-relaxed text-ink-soft">
                  <p>
                    Durante muchos años, cuatro cipreses piramidales acompañaron
                    silenciosamente la historia de este lugar. Fueron plantados
                    en 1998, mucho antes de que Calypso existiera como proyecto,
                    y crecieron junto a nuestra familia, viendo pasar veranos,
                    encuentros, obras, sueños y etapas de la vida.
                  </p>

                  <p>
                    En mayo de 2026 tuvimos que tomar una decisión difícil: los
                    árboles estaban comenzando a comprometer la estructura del
                    techo y, para poder cuidar el futuro de Calypso, debimos
                    despedirnos de ellos.
                  </p>

                  <p className="font-medium text-ink">
                    Pero hay cosas que no desaparecen cuando forman parte de una
                    historia.
                  </p>

                  <p>
                    Por eso los cuatro pinos siguen presentes en nuestro logo,
                    como símbolo de todo el camino recorrido. Y también por eso
                    plantamos cuatro nuevos cipreses de la misma especie,
                    pequeños todavía, para que continúen el legado de los
                    originales y sigan creciendo junto a este lugar, como lo
                    hicieron aquellos primeros cuatro durante casi tres décadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 overflow-hidden lg:mt-28 rounded-md border border-night-line bg-night text-paper ">
          <div className="p-7 sm:p-10">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-calypso">
              Hoy
            </div>

            <h2 className="mt-3 font-titular font-normal text-4xl text-white">
              Calypso no es solo un salón de eventos
              <span className="text-calypso">.</span>
            </h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 leading-relaxed text-paper/80">
                <p>Es el resultado de más de 40 años de historia.</p>
                <p>De decisiones postergadas que encontraron su momento.</p>
                <p>
                  De una familia que apostó, incluso cuando no había certezas.
                </p>
                <p>
                  Julio, Mónica, Santiago y Romina eligieron creer. Cada uno de
                  ellos fue una pieza clave en el desarrollo de Calypso.
                </p>
              </div>

              <div className="space-y-4 leading-relaxed text-paper/80">
                <p>
                  Es un lugar pensado para celebrar, pero también para sentirse
                  cómodo, acompañado y tranquilo.
                </p>

                <p>
                  Porque entendemos lo que hay detrás de cada evento: una
                  familia, un momento importante, un recuerdo que no se repite.
                </p>

                <p className="font-medium text-white">
                  Y por eso, cada detalle que hoy ves… alguna vez fue solo una
                  idea.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      {selectedTimelineItem && selectedTimelineIndex !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeTimelineModal}
        >
          <button
            type="button"
            onClick={closeTimelineModal}
            className="absolute right-5 top-5 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
            aria-label="Cerrar imagen ampliada"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPreviousTimelineImage();
            }}
            className="absolute left-4 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:bg-black/75 sm:inline-flex"
            aria-label="Ver imagen anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNextTimelineImage();
            }}
            className="absolute right-4 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:bg-black/75 sm:inline-flex"
            aria-label="Ver imagen siguiente"
          >
            <ChevronRight size={24} />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: circOut }}
            onClick={(event) => event.stopPropagation()}
            className="relative inline-flex max-h-[88vh] max-w-[94vw] flex-col overflow-hidden rounded-md border border-white/14 bg-night shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
          >
            <div className="relative flex max-h-[72vh] max-w-[94vw] items-center justify-center overflow-hidden bg-black/20">
              <img
                src={selectedTimelineItem.image}
                decoding="async"
                alt={`${selectedTimelineItem.year} - ${selectedTimelineItem.title}`}
                className="block max-h-[72vh] max-w-[94vw] object-contain"
              />
            </div>

            <div className="border-t border-white/10 bg-night px-5 py-5 text-white sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-full border border-calypso/35 bg-calypso/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-calypso">
                  {selectedTimelineItem.year}
                </div>

                <div className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-white/50 sm:block">
                  Imagen {selectedTimelineIndex + 1} de {timeline.length}
                </div>
              </div>

              <h3 className="mt-3 font-titular font-normal text-3xl leading-tight text-white sm:text-4xl">
                {selectedTimelineItem.title}
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-paper/80 sm:text-base">
                {selectedTimelineItem.text}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4 text-white sm:hidden">
                <button
                  type="button"
                  onClick={showPreviousTimelineImage}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm transition hover:bg-white/[0.14]"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  {selectedTimelineIndex + 1}/{timeline.length}
                </div>

                <button
                  type="button"
                  onClick={showNextTimelineImage}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 py-2 text-sm transition hover:bg-white/[0.14]"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

function PhotoCard({
  src,
  alt,
  label,
  title,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  label: string;
  title: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-md border border-ink/15 bg-night ",
        className,
      ].join(" ")}
    >
      <img
        {...getPreviewSources(src)}
        sizes="(min-width: 1440px) 640px, (min-width: 1024px) 50vw, 100vw"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night/70 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="inline-block max-w-[92%] border-l-2 border-calypso pl-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-calypso">
            {label}
          </div>

          <div className="mt-2 font-titular font-normal text-2xl leading-tight text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.9)]">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}
