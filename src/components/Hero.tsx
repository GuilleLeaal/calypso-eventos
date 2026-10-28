import { BudgetButton } from "./BudgetInquiry";
import { useEffect, useState } from "react";

import { ArrowRight, Moon, Sun } from "lucide-react";
import { Garland } from "./home/Garland";
import { setHeroMode, useHeroMode, type HeroMode } from "./home/heroMode";
import heroDay1080 from "../assets/home/hero-dia-1080.webp";
import heroDay1440 from "../assets/home/hero-dia-1440.webp";
import heroNight1080 from "../assets/home/hero-noche-1080.webp";
import heroNight1440 from "../assets/home/hero-noche-1440.webp";

const WHATSAPP_VISIT_URL = `https://wa.me/59899372068?text=${encodeURIComponent(
  "¡Hola! Me gustaría coordinar fecha y hora para ir a conocer el salón.",
)}`;

const PHOTOS: Record<
  HeroMode,
  { small: string; large: string; alt: string; caption: string }
> = {
  day: {
    small: heroDay1080,
    large: heroDay1440,
    alt: "Jardín de Calypso Eventos de día, con reposeras frente al salón vidriado",
    caption: "El jardín, a la tarde",
  },
  night: {
    small: heroNight1080,
    large: heroNight1440,
    alt: "Patio de Calypso Eventos de noche, iluminado con guirnaldas de luces",
    caption: "El patio, con las guirnaldas prendidas",
  },
};

const SHIFT_TEXT: Record<HeroMode, string> = {
  day: "Turno día: sábados y domingos, de 11 a 17 h.",
  night: "Turno noche: todos los días, de 17 a 23 h.",
};

const FACTS = [
  { label: "Capacidad", value: "Hasta 50 adultos y 30 niños" },
  { label: "Dónde", value: "El Pinar, Canelones" },
  { label: "Reservas", value: "Con 10 días de anticipación" },
];

