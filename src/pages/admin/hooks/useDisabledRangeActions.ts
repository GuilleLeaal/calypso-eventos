import type { Dispatch, FormEvent, SetStateAction } from "react";
import { supabase } from "../../../lib/supabase";
import { formatDateForDisplay } from "../../../lib/reservations";
import { statusLabels } from "../constants";
import type { ManualReservationFormValues, Reservation } from "../types";
import { getMinDisabledDate, getMinReservationDate } from "../utils/dateHelpers";
import { formatReservationTimeRange } from "../utils/timeHelpers";

type DisabledFormValues = {
  start_date: string;
  end_date: string;
  reason: string;
};

export function useDisabledRangeActions({
  disabledForm,
  setDisabledForm,
  setDisabledActionLoadingId,
  setGlobalError,
  setManualForm,
  fetchDisabledRanges,
  fetchManualBlocks,
  fetchManualMonthBlocks,
}: {
  disabledForm: DisabledFormValues;
  setDisabledForm: Dispatch<SetStateAction<DisabledFormValues>>;
  setDisabledActionLoadingId: Dispatch<SetStateAction<string | null>>;
  setGlobalError: (message: string) => void;
  setManualForm: Dispatch<SetStateAction<ManualReservationFormValues>>;
  fetchDisabledRanges: () => Promise<void>;
  fetchManualBlocks: () => Promise<void>;
  fetchManualMonthBlocks: () => Promise<void>;
}) {
  async function handleCreateDisabledRange(event: FormEvent) {
    event.preventDefault();

    setGlobalError("");

    if (!disabledForm.start_date || !disabledForm.end_date) {
      setGlobalError("Seleccioná fecha de inicio y fecha de fin.");
      return;
    }

    if (disabledForm.start_date < getMinDisabledDate()) {
      setGlobalError(
        "No se pueden inhabilitar fechas anteriores a la fecha mínima.",
      );
      return;
    }

    if (disabledForm.end_date < disabledForm.start_date) {
      setGlobalError(
        "La fecha de fin no puede ser anterior a la fecha de inicio.",
      );
      return;
    }

    const { data: rangeReservations, error: rangeReservationsError } =
      await supabase
        .from("reservations")
        .select("id, customer_name, event_date, start_time, end_time, status")
        .gte("event_date", disabledForm.start_date)
        .lte("event_date", disabledForm.end_date)
        .neq("status", "rejected")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

    if (rangeReservationsError) {
      console.error(
        "Error checking reservations in disabled range:",
        rangeReservationsError,
      );
      setGlobalError(
        "No pudimos verificar las reservas existentes para ese rango. Intentá nuevamente.",
      );
      return;
    }

    const reservationsInRange = (rangeReservations || []) as Pick<
      Reservation,
      | "id"
      | "customer_name"
      | "event_date"
      | "start_time"
      | "end_time"
      | "status"
    >[];

    if (reservationsInRange.length > 0) {
      const reservationSummary = reservationsInRange
        .slice(0, 8)
        .map(
          (reservation) =>
            `• ${formatDateForDisplay(reservation.event_date)} - ${formatReservationTimeRange(
              reservation.start_time,
              reservation.end_time,
            )} - ${reservation.customer_name} (${statusLabels[reservation.status]})`,
        )
        .join("\n");

      const extraCount =
        reservationsInRange.length > 8
          ? `\n...y ${reservationsInRange.length - 8} reserva(s) más.`
          : "";

      const confirmed = window.confirm(
        `Atención: ya existen ${reservationsInRange.length} reserva(s) en el rango que querés inhabilitar.\n\n${reservationSummary}${extraCount}\n\nLa fecha se inhabilitará para nuevas reservas, pero estas reservas existentes NO se borran ni se modifican automáticamente. Revisalas manualmente si corresponde.\n\n¿Querés continuar?`,
      );

      if (!confirmed) return;
    }

    setDisabledActionLoadingId("new");

    const { error } = await supabase.from("disabled_reservation_dates").insert({
      start_date: disabledForm.start_date,
      end_date: disabledForm.end_date,
      reason: disabledForm.reason.trim() || null,
    });

    if (error) {
      console.error("Error creating disabled reservation date:", error);
      setGlobalError(
        error.message || "No pudimos inhabilitar la fecha seleccionada.",
      );
      setDisabledActionLoadingId(null);
      return;
    }

    setDisabledForm({
      start_date: getMinDisabledDate(),
      end_date: getMinDisabledDate(),
      reason: "",
    });

    setManualForm((prev) => {
      const nextDate =
        prev.event_date >= disabledForm.start_date &&
        prev.event_date <= disabledForm.end_date
          ? getMinReservationDate()
          : prev.event_date;

      return {
        ...prev,
        event_date: nextDate,
      };
    });

    await fetchDisabledRanges();
    await fetchManualBlocks();
    await fetchManualMonthBlocks();

    setDisabledActionLoadingId(null);
  }

  async function deleteDisabledRange(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que querés habilitar nuevamente esta fecha o rango?",
    );

    if (!confirmed) return;

    setDisabledActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase
      .from("disabled_reservation_dates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting disabled reservation date:", error);
      setGlobalError("No pudimos habilitar nuevamente la fecha.");
    } else {
      await fetchDisabledRanges();
      await fetchManualBlocks();
      await fetchManualMonthBlocks();
    }

    setDisabledActionLoadingId(null);
  }

  return { handleCreateDisabledRange, deleteDisabledRange };
}
