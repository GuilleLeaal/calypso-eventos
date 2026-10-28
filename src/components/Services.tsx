import { BudgetButton } from "./BudgetInquiry";
import { useId, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { CypressMark } from "./home/CypressMark";
import cumpleImg from "../assets/home/servicio-cumpleanos.webp";
import reunionesImg from "../assets/home/servicio-reuniones.webp";
import corporativosImg from "../assets/home/servicio-corporativos.webp";
import especialesImg from "../assets/home/servicio-especiales.webp";

const EXTRAS = [
  "Bebidas a consignación",
  "Menú para adultos",
  "Animador extra",
  "Mozo extra",
  "Uso del parrillero",
  "Leña",
  "Hielo",
];

const services = [
  {
    title: "Cumpleaños",
    summary: "Infantiles y familiares, con juegos, animadores y menú para los chicos.",
    desc: "Celebraciones infantiles y familiares con espacios cómodos, juegos y asistencia para que el evento fluya sin complicaciones.",
    image: cumpleImg,
    imageAlt: "Cumpleaños infantil alrededor de una mesa con torta y globos",
    highlight: "El más pedido",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos",
      "Menú infantil",
      "1 ayudante de cocina",
      "1 mozo",
      "2 animadores",
    ],
  },
  {
    title: "Reuniones",
    summary: "Encuentros familiares o entre amigos, con parrillero y lugar para todos.",
    desc: "Un entorno cálido para encuentros familiares o sociales, con buena distribución y opciones adaptables según la cantidad de invitados.",
    image: reunionesImg,
    imageAlt: "Grupo de amigos jugando al pool en una reunión",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos",
      "Menú infantil",
      "1 ayudante de cocina",
      "1 mozo",
      "2 animadores si hay 25 niños o más",
    ],
  },
  {
    title: "Eventos corporativos",
    summary: "Reuniones de equipo, capacitaciones y jornadas fuera de la oficina.",
    desc: "Espacio funcional para encuentros empresariales, reuniones de equipo, capacitaciones o jornadas corporativas en un ambiente diferente.",
    image: corporativosImg,
    imageAlt: "Equipo de trabajo reunido alrededor de una mesa larga con computadoras",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos para adultos",
      "1 ayudante de cocina",
      "1 mozo",
    ],
  },
  {
    title: "Eventos especiales",
    summary: "Bautismos, aniversarios y celebraciones privadas a medida.",
    desc: "Bautismos, aniversarios y celebraciones privadas con una propuesta flexible para adaptar el espacio al tipo de ocasión.",
    image: especialesImg,
    imageAlt: "Celebración familiar en el jardín de noche, bajo guirnaldas de luces",
    included: [
      "Uso de las instalaciones",
      "Uso de juegos para niños y adultos",
      "Menú infantil",
      "1 ayudante de cocina",
      "1 mozo",
      "2 animadores si hay 25 niños o más",
    ],
  },
];

function whatsappUrlFor(serviceTitle: string) {
  return `https://wa.me/59899372068?text=${encodeURIComponent(
    `¡Hola! Quería consultar por ${serviceTitle.toLowerCase()} en Calypso.`,
  )}`;
}

export default function Services() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      id="services"
      aria-labelledby={`${baseId}-titulo`}
      className="bg-paper py-20 font-texto text-ink lg:py-28"
    >
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16 lg:px-14 xl:px-20">
        <header className="lg:sticky lg:top-28 lg:self-start">
          <CypressMark className="h-9 w-auto text-calypso-700" />

          <h2
            id={`${baseId}-titulo`}
            className="mt-6 font-titular text-[clamp(2.4rem,4.4vw,3.6rem)] font-normal leading-[1] tracking-[-0.01em]"
          >
            Cuatro maneras de usar la barbacoa
          </h2>

          <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink-soft">
            Todas incluyen la barbacoa, los juegos y el equipo de atención. Lo demás
            se suma según la fiesta que tengas en mente.
          </p>
        </header>

        <ol className="border-t border-ink/15">
          {services.map((service, index) => {
            const open = openIndex === index;
            const buttonId = `${baseId}-boton-${index}`;
            const panelId = `${baseId}-panel-${index}`;

            return (
              <li key={service.title} className="border-b border-ink/15">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-7 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700 sm:grid-cols-[3.5rem_1fr_auto] lg:py-8"
                  >
                    <span aria-hidden="true" className="font-titular text-xl text-ink-mute sm:text-2xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>
                      <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                        <span className="font-titular text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.05] transition-colors group-hover:text-calypso-700">
                          {service.title}
                        </span>{" "}
                        {service.highlight && (
                          <span className="rounded-sm border border-brick/40 px-2 py-0.5 text-[13px] font-semibold text-brick">
                            {service.highlight}
                          </span>
                        )}
                      </span>{" "}
                      <span className="mt-2 block max-w-xl text-base leading-relaxed text-ink-soft">
                        {service.summary}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                      className={[
                        "grid h-10 w-10 place-items-center self-center rounded-full border transition-colors",
                        open
                          ? "border-calypso bg-calypso text-ink"
                          : "border-ink/20 group-hover:border-calypso-700 group-hover:text-calypso-700",
                      ].join(" ")}
                    >
                      {open ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!open}
                  className={[
                    "grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-10 sm:grid-cols-[minmax(0,15rem)_1fr] sm:pl-[4.5rem] lg:gap-12">
                      <img
                        src={service.image}
                        alt={service.imageAlt}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[3/4] w-full max-w-[15rem] rounded-sm object-cover"
                      />

                      <div>
                        <p className="max-w-xl text-base leading-relaxed text-ink-soft">
                          {service.desc}
                        </p>

                        <div className="mt-8 grid gap-8 sm:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-semibold text-ink-mute">
                              Incluye
                            </h4>
                            <ul className="mt-3 space-y-2">
                              {service.included.map((item) => (
                                <li key={item} className="flex gap-3 text-[15px] leading-snug">
                                  <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-calypso" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-ink-mute">
                              Se puede sumar
                            </h4>
                            <ul className="mt-3 space-y-2">
                              {EXTRAS.map((item) => (
                                <li key={item} className="flex gap-3 text-[15px] leading-snug text-ink-soft">
                                  <span aria-hidden="true" className="w-1.5 shrink-0 text-center font-semibold text-ink-mute">
                                    +
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
                          <BudgetButton
                            className="group inline-flex items-center justify-center gap-3 rounded-md bg-calypso px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-[#25c3b6]"
                          >
                            Consultar presupuesto
                            <ArrowRight
                              size={18}
                              aria-hidden="true"
                              className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                            />
                          </BudgetButton>
                          <a
                            href={whatsappUrlFor(service.title)}
                            target="_blank"
                            rel="noreferrer"
                            className="self-start font-semibold underline decoration-ink/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-calypso sm:self-auto"
                          >
                            Consultar por WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