export default function Hero() {
  const mode = useHeroMode();
  const isNight = mode === "night";
  const [loadBothPhotos, setLoadBothPhotos] = useState(false);

  // La foto del otro turno se descarga recién cuando la página ya cargó.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setLoadBothPhotos(true), 2500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function selectMode(next: HeroMode) {
    setLoadBothPhotos(true);
    setHeroMode(next);
  }

  return (
    <section
      id="inicio"
      className={[
        "relative min-h-[100svh] pt-16 transition-colors duration-700 lg:pt-[72px]",
        isNight ? "bg-night text-paper" : "bg-paper text-ink",
      ].join(" ")}
    >
      <div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative order-last aspect-[16/9] max-h-[38svh] w-full overflow-hidden sm:aspect-[2/1] lg:aspect-auto lg:max-h-none">
          {(Object.keys(PHOTOS) as HeroMode[]).map((photoMode) => {
            const photo = PHOTOS[photoMode];
            const active = photoMode === mode;

            if (!active && !loadBothPhotos) return null;

            return (
              <img
                key={photoMode}
                src={photo.small}
                srcSet={`${photo.small} 1080w, ${photo.large} 1440w`}
                sizes="(min-width: 1024px) 46vw, 100vw"
                alt={active ? photo.alt : ""}
                aria-hidden={!active}
                fetchPriority={active ? "high" : "low"}
                decoding="async"
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            );
          })}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />

          <p className="absolute bottom-4 left-5 font-texto text-sm text-paper/90 lg:bottom-6 lg:left-8">
            {PHOTOS[mode].caption}
          </p>
        </div>

        <div className="flex flex-col gap-8 px-5 pb-8 pt-10 sm:px-10 lg:justify-center lg:gap-9 lg:px-10 lg:py-12 xl:px-14">
          <div>
            <h1>
              <span
                className={[
                  "block font-texto text-[15px] font-semibold transition-colors duration-700",
                  isNight ? "text-paper/75" : "text-ink-soft",
                ].join(" ")}
              >
                Salón de eventos en El Pinar
              </span>{" "}
              <span className="mt-4 block font-titular text-[clamp(3.1rem,6.3vw,5.7rem)] font-normal leading-[0.94] tracking-[-0.015em]">
                Festejá de{" "}
                <span
                  className={[
                    "transition-colors duration-700",
                    isNight ? "text-paper/30" : "text-calypso-600 underline decoration-calypso decoration-2 underline-offset-[0.14em]",
                  ].join(" ")}
                >
                  día
                </span>{" "}
                <br />o de{" "}
                <span
                  className={[
                    "transition-colors duration-700",
                    isNight
                      ? "text-bulb underline decoration-2 underline-offset-[0.14em]"
                      : "text-ink/30",
                  ].join(" ")}
                >
                  noche
                </span>
                .
              </span>
            </h1>

            <p
              className={[
                "mt-5 max-w-[34rem] font-texto text-base leading-relaxed transition-colors duration-700 sm:text-lg",
                isNight ? "text-paper/80" : "text-ink-soft",
              ].join(" ")}
            >
              Una barbacoa con jardín, salón vidriado, parrillero y juegos en El
              Pinar, Canelones. La construyó una familia, de a poco, desde 2018.
            </p>

            <div className="mt-6">
              <div
                role="group"
                aria-label="Ver la barbacoa de día o de noche"
                className={[
                  "flex w-full rounded-md border p-1 transition-colors duration-700 sm:w-fit",
                  isNight ? "border-night-line" : "border-ink/15",
                ].join(" ")}
              >
                {(
                  [
                    { value: "day", label: "Día", Icon: Sun },
                    { value: "night", label: "Noche", Icon: Moon },
                  ] as const
                ).map(({ value, label, Icon }) => {
                  const active = mode === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectMode(value)}
                      className={[
                        "inline-flex flex-1 items-center justify-center gap-2 rounded-[5px] px-6 py-3 font-texto text-base font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-none sm:py-2.5",
                        active
                          ? isNight
                            ? "bg-paper text-night focus-visible:outline-calypso"
                            : "bg-ink text-paper focus-visible:outline-calypso-700"
                          : isNight
                            ? "text-paper/70 hover:text-paper focus-visible:outline-calypso"
                            : "text-ink-soft hover:text-ink focus-visible:outline-calypso-700",
                      ].join(" ")}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>

              <p
                aria-live="polite"
                className={[
                  "mt-3 font-texto text-[15px] transition-colors duration-700",
                  isNight ? "text-paper/70" : "text-ink-mute",
                ].join(" ")}
              >
                {SHIFT_TEXT[mode]}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
              <BudgetButton
                className={[
                  "group inline-flex items-center justify-center gap-3 rounded-md px-7 py-4 font-texto text-base font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
                  isNight
                    ? "bg-calypso text-ink hover:bg-[#25c3b6] focus-visible:outline-calypso"
                    : "bg-calypso text-ink hover:bg-[#25c3b6] focus-visible:outline-calypso-700",
                ].join(" ")}
              >
                Consultar presupuesto
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </BudgetButton>

              <a
                href={WHATSAPP_VISIT_URL}
                target="_blank"
                rel="noreferrer"
                className={[
                  "inline-flex items-center gap-2 self-start font-texto text-base font-semibold underline decoration-1 underline-offset-[6px] transition-colors duration-300 sm:self-auto",
                  isNight
                    ? "text-paper decoration-paper/40 hover:decoration-calypso"
                    : "text-ink decoration-ink/30 hover:decoration-calypso",
                ].join(" ")}
              >
                Coordinar una visita por WhatsApp
              </a>
            </div>
          </div>

          <dl
            className={[
              "grid gap-5 border-t pt-6 font-texto sm:grid-cols-3 sm:gap-8 transition-colors duration-700",
              isNight ? "border-night-line" : "border-ink/15",
            ].join(" ")}
          >
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt
                  className={[
                    "text-sm transition-colors duration-700",
                    isNight ? "text-paper/55" : "text-ink-mute",
                  ].join(" ")}
                >
                  {fact.label}
                </dt>
                <dd className="mt-1 text-base font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Garland
        lit={isNight}
        spans={3}
        className="pointer-events-none absolute inset-x-0 top-16 h-auto sm:hidden"
      />
      <Garland
        lit={isNight}
        spans={8}
        className="pointer-events-none absolute inset-x-0 top-16 hidden h-auto sm:block lg:top-[72px]"
      />
    </section>
  );
}
