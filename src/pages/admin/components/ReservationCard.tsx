import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  CalendarCheck,
  Check,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Pencil,
  Save,
  StickyNote,
  Trash2,
  User,
  WalletCards,
  X,
} from "lucide-react";
import { formatDateForDisplay } from "../../../lib/reservations";
import {
  DISCOVERY_OPTIONS,
  EVENT_TYPES,
  statusClasses,
  statusLabels,
} from "../constants";
import type {
  DisabledReservationDateRange,
  Reservation,
  ReservationDetailsUpdateValues,
  ReservationStatus,
} from "../types";
import { isDateInDisabledRange } from "../utils/dateHelpers";
import {
  formatReservationTimeRange,
  isOvernightTimeRange,
  normalizeTime,
} from "../utils/timeHelpers";
import { formatMoney, getEventTotalIncome } from "../utils/exportHelpers";
import {
  parseReservationAmounts,
  validateContactAndGuests,
  validateReservationTimes,
} from "../utils/reservationValidation";

export function ReservationCard({
  reservation,
  isCompletedView,
  disabledRanges,
  loading,
  onApprove,
  onReject,
  onDepositChange,
  onSaveDetails,
  onSaveNotes,
  onDelete,
}: {
  reservation: Reservation;
  isCompletedView: boolean;
  disabledRanges: DisabledReservationDateRange[];
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDepositChange: (value: boolean) => void;
  onSaveDetails: (
    values: ReservationDetailsUpdateValues,
  ) => Promise<string | null>;
  onSaveNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [notesDraft, setNotesDraft] = useState(reservation.notes || "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  const [reservationInfoOpen, setReservationInfoOpen] = useState(() => {
    if (isCompletedView) return false;
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 640px)").matches;
  });

  const totalIncome = getEventTotalIncome(reservation);
  const hasIncomeData =
    reservation.deposit_amount !== null ||
    reservation.settlement_amount !== null;

  const [editDraft, setEditDraft] = useState({
    customer_name: reservation.customer_name,
    event_type: reservation.event_type,
    phone: reservation.phone,
    email: reservation.email || "",
    children_count: String(reservation.children_count ?? ""),
    adults_count: String(reservation.adults_count ?? ""),
    event_date: reservation.event_date,
    start_time: normalizeTime(reservation.start_time),
    end_time: normalizeTime(reservation.end_time),
    status: reservation.status,
    deposit_paid: reservation.deposit_paid,
    agreed_price: String(reservation.agreed_price ?? ""),
    settlement_amount: String(reservation.settlement_amount ?? ""),
    deposit_amount: String(reservation.deposit_amount ?? ""),
    waiters_count: String(reservation.waiters_count ?? ""),
    animators_count: String(reservation.animators_count ?? ""),
    discovery_source: reservation.discovery_source || "",
  });

  useEffect(() => {
    // Los refresh automáticos no deben pisar lo que el usuario está escribiendo.
    if (!notesOpen) {
      setNotesDraft(reservation.notes || "");
    }

    if (!isEditing) {
      setEditDraft({
        customer_name: reservation.customer_name,
        event_type: reservation.event_type,
        phone: reservation.phone,
        email: reservation.email || "",
        children_count: String(reservation.children_count ?? ""),
        adults_count: String(reservation.adults_count ?? ""),
        event_date: reservation.event_date,
        start_time: normalizeTime(reservation.start_time),
        end_time: normalizeTime(reservation.end_time),
        status: reservation.status,
        deposit_paid: reservation.deposit_paid,
        agreed_price: String(reservation.agreed_price ?? ""),
        settlement_amount: String(reservation.settlement_amount ?? ""),
        deposit_amount: String(reservation.deposit_amount ?? ""),
        waiters_count: String(reservation.waiters_count ?? ""),
        animators_count: String(reservation.animators_count ?? ""),
        discovery_source: reservation.discovery_source || "",
      });
      setEditError("");
    }
  }, [reservation, isEditing, notesOpen]);

  async function handleSaveDetails(event: FormEvent) {
    event.preventDefault();
    setEditError("");

    const guests = validateContactAndGuests(editDraft);

    if (!guests.ok) {
      setEditError(guests.error);
      return;
    }

    const amounts = parseReservationAmounts(editDraft);

    if (!amounts.ok) {
      setEditError(amounts.error);
      return;
    }

    if (!editDraft.event_date.trim()) {
      setEditError("Seleccioná la fecha del evento.");
      return;
    }

    if (
      editDraft.event_date !== reservation.event_date &&
      isDateInDisabledRange(editDraft.event_date, disabledRanges)
    ) {
      setEditError("La nueva fecha seleccionada está inhabilitada.");
      return;
    }

    const times = validateReservationTimes(
      editDraft.start_time,
      editDraft.end_time,
    );

    if (!times.ok) {
      setEditError(times.error);
      return;
    }

    const { childrenCount, adultsCount } = guests.value;
    const {
      agreedPrice,
      settlementAmount,
      depositAmount,
      waitersCount,
      animatorsCount,
    } = amounts.value;
    const { startTime, endTime } = times.value;

    const updateValues: ReservationDetailsUpdateValues = {
      customer_name: editDraft.customer_name.trim(),
      event_type: editDraft.event_type,
      phone: editDraft.phone.trim(),
      email: editDraft.email.trim() || null,
      children_count: childrenCount,
      adults_count: adultsCount,
      event_date: editDraft.event_date,
      start_time: startTime,
      end_time: endTime,
      status: editDraft.status,
      deposit_paid: editDraft.deposit_paid,
      agreed_price: agreedPrice,
      settlement_amount: settlementAmount,
      deposit_amount: depositAmount,
      waiters_count: waitersCount,
      animators_count: animatorsCount,
      discovery_source: editDraft.discovery_source || null,
    };

    // El dato combinado se conserva en reservas antiguas hasta que el usuario
    // cargue al menos uno de los dos campos separados.
    if (waitersCount !== null || animatorsCount !== null) {
      updateValues.staff_count = null;
    }

    const saveError = await onSaveDetails(updateValues);

    if (saveError) {
      setEditError(saveError);
      return;
    }

    setIsEditing(false);
  }

  function cancelEdit() {
    setEditDraft({
      customer_name: reservation.customer_name,
      event_type: reservation.event_type,
      phone: reservation.phone,
      email: reservation.email || "",
      children_count: String(reservation.children_count ?? ""),
      adults_count: String(reservation.adults_count ?? ""),
      event_date: reservation.event_date,
      start_time: normalizeTime(reservation.start_time),
      end_time: normalizeTime(reservation.end_time),
      status: reservation.status,
      deposit_paid: reservation.deposit_paid,
      agreed_price: String(reservation.agreed_price ?? ""),
      settlement_amount: String(reservation.settlement_amount ?? ""),
      deposit_amount: String(reservation.deposit_amount ?? ""),
      waiters_count: String(reservation.waiters_count ?? ""),
      animators_count: String(reservation.animators_count ?? ""),
      discovery_source: reservation.discovery_source || "",
    });
    setEditError("");
    setIsEditing(false);
  }

  return (
    <article
      className={[
        "rounded-[1.45rem] border p-5 shadow-[0_12px_32px_rgba(90,64,50,0.06)]",
        isCompletedView
          ? "border-[#d8c9b9] bg-[#f7f2eb]/88"
          : "border-[#dfc8ab] bg-white/55",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                statusClasses[reservation.status],
              ].join(" ")}
            >
              {statusLabels[reservation.status]}
            </span>

            <span className="rounded-full border border-[#dfc8ab] bg-[#fff9f0] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d5748]">
              {reservation.source === "website" ? "Web" : "Admin"}
            </span>

            {reservation.deposit_paid && (
              <span className="rounded-full border border-[#0BB3A6]/35 bg-[#0BB3A6]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#087d75]">
                Seña paga
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-display text-2xl text-[#2f241e]">
                {reservation.customer_name}
              </h3>
              {isCompletedView && (
                <p className="mt-1 text-sm font-semibold text-[#6d5748]">
                  {formatDateForDisplay(reservation.event_date)} ·{" "}
                  {formatReservationTimeRange(
                    reservation.start_time,
                    reservation.end_time,
                  )}
                </p>
              )}
            </div>

            {isCompletedView && (
              <div className="w-fit rounded-[1rem] border border-[#2f241e]/10 bg-white/65 px-4 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a7667]">
                  Ingreso total
                </p>
                <p className="mt-0.5 text-base font-bold text-[#2f241e]">
                  {formatMoney(hasIncomeData ? totalIncome : null)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            <details
              open={clientInfoOpen}
              onToggle={(event) => setClientInfoOpen(event.currentTarget.open)}
              className="group rounded-[1rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75] [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <User size={15} />
                  Información del cliente
                </span>
                <ChevronRight
                  size={16}
                  className="transition group-open:rotate-90"
                />
              </summary>

              <div className="mt-3 grid gap-1.5 text-sm text-[#5c473b] sm:grid-cols-2">
                <p>
                  <b>Nombre:</b> {reservation.customer_name}
                </p>
                <p>
                  <b>Tel:</b> {reservation.phone}
                </p>
                <p>
                  <b>Email:</b> {reservation.email || "No indicado"}
                </p>
                <p>
                  <b>Conoció Calypso por:</b>{" "}
                  {reservation.discovery_source || "No indicado"}
                </p>
              </div>
            </details>

            <details
              open={reservationInfoOpen}
              onToggle={(event) =>
                setReservationInfoOpen(event.currentTarget.open)
              }
              className="group rounded-[1rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b1f] [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <CalendarCheck size={15} />
                  Información de la reserva
                </span>
                <ChevronRight
                  size={16}
                  className="transition group-open:rotate-90"
                />
              </summary>

              <div className="mt-3 grid gap-1.5 text-sm text-[#5c473b] sm:grid-cols-2">
                <p>
                  <b>Evento:</b> {reservation.event_type}
                </p>
                <p>
                  <b>Fecha:</b> {formatDateForDisplay(reservation.event_date)}
                </p>
                <p>
                  <b>Horario:</b>{" "}
                  {formatReservationTimeRange(
                    reservation.start_time,
                    reservation.end_time,
                  )}
                </p>
                <p>
                  <b>Niños:</b> {reservation.children_count ?? "No indicado"}
                </p>
                <p>
                  <b>Adultos:</b> {reservation.adults_count ?? "No indicado"}
                </p>
                <p>
                  <b>Mozos:</b> {reservation.waiters_count ?? "No indicado"}
                </p>
                <p>
                  <b>Animadores:</b>{" "}
                  {reservation.animators_count ?? "No indicado"}
                </p>
                {reservation.staff_count !== null &&
                  reservation.waiters_count === null &&
                  reservation.animators_count === null && (
                    <p className="text-[#8a5b1f]">
                      <b>Personal histórico sin separar:</b>{" "}
                      {reservation.staff_count}
                    </p>
                  )}
              </div>
            </details>

            <div className="rounded-[1.05rem] border border-[#0BB3A6]/25 bg-[#0BB3A6]/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75]">
                  <WalletCards size={16} />
                  Resumen económico
                </div>

                <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0BB3A6]/25 bg-white/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.09em] text-[#2f241e]">
                  <input
                    type="checkbox"
                    checked={reservation.deposit_paid}
                    onChange={(event) => onDepositChange(event.target.checked)}
                    className="h-3.5 w-3.5 accent-[#0BB3A6]"
                  />
                  Seña paga
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7667]">
                    Precio pautado
                  </p>
                  <p className="mt-1 font-semibold text-[#2f241e]">
                    {formatMoney(reservation.agreed_price)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7667]">
                    Seña
                  </p>
                  <p className="mt-1 font-semibold text-[#2f241e]">
                    {formatMoney(reservation.deposit_amount)}
                  </p>
                </div>
                {(reservation.status === "completed" ||
                  reservation.settlement_amount !== null) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7667]">
                      Liquidación
                    </p>
                    <p className="mt-1 font-semibold text-[#2f241e]">
                      {formatMoney(reservation.settlement_amount)}
                    </p>
                  </div>
                )}
                <div className="rounded-[0.9rem] bg-white/70 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#087d75]">
                    Ingreso total
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#087d75]">
                    {formatMoney(hasIncomeData ? totalIncome : null)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2 lg:max-w-[230px] lg:justify-end">
          {reservation.status !== "approved" &&
            reservation.status !== "completed" && (
              <button
                onClick={onApprove}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
              >
                <Check size={15} />
                Aprobar
              </button>
            )}

          <button
            onClick={() => setIsEditing((prev) => !prev)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
          >
            <Pencil size={15} />
            {isEditing ? "Cerrar" : "Editar"}
          </button>

          <details className="group relative">
            <summary
              className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-[#dfc8ab] bg-white text-[#2f241e] transition hover:bg-[#fff9f0] [&::-webkit-details-marker]:hidden"
              aria-label="Más acciones"
            >
              <MoreHorizontal size={17} />
            </summary>

            <div className="absolute right-0 z-30 mt-2 min-w-40 rounded-[1rem] border border-[#dfc8ab] bg-[#fffdf9] p-2 shadow-[0_18px_42px_rgba(90,64,50,0.16)]">
              {reservation.status !== "rejected" &&
                reservation.status !== "completed" && (
                  <button
                    type="button"
                    onClick={onReject}
                    disabled={loading}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <X size={14} />
                    Rechazar
                  </button>
                )}

              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Borrar
              </button>
            </div>
          </details>
        </div>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSaveDetails}
          className="mt-5 rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4"
        >
          <div className="grid gap-5">
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75]">
                Cliente
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Nombre
                  </span>
                  <input
                    value={editDraft.customer_name}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        customer_name: event.target.value,
                      }))
                    }
                    className="input-contact"
                    placeholder="Nombre y apellido"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Teléfono
                  </span>
                  <input
                    value={editDraft.phone}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="input-contact"
                    placeholder="+598..."
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Email
                  </span>
                  <input
                    type="email"
                    value={editDraft.email}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="input-contact"
                    placeholder="cliente@email.com"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Cómo conoció Calypso
                  </span>
                  <select
                    value={editDraft.discovery_source}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
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

            <section className="border-t border-[#ead9c0] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b1f]">
                Evento
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Tipo de evento
                  </span>
                  <select
                    value={editDraft.event_type}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        event_type: event.target.value,
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
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Estado
                  </span>
                  <select
                    value={editDraft.status}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        status: event.target.value as ReservationStatus,
                      }))
                    }
                    className="input-contact"
                  >
                    {(
                      [
                        "pending",
                        "approved",
                        "rejected",
                        "expired",
                        "completed",
                      ] as ReservationStatus[]
                    ).map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Niños
                  </span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={editDraft.children_count}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        children_count: event.target.value,
                      }))
                    }
                    className="input-contact"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Adultos
                  </span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={editDraft.adults_count}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        adults_count: event.target.value,
                      }))
                    }
                    className="input-contact"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Mozos
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={editDraft.waiters_count}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        waiters_count: event.target.value,
                      }))
                    }
                    className="input-contact"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Animadores
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={editDraft.animators_count}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        animators_count: event.target.value,
                      }))
                    }
                    className="input-contact"
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-[#ead9c0] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a5b1f]">
                Fecha y horario
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Fecha
                  </span>
                  <input
                    type="date"
                    value={editDraft.event_date}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        event_date: event.target.value,
                      }))
                    }
                    className="input-contact"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Inicio
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-2][0-9]:[0-5][0-9]"
                    maxLength={5}
                    value={editDraft.start_time}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        start_time: event.target.value,
                      }))
                    }
                    className="input-contact"
                    placeholder="17:00"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Fin
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-2][0-9]:[0-5][0-9]"
                    maxLength={5}
                    value={editDraft.end_time}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        end_time: event.target.value,
                      }))
                    }
                    className="input-contact"
                    placeholder="20:00"
                  />
                </label>
              </div>

              {isOvernightTimeRange(
                editDraft.start_time,
                editDraft.end_time,
              ) && (
                <p className="mt-3 rounded-[0.9rem] border border-[#0BB3A6]/25 bg-[#0BB3A6]/10 px-4 py-3 text-xs font-semibold leading-relaxed text-[#087d75]">
                  Este horario termina al día siguiente.
                </p>
              )}
            </section>

            <section className="border-t border-[#ead9c0] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#087d75]">
                Cobro
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Precio pautado
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={editDraft.agreed_price}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        agreed_price: event.target.value,
                      }))
                    }
                    className="input-contact"
                    placeholder="$"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                    Seña
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={editDraft.deposit_amount}
                    onChange={(event) =>
                      setEditDraft((prev) => ({
                        ...prev,
                        deposit_amount: event.target.value,
                        deposit_paid:
                          Number(event.target.value) > 0
                            ? true
                            : prev.deposit_paid,
                      }))
                    }
                    className="input-contact"
                    placeholder="$"
                  />
                </label>
                {editDraft.status === "completed" && (
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#6d5748]">
                      Liquidación
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="decimal"
                      value={editDraft.settlement_amount}
                      onChange={(event) =>
                        setEditDraft((prev) => ({
                          ...prev,
                          settlement_amount: event.target.value,
                        }))
                      }
                      className="input-contact"
                      placeholder="$"
                    />
                  </label>
                )}
                <div className="flex items-end">
                  <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#2f241e]">
                    <input
                      type="checkbox"
                      checked={editDraft.deposit_paid}
                      onChange={(event) =>
                        setEditDraft((prev) => ({
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
          </div>

          {editError && (
            <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {editError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
            >
              <X size={15} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0]/72 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
              <StickyNote size={15} />
              Notas internas
            </p>
            {!notesOpen && (
              <p className="mt-2 max-h-[4.5rem] overflow-hidden whitespace-pre-wrap text-sm leading-6 text-[#5c473b]">
                {reservation.notes?.trim() || "Sin notas internas todavía."}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNotesOpen((prev) => !prev)}
            className="shrink-0 rounded-full border border-[#dfc8ab] bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2f241e] transition hover:bg-white"
          >
            {notesOpen
              ? "Cerrar"
              : reservation.notes?.trim()
                ? "Ver / editar"
                : "Agregar nota"}
          </button>
        </div>

        {notesOpen && (
          <div className="mt-4 border-t border-[#ead9c0] pt-4">
            <textarea
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              className="input-contact min-h-48 resize-y leading-relaxed"
              placeholder="Notas internas: menú, personal requerido, detalles, decoración, condiciones especiales..."
            />

            <button
              type="button"
              onClick={() => onSaveNotes(notesDraft)}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-white disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Guardar notas
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
