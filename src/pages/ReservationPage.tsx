import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  formatDateForDisplay,
  getAvailableSlots,
  getSlotsForDate,
  getTodayInputValue,
  isWeekend,
  type ReservationBlock,
  type ReservationSlot,
} from "../lib/reservations";

const PHONE = "59899372068";
const FIRST_RESERVATION_DATE = "2026-07-01";

const EVENT_TYPES = [
  "Cumpleaños infantil",
  "Cumpleaños familiar",
  "Reunión familiar",
  "Evento corporativo",
  "Bautismo",
  "Aniversario",
  "Evento especial",
  "Otro",
];

const DISCOVERY_OPTIONS = [
  "Instagram",
  "Facebook",
  "Google",
  "Ya hice un evento antes",
  "Fui a un evento en Calypso",
  "Alguien me contó sobre Calypso",
  "Pasé por el lugar",
  "Otro",
];

function getMinReservationDate() {
  const today = getTodayInputValue();
  return today > FIRST_RESERVATION_DATE ? today : FIRST_RESERVATION_DATE;
}

function createLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getCalendarDays(monthDate: Date) {
  const start = getMonthStart(monthDate);
  const end = getMonthEnd(monthDate);

  const days: Date[] = [];

  const firstCalendarDay = new Date(start);
  firstCalendarDay.setDate(start.getDate() - start.getDay());

  const lastCalendarDay = new Date(end);
  lastCalendarDay.setDate(end.getDate() + (6 - end.getDay()));

  const current = new Date(firstCalendarDay);

  while (current <= lastCalendarDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState(getMinReservationDate());
  const [blocks, setBlocks] = useState<ReservationBlock[]>([]);
  const [monthBlocks, setMonthBlocks] = useState<ReservationBlock[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    createLocalDate(getMinReservationDate())
  );

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingMonthBlocks, setLoadingMonthBlocks] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ReservationSlot | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    eventType: "",
    phone: "",
    email: "",
    discoverySource: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const allSlots = useMemo(() => {
    return getSlotsForDate(selectedDate);
  }, [selectedDate]);

  const availableSlots = useMemo(() => {
    return getAvailableSlots(selectedDate, blocks);
  }, [selectedDate, blocks]);

  const daySlots = allSlots.filter((slot) => slot.period === "day");
  const nightSlots = allSlots.filter((slot) => slot.period === "night");

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!selectedDate) return;

      setLoadingSlots(true);
      setSelectedSlot(null);
      setError("");

      const { data, error: rpcError } = await supabase.rpc(
        "get_public_reservation_blocks",
        {
          target_date: selectedDate,
        }
      );

      if (rpcError) {
        console.error("Error fetching reservation blocks:", rpcError);
        setBlocks([]);
        setError("No pudimos consultar disponibilidad. Intentá nuevamente.");
      } else {
        setBlocks((data || []) as ReservationBlock[]);
      }

      setLoadingSlots(false);
    };

    fetchBlocks();
  }, [selectedDate]);

  useEffect(() => {
    const fetchMonthBlocks = async () => {
      const start = toInputDate(getMonthStart(calendarMonth));
      const end = toInputDate(getMonthEnd(calendarMonth));

      setLoadingMonthBlocks(true);

      const { data, error: rpcError } = await supabase.rpc(
        "get_public_reservation_blocks_range",
        {
          start_date: start,
          end_date: end,
        }
      );

      if (rpcError) {
        console.error("Error fetching month reservation blocks:", rpcError);
        setMonthBlocks([]);
      } else {
        setMonthBlocks((data || []) as ReservationBlock[]);
      }

      setLoadingMonthBlocks(false);
    };

    fetchMonthBlocks();
  }, [calendarMonth]);

  const selectedDateLabel = useMemo(() => {
    return formatDateForDisplay(selectedDate);
  }, [selectedDate]);

  const selectedSlotLabel = selectedSlot
    ? `${selectedDateLabel}, de ${selectedSlot.label}`
    : "";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (!selectedSlot) {
      setError("Seleccioná un horario disponible.");
      return;
    }

    if (!form.customerName.trim()) {
      setError("Ingresá tu nombre.");
      return;
    }

    if (!form.eventType.trim()) {
      setError("Seleccioná qué estás festejando.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Ingresá un teléfono de contacto.");
      return;
    }

    if (!form.discoverySource.trim()) {
      setError("Indicá cómo conociste Calypso.");
      return;
    }

    setSubmitting(true);

    const { error: createError } = await supabase.rpc(
      "create_public_reservation",
      {
        p_customer_name: form.customerName,
        p_event_type: form.eventType,
        p_phone: form.phone,
        p_email: form.email,
        p_event_date: selectedDate,
        p_start_time: selectedSlot.startTime,
        p_end_time: selectedSlot.endTime,
        p_discovery_source: form.discoverySource,
      }
    );

    setSubmitting(false);

    if (createError) {
      console.error("Error creating reservation:", createError);
      setError(
        createError.message ||
          "No pudimos crear la solicitud. Intentá nuevamente."
      );
      return;
    }

    const whatsappText = encodeURIComponent(
      `¡Hola! Me gustaría hacer una reserva para el ${selectedDateLabel}, de ${selectedSlot.label}, ¿cuándo podría ir a conocer el salón?`
    );

    setSent(true);

    window.open(
      `https://wa.me/${PHONE}?text=${whatsappText}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#f6f0e7] pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-130px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/12 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
        <div className="absolute left-0 top-0 h-72 w-72 opacity-[0.08] [background-image:radial-gradient(#0BB3A6_1.2px,transparent_1.2px)] [background-size:15px_15px]" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: circOut }}
          className="mb-9"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#087d75] transition hover:text-[#0BB3A6]"
          >
            <ArrowLeft size={17} />
            Volver al sitio
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#0BB3A6]/35 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087d75] shadow-[0_10px_28px_rgba(63,42,28,0.05)]">
            <Sparkles size={15} />
            Reserva de fecha
          </div>

          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.02] tracking-tight text-[#2f241e] md:text-6xl">
            Elegí una fecha disponible para{" "}
            <span className="relative inline-block text-[#0BB3A6]">
              tu evento
              <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
            </span>
            .
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4a382e] md:text-lg">
            Las reservas pueden solicitarse a partir del 1 de julio. La solicitud
            mantiene la fecha durante 48 horas. No implica compromiso de pago. La
            reserva se confirma luego de coordinar por WhatsApp y realizar la
            seña.
          </p>
        </motion.div>

        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.04, ease: circOut }}
            className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/82 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.11)] backdrop-blur md:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e4cfad] pb-5">
              <div>
                <h2 className="font-display text-3xl text-[#2f241e]">
                  Disponibilidad
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                  Seleccioná una fecha y luego un horario disponible.
                </p>
              </div>

              <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] sm:grid">
                <CalendarDays size={20} />
              </div>
            </div>

            <div className="mt-6">
              <span className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Fecha
              </span>

              <ReservationCalendar
                selectedDate={selectedDate}
                calendarMonth={calendarMonth}
                monthBlocks={monthBlocks}
                loading={loadingMonthBlocks}
                minDate={getMinReservationDate()}
                onMonthChange={setCalendarMonth}
                onSelectDate={(dateValue) => {
                  setSelectedDate(dateValue);
                  setSelectedSlot(null);
                }}
              />
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-[#e4cfad] bg-white/45 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0BB3A6]" />
                <p className="text-sm leading-relaxed text-[#5c473b]">
                  Todos los horarios incluyen media hora previa para llegada y
                  preparación, y media hora posterior para salida.
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl text-[#2f241e]">
                  Horarios
                </h3>

                {loadingSlots && (
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-[#087d75]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Consultando
                  </div>
                )}
              </div>

              {!loadingSlots &&
                allSlots.length > 0 &&
                availableSlots.length === 0 && (
                  <div className="mt-5 rounded-[1.2rem] border border-[#dfc8ab] bg-white/52 p-5 text-sm leading-relaxed text-[#5c473b]">
                    No quedan horarios disponibles para esta fecha. Probá con
                    otro día.
                  </div>
                )}

              {!loadingSlots && allSlots.length > 0 && (
                <div className="mt-5 space-y-6">
                  {isWeekend(selectedDate) && daySlots.length > 0 && (
                    <SlotGroup
                      title="Turno diurno"
                      slots={daySlots}
                      availableSlots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSelect={setSelectedSlot}
                    />
                  )}

                  {nightSlots.length > 0 && (
                    <SlotGroup
                      title={
                        isWeekend(selectedDate)
                          ? "Turno nocturno"
                          : "Turno noche"
                      }
                      slots={nightSlots}
                      availableSlots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSelect={setSelectedSlot}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: circOut }}
            className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/82 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.11)] backdrop-blur md:p-7"
          >
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6]">
                  <CheckCircle2 size={34} />
                </div>

                <h2 className="mt-5 font-display text-3xl text-[#2f241e]">
                  Solicitud creada
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5c473b]">
                  Se abrió WhatsApp para continuar la coordinación. La fecha
                  queda retenida por 48 horas hasta confirmar la seña.
                </p>

                <Link
                  to="/"
                  className="group mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#0BB3A6] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.09em] text-white shadow-[0_16px_38px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
                >
                  Volver al sitio
                  <ArrowUpRight
                    size={16}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-start justify-between gap-4 border-b border-[#e4cfad] pb-5">
                  <div>
                    <h2 className="font-display text-3xl text-[#2f241e]">
                      Datos de contacto
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                      Completá tus datos para solicitar la fecha.
                    </p>
                  </div>

                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] sm:grid">
                    <MessageCircle size={20} />
                  </div>
                </div>

                {selectedSlot ? (
                  <div className="mt-6 rounded-[1.2rem] border border-[#0BB3A6]/25 bg-[#0BB3A6]/8 p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#087d75]" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d75]">
                          Horario seleccionado
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-[#2f241e]">
                          {selectedSlotLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/52 p-4 text-sm leading-relaxed text-[#5c473b]">
                    Primero seleccioná un horario disponible.
                  </div>
                )}

                <div className="mt-6 space-y-5">
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Nombre
                    </span>

                    <input
                      value={form.customerName}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          customerName: event.target.value,
                        }))
                      }
                      placeholder="Nombre y apellido"
                      className="input-contact"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Qué estás festejando
                    </span>

                    <select
                      value={form.eventType}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          eventType: event.target.value,
                        }))
                      }
                      className="input-contact"
                    >
                      <option value="">Seleccioná una opción</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Cómo conociste Calypso
                    </span>

                    <select
                      value={form.discoverySource}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          discoverySource: event.target.value,
                        }))
                      }
                      className="input-contact"
                    >
                      <option value="">Seleccioná una opción</option>
                      {DISCOVERY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Teléfono
                    </span>

                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+598..."
                      className="input-contact"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Mail
                    </span>

                    <input
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="tu@email.com"
                      className="input-contact"
                    />
                  </label>
                </div>

                {error && (
                  <p className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="mt-6 rounded-[1.2rem] border border-[#e4cfad] bg-white/45 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0BB3A6]" />
                    <p className="text-sm leading-relaxed text-[#5c473b]">
                      La solicitud no tiene compromiso de pago. La fecha se
                      mantiene durante 48 horas y se confirma únicamente luego de
                      coordinar por WhatsApp y realizar la seña.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedSlot}
                  className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? "Creando solicitud..." : "Solicitar reserva"}
                  <ArrowUpRight
                    size={17}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-5 text-[#c49a5b]">
          <div className="h-px flex-1 bg-[#c49a5b]/55" />
          <span className="font-display text-3xl">✦</span>
          <div className="h-px flex-1 bg-[#c49a5b]/55" />
        </div>
      </section>
    </main>
  );
}

function SlotGroup({
  title,
  slots,
  availableSlots,
  selectedSlot,
  onSelect,
}: {
  title: string;
  slots: ReservationSlot[];
  availableSlots: ReservationSlot[];
  selectedSlot: ReservationSlot | null;
  onSelect: (slot: ReservationSlot) => void;
}) {
  const availableCount = slots.filter((slot) =>
    availableSlots.some(
      (available) =>
        available.startTime === slot.startTime &&
        available.endTime === slot.endTime
    )
  ).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a6b2f]">
          {title}
        </p>

        {availableCount === 0 ? (
          <span className="rounded-full bg-stone-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-600">
            Sin disponibilidad
          </span>
        ) : availableCount < slots.length ? (
          <span className="rounded-full bg-[#e8c17f]/22 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a5b1f]">
            Parcial
          </span>
        ) : (
          <span className="rounded-full bg-[#0BB3A6]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#087d75]">
            Disponible
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {slots.map((slot) => {
          const available = availableSlots.some(
            (item) =>
              item.startTime === slot.startTime && item.endTime === slot.endTime
          );

          const active =
            selectedSlot?.startTime === slot.startTime &&
            selectedSlot?.endTime === slot.endTime;

          return (
            <button
              key={`${slot.period}-${slot.startTime}`}
              type="button"
              disabled={!available}
              onClick={() => available && onSelect(slot)}
              className={[
                "rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold transition",
                active
                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white shadow-[0_14px_34px_rgba(11,179,166,0.22)]"
                  : available
                    ? "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:-translate-y-0.5 hover:border-[#0BB3A6]/45 hover:bg-white"
                    : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 line-through",
              ].join(" ")}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReservationCalendar({
  selectedDate,
  calendarMonth,
  monthBlocks,
  loading,
  minDate,
  onMonthChange,
  onSelectDate,
}: {
  selectedDate: string;
  calendarMonth: Date;
  monthBlocks: ReservationBlock[];
  loading: boolean;
  minDate: string;
  onMonthChange: (date: Date) => void;
  onSelectDate: (dateValue: string) => void;
}) {
  const days = getCalendarDays(calendarMonth);
  const month = calendarMonth.getMonth();
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  const getDateAvailability = (dateValue: string) => {
    const dateBlocks = monthBlocks.filter(
      (block) => block.event_date === dateValue
    );

    const slots = getSlotsForDate(dateValue);
    const available = getAvailableSlots(dateValue, dateBlocks);

    if (dateValue < minDate) return "disabled";
    if (dateBlocks.length === 0) return "available";
    if (available.length === 0) return "full";
    if (available.length < slots.length) return "partial";

    return "available";
  };

  const previousMonth = () => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() - 1);
    onMonthChange(next);
  };

  const nextMonth = () => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + 1);
    onMonthChange(next);
  };

  return (
    <div className="rounded-[1.4rem] border border-[#d1af7e] bg-[#fff4df]/80 p-4 shadow-[0_14px_34px_rgba(90,64,50,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previousMonth}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#d1af7e] bg-[#fff9f0] text-[#2f241e] transition hover:bg-white"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="font-display text-xl capitalize text-[#2f241e]">
            {getMonthLabel(calendarMonth)}
          </p>

          {loading && (
            <p className="mt-1 text-xs font-semibold text-[#087d75]">
              Consultando disponibilidad...
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#d1af7e] bg-[#fff9f0] text-[#2f241e] transition hover:bg-white"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {weekDays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a5b1f]"
          >
            {day}
          </div>
        ))}

        {days.map((date) => {
          const dateValue = toInputDate(date);
          const availability = getDateAvailability(dateValue);

          const selected = selectedDate === dateValue;
          const outsideMonth = date.getMonth() !== month;
          const disabled =
            availability === "disabled" || availability === "full";

          return (
            <button
              key={dateValue}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dateValue)}
              className={[
                "relative min-h-12 rounded-2xl border px-2 py-2 text-sm font-bold transition",
                outsideMonth ? "opacity-35" : "",
                selected
                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white shadow-[0_12px_26px_rgba(11,179,166,0.20)]"
                  : availability === "full"
                    ? "cursor-not-allowed border-red-300 bg-red-100 text-red-700"
                    : availability === "partial"
                      ? "border-[#d89b38] bg-[#f4c76f]/45 text-[#6f4311] hover:bg-[#f4c76f]/60"
                      : availability === "disabled"
                        ? "cursor-not-allowed border-stone-300 bg-stone-200 text-stone-500"
                        : "border-[#d1af7e] bg-[#fff0d2] text-[#2f241e] hover:-translate-y-0.5 hover:border-[#0BB3A6]/55 hover:bg-[#fff7eb]",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#5c473b]">
        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#fff0d2] ring-1 ring-[#d1af7e]" />
          Disponible
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f4c76f]/70 ring-1 ring-[#d89b38]" />
          Parcial
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-100 ring-1 ring-red-300" />
          Reservada
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-stone-200 ring-1 ring-stone-300" />
          No disponible
        </div>
      </div>
    </div>
  );
}