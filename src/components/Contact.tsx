import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { motion, circOut } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { getEarliestReservationDate } from "../lib/reservations";

const PHONE = "59899372068";
const FIRST_RESERVATION_DATE = "2026-07-01";
const MAX_CHILDREN_COUNT = 30;
const MAX_ADULTS_COUNT = 50;

const eventTypes = [
  "Cumpleaños",
  "Reunión familiar",
  "Evento corporativo",
  "Otro tipo de evento",
  "Consulta general",
];

type AvailabilityStatus = "idle" | "loading" | "available" | "occupied" | "disabled" | "error";

type AvailabilityState = {
  status: AvailabilityStatus;
  message: string;
};

type ReservationBlock = {
  id?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
};

type DisabledReservationDate = {
  id: string;
  reason: string | null;
};

function getMinContactDate() {
  const today = getEarliestReservationDate();
  return today > FIRST_RESERVATION_DATE ? today : FIRST_RESERVATION_DATE;
}

function formatDateForMessage(dateValue: string) {
  if (!dateValue) return "No indicada";

  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;

  return `${day}/${month}/${year}`;
}

function formatTimeLabel(time?: string) {
  if (!time) return "";
  return time.slice(0, 5);
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    eventType: "",
    date: "",
    childrenCount: "",
    adultsCount: "",
    message: "",
  });

  const [formError, setFormError] = useState("");
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    if (!form.date) {
      setAvailability({ status: "idle", message: "" });
      return;
    }

    let ignore = false;

    async function checkDateAvailability() {
      setAvailability({
        status: "loading",
        message: "Consultando disponibilidad de la fecha...",
      });

      try {
        const [blocksResult, disabledResult] = await Promise.all([
          supabase.rpc("get_public_reservation_blocks", {
            target_date: form.date,
          }),
          supabase
            .from("disabled_reservation_dates")
            .select("id, reason")
            .lte("start_date", form.date)
            .gte("end_date", form.date)
            .limit(1),
        ]);

        if (ignore) return;

        if (blocksResult.error) {
          throw blocksResult.error;
        }

        if (disabledResult.error) {
          throw disabledResult.error;
        }

        const disabledDates = (disabledResult.data ?? []) as DisabledReservationDate[];

        if (disabledDates.length > 0) {
          const reason = disabledDates[0]?.reason?.trim();
          setAvailability({
            status: "disabled",
            message: reason
              ? `La fecha seleccionada figura inhabilitada. Motivo: ${reason}. De todas formas podés enviar la consulta y te confirmaremos por WhatsApp.`
              : "La fecha seleccionada figura inhabilitada. De todas formas podés enviar la consulta y te confirmaremos por WhatsApp.",
          });
          return;
        }

        const blocks = (blocksResult.data ?? []) as ReservationBlock[];

        if (blocks.length > 0) {
          const timeLabels = blocks
            .map((block) => {
              const start = formatTimeLabel(block.start_time);
              const end = formatTimeLabel(block.end_time);
              return start && end ? `${start} a ${end}` : "";
            })
            .filter(Boolean);

          setAvailability({
            status: "occupied",
            message:
              timeLabels.length > 0
                ? `La fecha seleccionada ya tiene reservas o solicitudes en estos horarios: ${timeLabels.join(", ")}. Podés enviar la consulta igual y te confirmaremos disponibilidad por WhatsApp.`
                : "La fecha seleccionada ya tiene reservas o solicitudes. Podés enviar la consulta igual y te confirmaremos disponibilidad por WhatsApp.",
          });
          return;
        }

        setAvailability({
          status: "available",
          message: "La fecha seleccionada no figura ocupada actualmente.",
        });
      } catch (error) {
        if (ignore) return;

        console.error("Error checking contact date availability:", error);
        setAvailability({
          status: "error",
          message:
            "No pudimos consultar la disponibilidad de esta fecha ahora. Podés enviar la consulta igual y te responderemos por WhatsApp.",
        });
      }
    }

    checkDateAvailability();

    return () => {
      ignore = true;
    };
  }, [form.date]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      { key: "name", label: "Nombre y apellido" },
      { key: "whatsapp", label: "Celular" },
      { key: "email", label: "Email" },
      { key: "eventType", label: "Tipo de evento" },
      { key: "date", label: "Fecha tentativa" },
      { key: "childrenCount", label: "Cantidad de niños" },
      { key: "adultsCount", label: "Cantidad de adultos" },
      { key: "message", label: "Mensaje" },
    ] as const;

    const emptyFields = requiredFields.filter(
      (field) => !form[field.key].trim(),
    );

    if (emptyFields.length > 0) {
      setFormError("Por favor, completá todos los campos antes de enviar.");
      return;
    }

    if (form.date < getMinContactDate()) {
      setFormError("Seleccioná una fecha con al menos 10 días de anticipación.");
      return;
    }

    const childrenCount = Number(form.childrenCount);
    const adultsCount = Number(form.adultsCount);

    if (!Number.isInteger(childrenCount) || childrenCount < 0 || childrenCount > MAX_CHILDREN_COUNT) {
      setFormError(`La cantidad de niños debe ser entre 0 y ${MAX_CHILDREN_COUNT}.`);
      return;
    }

    if (!Number.isInteger(adultsCount) || adultsCount < 0 || adultsCount > MAX_ADULTS_COUNT) {
      setFormError(`La cantidad de adultos debe ser entre 0 y ${MAX_ADULTS_COUNT}.`);
      return;
    }

    const availabilityLine = availability.message
      ? `\nEstado de la fecha según la web: ${availability.message}\n`
      : "";

    const text = encodeURIComponent(
      `¡Hola! Me gustaría consultar por un evento en Calypso.

Nombre: ${form.name.trim()}
WhatsApp: ${form.whatsapp.trim()}
Email: ${form.email.trim()}
Tipo de evento: ${form.eventType.trim()}
Fecha tentativa: ${formatDateForMessage(form.date.trim())}${availabilityLine}
Cantidad de niños: ${form.childrenCount.trim()}
Cantidad de adultos: ${form.adultsCount.trim()}

Idea del evento:
${form.message.trim()}`,
    );

    window.open(
      `https://wa.me/${PHONE}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const quickWhatsapp = encodeURIComponent(
    "¡Hola! Me gustaría coordinar fecha y hora para ir a conocer el salón.",
  );

  return (
    <main
      id="contact"
      className="relative overflow-hidden bg-paper pb-10 pt-28 font-texto text-ink sm:pb-12 lg:pt-32"
    >
      {/* Decoración sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-calypso/5 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-140px] h-80 w-80 rounded-full bg-bulb/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="min-w-0 space-y-8 lg:space-y-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: circOut }}
              className="max-w-3xl border-l-2 border-calypso pl-6 sm:pl-8"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-calypso-700">
                <Mail size={15} />
                Contacto
              </div>

              <h1 className="mt-5 font-titular text-[clamp(2.75rem,4.5vw,4.25rem)] font-normal leading-[1.05] tracking-[-0.025em] text-ink">
                Hablemos de{" "}
                <span className="inline-block text-calypso-700">
                  tu evento
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
                Contanos qué tenés en mente y te respondemos por WhatsApp para
                coordinar disponibilidad, visita y detalles del salón.
              </p>
            </motion.div>

            {/* Contacto simple */}
            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: circOut }}
              className="relative overflow-hidden rounded-sm border border-night-line bg-night p-7 text-paper sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-90px] top-[-90px] h-64 w-64 rounded-full bg-calypso/10 blur-3xl" />
                <div className="absolute left-[-100px] bottom-[-120px] h-64 w-64 rounded-full bg-bulb/5 blur-3xl" />
              </div>

              <div className="relative">
                <h2 className="font-titular text-3xl font-normal leading-tight sm:text-4xl">
                  Contacto directo
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/75">
                  La forma más rápida de consultar es por WhatsApp. También podés
                  completar el formulario y se abre el mensaje listo para enviar.
                </p>

                <div className="mt-8 space-y-6 border-y border-night-line py-7">
                  <ContactLine
                    icon={MessageCircle}
                    label="WhatsApp"
                    value="+598 99 372 068"
                    href={`https://wa.me/${PHONE}?text=${quickWhatsapp}`}
                  />

                  <ContactLine
                    icon={MapPin}
                    label="Ubicación"
                    value="El Pinar, Ciudad de la Costa, Canelones"
                    href="/#location"
                  />

                  <ContactLine
                    icon={CalendarDays}
                    label="Visitas"
                    value="Coordinación previa"
                  />
                </div>

                <a
                  href={`https://wa.me/${PHONE}?text=${quickWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-calypso px-5 py-4 text-sm font-semibold text-night transition hover:bg-calypso-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-300"
                >
                  Escribinos por WhatsApp
                  <ArrowUpRight
                    size={17}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>
            </motion.aside>
          </div>

          {/* Formulario */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06, ease: circOut }}
            className="min-w-0 border-t border-ink/20 pt-7 lg:pt-8"
          >
            <div className="flex flex-col gap-3 border-b border-ink/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-titular text-3xl font-normal text-ink sm:text-4xl">
                  Enviá tu consulta
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Completá los datos básicos y seguimos por WhatsApp.
                </p>
              </div>

              <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-calypso-700/20 text-calypso-700 sm:grid">
                <Send size={18} />
              </div>
            </div>

            <div className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Nombre y apellido">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="input-contact"
                />
              </Field>

              <Field label="Celular">
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Ej: 099123456"
                  className="input-contact"
                />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="input-contact"
                />
              </Field>

              <Field label="Tipo de evento">
                <select
                  name="eventType"
                  value={form.eventType}
                  onChange={handleChange}
                  className="input-contact"
                >
                  <option value="">Seleccioná una opción</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fecha tentativa" full>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={getMinContactDate()}
                  className="input-contact"
                />
              </Field>

              <AvailabilityNotice availability={availability} />

              <Field label="Cantidad de niños">
                <input
                  type="number"
                  name="childrenCount"
                  value={form.childrenCount}
                  onChange={handleChange}
                  min="0"
                  max={MAX_CHILDREN_COUNT}
                  inputMode="numeric"
                  placeholder="Ej: 15"
                  className="input-contact"
                />
              </Field>

              <Field label="Cantidad de adultos">
                <input
                  type="number"
                  name="adultsCount"
                  value={form.adultsCount}
                  onChange={handleChange}
                  min="0"
                  max={MAX_ADULTS_COUNT}
                  inputMode="numeric"
                  placeholder="Ej: 40"
                  className="input-contact"
                />
              </Field>

              <Field label="Mensaje" full>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Contanos tipo de celebración, necesidades especiales o cualquier detalle importante."
                  className="input-contact resize-none"
                />
              </Field>
            </div>

            {formError && (
              <div role="alert" className="mt-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-calypso-700 px-5 py-4 text-sm font-semibold text-white transition hover:bg-calypso-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700"
            >
              <Send size={18} />
              Enviar por WhatsApp
              <ArrowUpRight
                size={17}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-ink-mute">
              El botón abre WhatsApp con tu consulta lista para enviar. Al
              enviar tu mensaje, aceptás que Calypso Eventos utilice los datos
              proporcionados para responder tu consulta y coordinar
              disponibilidad. Ver{" "}
              <a
                href="/privacidad"
                className="font-semibold text-calypso-700 underline underline-offset-4 transition hover:text-calypso-900"
              >
                Política de privacidad
              </a>
              .
            </p>
          </motion.form>
        </div>
      </div>
    </main>
  );
}

function AvailabilityNotice({ availability }: { availability: AvailabilityState }) {
  if (availability.status === "idle") return null;

  const isPositive = availability.status === "available";
  const isLoading = availability.status === "loading";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sm:col-span-2 rounded-sm border px-4 py-3 text-sm leading-relaxed ${
        isPositive
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : isLoading
            ? "border-ink/20 bg-paper-deep/40 text-ink-mute"
            : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">
          {isLoading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : isPositive ? (
            <CheckCircle2 size={17} />
          ) : (
            <AlertCircle size={17} />
          )}
        </div>
        <p>{availability.message}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  full = false,
  children,
}: {
  label: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={full ? "sm:col-span-2" : ""}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-night-line text-calypso-300">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bulb">
          {label}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-paper/90">{value}</p>
      </div>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3">{content}</div>;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="group flex items-center gap-3 rounded-sm transition hover:text-calypso-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-300"
    >
      {content}
    </a>
  );
}
