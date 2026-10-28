import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Loader2, Plus } from "lucide-react";
import type { ReservationBlock, ReservationSlot } from "../../../lib/reservations";
import { DISCOVERY_OPTIONS, EVENT_TYPES } from "../constants";
import type {
  DisabledReservationDateRange,
  ManualReservationFormValues,
  Reservation,
} from "../types";
import { getMinReservationDate } from "../utils/dateHelpers";
import { isOvernightTimeRange } from "../utils/timeHelpers";
import { formatMoney, parseOptionalCurrency } from "../utils/exportHelpers";
import { ReservationCalendar } from "./ReservationCalendar";

export function ManualReservationForm({
  form,
  setForm,
  onSubmit,
  creating,
  calendarMonth,
  onCalendarMonthChange,
  monthBlocks,
  monthReservations,
  disabledRanges,
  loadingMonth,
  manualSlots,
  loadingSlots,
  onApplySlot,
}: {
  form: ManualReservationFormValues;
  setForm: Dispatch<SetStateAction<ManualReservationFormValues>>;
  onSubmit: (event: FormEvent) => void;
  creating: boolean;
  calendarMonth: Date;
  onCalendarMonthChange: (date: Date) => void;
  monthBlocks: ReservationBlock[];
  monthReservations: Reservation[];
  disabledRanges: DisabledReservationDateRange[];
  loadingMonth: boolean;
  manualSlots: ReservationSlot[];
  loadingSlots: boolean;
  onApplySlot: (slot: ReservationSlot) => void;
}) {
  const deposit = parseOptionalCurrency(form.deposit_amount);
  const depositPreview = Number.isNaN(deposit) ? 0 : Number(deposit ?? 0);
  const manualEndsNextDay = isOvernightTimeRange(
    form.start_time,
    form.end_time,
  );

  const sectionClass =
    "rounded-[1.2rem] border border-[#dfc8ab] bg-white/35 p-4 sm:p-5";
  const sectionTitleClass =
    "text-xs font-bold uppercase tracking-[0.16em] text-[#087d75]";
  const fieldLabelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]";

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-5">
      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Cliente</p>
          <p className="mt-1 text-xs text-[#8a7667]">
            Datos de contacto y origen de la consulta.
          </p>
        </div>

        <div className="grid gap-4">
          <label>
            <span className={fieldLabelClass}>Nombre y apellido</span>
            <input
              value={form.customer_name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  customer_name: event.target.value,
                }))
              }
              className="input-contact"
              placeholder="Nombre y apellido"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabelClass}>Teléfono</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="input-contact"
                placeholder="+598..."
              />
            </label>

            <label>
              <span className={fieldLabelClass}>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="input-contact"
                placeholder="cliente@email.com"
              />
            </label>
          </div>

          <label>
            <span className={fieldLabelClass}>Cómo conoció Calypso</span>
            <select
              value={form.discovery_source}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  discovery_source: event.target.value,
                }))
              }
              className="input-contact"
            >
              <option value="">No indicado</option>
              {DISCOVERY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Evento</p>
          <p className="mt-1 text-xs text-[#8a7667]">
            Tipo de evento, invitados y personal.
          </p>
        </div>

        <div className="grid gap-4">
          <label>
            <span className={fieldLabelClass}>Tipo de evento</span>
            <select
              value={form.event_type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, event_type: event.target.value }))
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabelClass}>Cantidad de niños</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.children_count}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    children_count: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="Ej: 15"
              />
            </label>

            <label>
              <span className={fieldLabelClass}>Cantidad de adultos</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.adults_count}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    adults_count: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="Ej: 40"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={fieldLabelClass}>Cantidad de mozos</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.waiters_count}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    waiters_count: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="Ej: 2"
              />
            </label>

            <label>
              <span className={fieldLabelClass}>Cantidad de animadores</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.animators_count}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    animators_count: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="Ej: 1"
              />
            </label>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 flex flex-col gap-3 border-b border-[#ead9c0] pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={sectionTitleClass}>Cobro</p>
            <p className="mt-1 text-xs text-[#8a7667]">
              Importes administrativos del evento.
            </p>
          </div>
          <div className="rounded-full border border-[#0BB3A6]/30 bg-[#0BB3A6]/10 px-4 py-2 text-xs font-bold text-[#087d75]">
            Seña registrada: {formatMoney(depositPreview)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={fieldLabelClass}>Precio pautado</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={form.agreed_price}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  agreed_price: event.target.value,
                }))
              }
              className="input-contact"
              placeholder="$"
            />
          </label>

          <label>
            <span className={fieldLabelClass}>Seña</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={form.deposit_amount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  deposit_amount: event.target.value,
                  deposit_paid:
                    Number(event.target.value) > 0 ? true : prev.deposit_paid,
                }))
              }
              className="input-contact"
              placeholder="$"
            />
          </label>

          <div className="flex items-end">
            <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#2f241e]">
              <input
                type="checkbox"
                checked={form.deposit_paid}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    deposit_paid: event.target.checked,
                  }))
                }
                className="h-3.5 w-3.5 accent-[#0BB3A6]"
              />
              Seña paga
            </label>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Fecha y horario</p>
          <p className="mt-1 text-xs text-[#8a7667]">
            Disponibilidad del salón y horario acordado. Reservas con al menos 10 días de anticipación.
          </p>
        </div>

        <ReservationCalendar
          selectedDate={form.event_date}
          calendarMonth={calendarMonth}
          monthBlocks={monthBlocks}
          monthReservations={monthReservations}
          disabledRanges={disabledRanges}
          loading={loadingMonth}
          minDate={getMinReservationDate()}
          onMonthChange={onCalendarMonthChange}
          onSelectDate={(dateValue) => {
            setForm((prev) => ({ ...prev, event_date: dateValue }));
          }}
        />

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className={fieldLabelClass}>Horarios sugeridos</span>
            {loadingSlots && (
              <span className="text-xs font-semibold text-[#087d75]">
                Consultando...
              </span>
            )}
          </div>

          {manualSlots.length === 0 ? (
            <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/55 px-4 py-3 text-sm leading-relaxed text-[#5c473b]">
              No hay horarios sugeridos para esta fecha. Igual podés ingresar un
              horario libre abajo.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {manualSlots.map((slot) => {
                const active =
                  form.start_time === slot.startTime &&
                  form.end_time === slot.endTime;
                return (
                  <button
                    key={`${slot.period}-${slot.startTime}`}
                    type="button"
                    onClick={() => onApplySlot(slot)}
                    className={[
                      "rounded-[1rem] border px-3 py-2 text-left text-sm font-semibold transition",
                      active
                        ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                        : "border-[#dfc8ab] bg-white/65 text-[#2f241e] hover:bg-white",
                    ].join(" ")}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={fieldLabelClass}>Inicio</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              placeholder="17:00"
              value={form.start_time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, start_time: event.target.value }))
              }
              className="input-contact"
            />
          </label>

          <label>
            <span className={fieldLabelClass}>Fin</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              maxLength={5}
              placeholder="20:00"
              value={form.end_time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, end_time: event.target.value }))
              }
              className="input-contact"
            />
          </label>
        </div>

        {manualEndsNextDay && (
          <p className="mt-3 rounded-[0.9rem] border border-[#0BB3A6]/25 bg-[#0BB3A6]/10 px-4 py-3 text-xs font-semibold leading-relaxed text-[#087d75]">
            Este horario termina al día siguiente. Por ejemplo, 20:30 a 00:30 se
            interpreta como un evento de la fecha seleccionada que finaliza a
            las 00:30 del día siguiente.
          </p>
        )}
      </section>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-[#ead9c0] pb-3">
          <p className={sectionTitleClass}>Notas</p>
          <p className="mt-1 text-xs text-[#8a7667]">
            Detalles operativos o acuerdos especiales.
          </p>
        </div>
        <textarea
          value={form.notes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, notes: event.target.value }))
          }
          className="input-contact min-h-36 resize-y leading-relaxed"
          placeholder="Menú, personal requerido, decoración, condiciones especiales..."
        />
      </section>

      <button
        type="submit"
        disabled={creating}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Plus size={18} />
        )}
        {creating ? "Creando reserva..." : "Crear reserva aprobada"}
      </button>
    </form>
  );
}
