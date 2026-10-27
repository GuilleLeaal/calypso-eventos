import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { formatDateForDisplay, getAvailableSlots, getSlotsForDate, getTodayInputValue, type ReservationBlock } from "../../../lib/reservations";
import { RESERVATION_EXPORT_COLUMNS, statusClasses, statusLabels } from "../constants";
import type { DisabledReservationDateRange, Reservation } from "../types";
import { getCalendarDays, getDisabledRangeForDate, getMonthLabel, getMonthStart, toInputDate } from "../utils/dateHelpers";
import { formatReservationTimeRange } from "../utils/timeHelpers";

const availabilityStyles = {
  Libre: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Parcial: "border-amber-300 bg-amber-50 text-amber-900",
  Ocupada: "border-red-200 bg-red-50 text-red-800",
  Inhabilitada: "border-stone-300 bg-stone-100 text-stone-600",
  Pasada: "border-slate-200 bg-slate-100 text-slate-500",
};

export function AvailabilityCalendarSection({ refreshKey }: { refreshKey: number }) {
  const [month, setMonth] = useState(() => getMonthStart(new Date()));
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{
    key: string;
    reservations: Reservation[];
    blocks: ReservationBlock[];
    ranges: DisabledReservationDateRange[];
  } | null>(null);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const days = getCalendarDays(month);
  const start = toInputDate(days[0]);
  const end = toInputDate(days[days.length - 1]);
  const key = `${start}/${end}/${refreshKey}`;
  const loading = result?.key !== key && !error;
  const ready = result?.key === key;
  const reservations = ready ? result.reservations : [];
  const blocks = ready ? result.blocks : [];
  const ranges = ready ? result.ranges : [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError("");
      try {
        const [bookings, occupied, disabled] = await Promise.all([
          supabase.from("reservations").select(RESERVATION_EXPORT_COLUMNS)
            .gte("event_date", start).lte("event_date", end)
            .order("event_date").order("start_time"),
          supabase.rpc("get_public_reservation_blocks_range", { start_date: start, end_date: end }),
          supabase.from("disabled_reservation_dates").select("id, start_date, end_date, reason, created_at")
            .lte("start_date", end).gte("end_date", start),
        ]);
        if (bookings.error || occupied.error || disabled.error) throw new Error("load");
        if (!cancelled) setResult({ key, reservations: (bookings.data || []) as Reservation[], blocks: (occupied.data || []) as ReservationBlock[], ranges: (disabled.data || []) as DisabledReservationDateRange[] });
      } catch {
        if (!cancelled) setError("No pudimos cargar el calendario. Tocá Actualizar para volver a intentar.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [start, end, key]);

  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (mobile) document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
      // The mobile sheet has a single interactive element: its close button.
      if (mobile && event.key === "Tab") { event.preventDefault(); closeRef.current?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [selected]);

  function availability(date: string) {
    if (date < getTodayInputValue()) return "Pasada";
    if (getDisabledRangeForDate(date, ranges)) return "Inhabilitada";
    const available = getAvailableSlots(date, blocks.filter((block) => block.event_date === date));
    if (!available.length) return "Ocupada";
    if (available.length < getSlotsForDate(date).length) return "Parcial";
    return "Libre";
  }

  function changeMonth(offset: number) {
    setSelected(null);
    setError("");
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  const dateReservations = reservations.filter((reservation) => reservation.event_date === selected);
  const disabledRange = selected ? getDisabledRangeForDate(selected, ranges) : undefined;

  return (
    <section className="mt-10" aria-label="Calendario de disponibilidad">
      <div className={`grid items-start gap-5 ${selected ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
        <div className="min-w-0 rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0] p-3 shadow-lg sm:p-6" aria-busy={loading}>
          <div className="mb-5 flex items-center justify-between gap-2">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior" className="rounded-full border border-[#dfc8ab] p-3 hover:bg-white"><ChevronLeft size={20} /></button>
            <div className="text-center">
              <h2 className="font-display text-2xl capitalize text-[#2f241e] sm:text-3xl" aria-live="polite">{getMonthLabel(month)}</h2>
              <button type="button" onClick={() => { setSelected(null); setError(""); setMonth(getMonthStart(new Date())); }} className="mt-1 text-sm font-semibold text-[#087d75] underline underline-offset-4">Ir a hoy</button>
            </div>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente" className="rounded-full border border-[#dfc8ab] p-3 hover:bg-white"><ChevronRight size={20} /></button>
          </div>
          <div className="mb-5 flex flex-wrap gap-3 text-xs sm:text-sm">
            {Object.entries(availabilityStyles).map(([label, style]) => <span key={label} className={`rounded-full border px-3 py-1 ${style}`}>{label}</span>)}
          </div>
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {loading && <p role="status" className="mb-4 flex items-center gap-2 text-sm text-[#087d75]"><Loader2 size={16} className="animate-spin" />Cargando calendario…</p>}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => <div key={day} className="pb-2 text-center text-xs font-bold text-[#6d5748]">{day}</div>)}
            {days.map((date) => {
              const value = toInputDate(date);
              const outside = date.getMonth() !== month.getMonth();
              const status = availability(value);
              const count = reservations.filter((reservation) => reservation.event_date === value && reservation.status !== "rejected" && reservation.status !== "expired").length;
              return (
                <button key={value} type="button" disabled={!ready || outside} aria-pressed={selected === value} aria-current={value === getTodayInputValue() ? "date" : undefined}
                  aria-label={`${formatDateForDisplay(value)}${ready ? `, ${status}, ${count} reservas activas` : ", sin datos"}`}
                  onClick={(event) => { triggerRef.current = event.currentTarget; setSelected(value); }}
                  className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-0.5 py-2 transition sm:min-h-28 sm:items-start sm:p-3 ${outside ? "invisible" : ready ? availabilityStyles[status] : "border-stone-200 bg-stone-50 text-stone-400"} ${selected === value ? "ring-2 ring-[#087d75] ring-offset-2" : "enabled:hover:brightness-95"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087d75]`}>
                  <span className={`text-lg font-bold sm:text-2xl ${value === getTodayInputValue() ? "underline decoration-2 underline-offset-4" : ""}`}>{date.getDate()}</span>
                  <span className="text-[9px] font-semibold sm:text-xs">{ready ? status : "—"}</span>
                  {ready && count > 0 && <span className="text-[9px] sm:text-xs">{count} <span className="hidden sm:inline">reserva{count === 1 ? "" : "s"}</span><span className="sm:hidden">res.</span></span>}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-[#6d5748]">Seleccioná una fecha para ver sus reservas. La disponibilidad contempla el margen entre eventos; las reservas rechazadas o vencidas no ocupan horarios.</p>
        </div>
        {selected && <>
          <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setSelected(null)} aria-hidden="true" />
          <aside role="dialog" aria-labelledby="calendar-date-title" className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto overscroll-contain rounded-t-3xl border border-[#dfc8ab] bg-[#fff9f0] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl lg:sticky lg:inset-auto lg:top-24 lg:z-auto lg:max-h-[calc(100dvh-7rem)] lg:rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-widest text-[#087d75]">Detalle del día</p><h3 id="calendar-date-title" className="mt-2 font-display text-xl capitalize text-[#2f241e]">{formatDateForDisplay(selected)}</h3></div>
              <button ref={closeRef} type="button" aria-label="Cerrar detalle" onClick={() => setSelected(null)} className="rounded-full border border-[#dfc8ab] p-2"><X size={20} /></button>
            </div>
            {!ready ? <p className="mt-5 text-sm">{error || "Cargando reservas…"}</p> : <>
              <p className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${availabilityStyles[availability(selected)]}`}>{availability(selected)}{disabledRange ? `: ${disabledRange.reason || "Sin motivo indicado"}` : ""}</p>
              {dateReservations.length === 0 && <p className="mt-5 text-sm text-[#6d5748]">No hay reservas para esta fecha.</p>}
              <div className="mt-4 space-y-4">{dateReservations.map((reservation) => <article key={reservation.id} className="rounded-2xl border border-[#dfc8ab] bg-white/70 p-4 text-sm text-[#5c473b]">
                <span className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${statusClasses[reservation.status]}`}>{statusLabels[reservation.status]}</span>
                <h4 className="mt-3 break-words font-bold text-[#2f241e]">{reservation.customer_name}</h4>
                <p className="mt-1">{reservation.event_type}</p>
                <p className="mt-2 font-semibold">{formatReservationTimeRange(reservation.start_time, reservation.end_time)}</p>
                <dl className="mt-3 space-y-2 break-words">
                  <div><dt className="font-semibold">Contacto</dt><dd>{reservation.phone}{reservation.email && <><br />{reservation.email}</>}</dd></div>
                  <div><dt className="font-semibold">Invitados</dt><dd>{reservation.children_count ?? "—"} niños · {reservation.adults_count ?? "—"} adultos</dd></div>
                  <div><dt className="font-semibold">Seña</dt><dd>{reservation.deposit_paid ? "Pagada" : "Pendiente"}{reservation.deposit_amount != null ? ` · $ ${reservation.deposit_amount.toLocaleString("es-UY")}` : ""}</dd></div>
                  {reservation.agreed_price != null && <div><dt className="font-semibold">Precio acordado</dt><dd>$ {reservation.agreed_price.toLocaleString("es-UY")}</dd></div>}
                  {reservation.notes && <div><dt className="font-semibold">Notas</dt><dd className="whitespace-pre-wrap">{reservation.notes}</dd></div>}
                </dl>
              </article>)}</div>
            </>}
          </aside>
        </>}
      </div>
    </section>
  );
}

