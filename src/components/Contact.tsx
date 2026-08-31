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

function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinContactDate() {
  const today = getTodayInputValue();
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
      setFormError("Seleccioná una fecha tentativa válida.");
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
    <section
      id="contact"
      className="relative overflow-hidden bg-[#f6f0e7] py-24"
    >
      {/* Decoración sutil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-[#0BB3A6]/10 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-140px] h-80 w-80 rounded-full bg-[#e8c17f]/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: circOut }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0BB3A6]/35 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087d75] shadow-[0_10px_28px_rgba(63,42,28,0.06)]">
            <Mail size={15} />
            Contacto
          </div>

          <h2 className="mt-5 font-display text-4xl leading-[1.02] tracking-tight text-[#2f241e] sm:text-5xl md:text-6xl">
            Hablemos de{" "}
            <span className="relative inline-block text-[#0BB3A6]">
              tu evento
              <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4a382e] md:text-lg">
            Contanos qué tenés en mente y te respondemos por WhatsApp para
            coordinar disponibilidad, visita y detalles del salón.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-7 lg:grid-cols-[0.88fr_1.12fr]">
          {/* Contacto simple */}
          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
            className="relative overflow-hidden rounded-[1.8rem] bg-[#17110d] p-7 text-white shadow-[0_24px_70px_rgba(63,42,28,0.18)]"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-[-90px] top-[-90px] h-64 w-64 rounded-full bg-[#0BB3A6]/18 blur-3xl" />
              <div className="absolute left-[-100px] bottom-[-120px] h-64 w-64 rounded-full bg-[#e8c17f]/12 blur-3xl" />
            </div>

            <div className="relative">
              <h3 className="font-display text-3xl leading-tight">
                Contacto directo
              </h3>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/68">
                La forma más rápida de consultar es por WhatsApp. También podés
                completar el formulario y se abre el mensaje listo para enviar.
              </p>

              <div className="mt-8 space-y-5">
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
                className="group mt-9 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.09em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.24)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
              >
                Escribinos por WhatsApp
                <ArrowUpRight
                  size={17}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </motion.aside>

          {/* Formulario */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06, ease: circOut }}
            className="rounded-[1.8rem] border border-[#e1c9a6] bg-[#fff9f0]/82 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur md:p-7"
          >
            <div className="flex flex-col gap-3 border-b border-[#e4cfad] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-3xl text-[#2f241e]">
                  Enviá tu consulta
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                  Completá los datos básicos y seguimos por WhatsApp.
                </p>
              </div>

              <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] sm:grid">
                <Send size={18} />
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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

              <Field label="Fecha tentativa">
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
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
            >
              <Send size={18} />
              Enviar por WhatsApp
              <ArrowUpRight
                size={17}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#6d5748]">
              El botón abre WhatsApp con tu consulta lista para enviar. Al
              enviar tu mensaje, aceptás que Calypso Eventos utilice los datos
              proporcionados para responder tu consulta y coordinar
              disponibilidad. Ver{" "}
              <a
                href="/privacidad"
                className="font-semibold text-[#087d75] underline underline-offset-4 transition hover:text-[#0BB3A6]"
              >
                Política de privacidad
              </a>
              .
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function AvailabilityNotice({ availability }: { availability: AvailabilityState }) {
  if (availability.status === "idle") return null;

  const isPositive = availability.status === "available";
  const isLoading = availability.status === "loading";

  return (
    <div
      className={`sm:col-span-2 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
        isPositive
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : isLoading
            ? "border-[#e4cfad] bg-white/65 text-[#6d5748]"
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
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
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
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/13 text-[#7ff3e9]">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c17f]">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-white/82">{value}</p>
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
      className="group flex items-center gap-3 transition hover:translate-x-1"
    >
      {content}
    </a>
  );
}
