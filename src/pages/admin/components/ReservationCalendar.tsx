import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getAvailableSlots,
  getSlotsForDate,
  type ReservationBlock,
} from "../../../lib/reservations";
import { statusLabels } from "../constants";
import type { DisabledReservationDateRange, Reservation } from "../types";
import {
  getCalendarDays,
  getDisabledRangeForDate,
  getMonthLabel,
  isDateInDisabledRange,
  toInputDate,
} from "../utils/dateHelpers";
import { formatReservationTimeRange } from "../utils/timeHelpers";

export function ReservationCalendar({
  selectedDate,
  calendarMonth,
  monthBlocks,
  monthReservations,
  disabledRanges,
  loading,
  minDate,
  onMonthChange,
  onSelectDate,
}: {
  selectedDate: string;
  calendarMonth: Date;
  monthBlocks: ReservationBlock[];
  monthReservations: Reservation[];
  disabledRanges: DisabledReservationDateRange[];
  loading: boolean;
  minDate: string;
  onMonthChange: (date: Date) => void;
  onSelectDate: (dateValue: string) => void;
}) {
  const days = getCalendarDays(calendarMonth);
  const month = calendarMonth.getMonth();
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  const getDateReservations = (dateValue: string) =>
    monthReservations.filter(
      (reservation) => reservation.event_date === dateValue,
    );

  const getDateTooltip = (dateValue: string) => {
    if (dateValue < minDate) {
      return "No disponible";
    }

    const disabledRange = getDisabledRangeForDate(dateValue, disabledRanges);

    if (disabledRange) {
      return `Inhabilitada: ${disabledRange.reason?.trim() || "sin motivo indicado"}`;
    }

    const dateReservations = getDateReservations(dateValue);

    if (dateReservations.length === 0) {
      return "Libre";
    }

    return dateReservations
      .slice(0, 4)
      .map(
        (reservation) =>
          `${reservation.customer_name} - ${formatReservationTimeRange(
            reservation.start_time,
            reservation.end_time,
          )} (${statusLabels[reservation.status]})`,
      )
      .join("\n");
  };

  const getDateAvailability = (dateValue: string) => {
    const dateBlocks = monthBlocks.filter(
      (block) => block.event_date === dateValue,
    );

    const slots = getSlotsForDate(dateValue);
    const available = getAvailableSlots(dateValue, dateBlocks);

    if (dateValue < minDate) return "disabled";
    if (isDateInDisabledRange(dateValue, disabledRanges)) return "closed";
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
          const tooltip = getDateTooltip(dateValue);
          const dateReservations = getDateReservations(dateValue);
          const hasReservation = dateReservations.length > 0;
          const isClosed = availability === "closed";

          const selected =
            selectedDate === dateValue && availability !== "closed";
          const outsideMonth = date.getMonth() !== month;
          const disabled =
            availability === "disabled" || availability === "closed";

          return (
            <button
              key={dateValue}
              type="button"
              disabled={disabled}
              title={tooltip}
              onClick={() => onSelectDate(dateValue)}
              className={[
                "relative min-h-12 rounded-2xl border px-2 py-2 text-sm font-bold transition",
                outsideMonth ? "opacity-35" : "",
                selected
                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white shadow-[0_12px_26px_rgba(11,179,166,0.20)]"
                  : availability === "closed"
                    ? "cursor-not-allowed border-red-300 bg-red-100 text-red-700"
                    : availability === "full"
                      ? "border-red-300 bg-red-100 text-red-700 hover:bg-red-50"
                      : availability === "partial"
                        ? "border-[#d89b38] bg-[#f4c76f]/45 text-[#6f4311] hover:bg-[#f4c76f]/60"
                        : availability === "disabled"
                          ? "cursor-not-allowed border-stone-300 bg-stone-200 text-stone-500"
                          : "border-[#d1af7e] bg-[#fff0d2] text-[#2f241e] hover:-translate-y-0.5 hover:border-[#0BB3A6]/55 hover:bg-[#fff7eb]",
              ].join(" ")}
            >
              <span>{date.getDate()}</span>

              {(isClosed || hasReservation) && (
                <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
                  {isClosed && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-700" />
                  )}
                  {hasReservation && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2f241e]" />
                  )}
                </span>
              )}
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
          Inhabilitada / completo
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-stone-200 ring-1 ring-stone-300" />
          No disponible / fuera de rango
        </div>
      </div>
    </div>
  );
}
