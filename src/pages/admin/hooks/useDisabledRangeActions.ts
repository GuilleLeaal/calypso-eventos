import { useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { supabase } from "../../../lib/supabase";
import { formatDateForDisplay } from "../../../lib/reservations";
import { statusLabels } from "../constants";
import type { DisabledReservationDateRange, ManualReservationFormValues, Reservation } from "../types";
import { getMinDisabledDate, getMinReservationDate } from "../utils/dateHelpers";
import { formatReservationTimeRange } from "../utils/timeHelpers";

import {
  validateDisabledRange,
  type DisabledRangeValues,
} from "../utils/disabledRangeValidation";

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
  disabledForm: DisabledRangeValues;
  setDisabledForm: Dispatch<SetStateAction<DisabledRangeValues>>;
  setDisabledActionLoadingId: Dispatch<SetStateAction<string | null>>;
  setGlobalError: (message: string) => void;
  setManualForm: Dispatch<SetStateAction<ManualReservationFormValues>>;
  fetchDisabledRanges: () => Promise<void>;
  fetchManualBlocks: () => Promise<void>;
  fetchManualMonthBlocks: () => Promise<void>;
}) {
  const [editingRange, setEditingRange] =
    useState<DisabledReservationDateRange | null>(null);
  const [saveError, setSaveError] = useState("");
  const savingRef = useRef(false);

  function resetForm() {
    setEditingRange(null);
    setSaveError("");
    setDisabledForm({
      start_date: getMinDisabledDate(),
      end_date: getMinDisabledDate(),
      reason: "",
    });
  }

  function startEditingRange(range: DisabledReservationDateRange) {
    if (savingRef.current) return;
    setGlobalError("");
    setSaveError("");
    setEditingRange(range);
    setDisabledForm({
      start_date: range.start_date,
      end_date: range.end_date,
      reason: range.reason ?? "",
    });
  }

  async function handleSaveDisabledRange(event: FormEvent) {
    event.preventDefault();
    if (savingRef.current) return;
    setGlobalError("");
    setSaveError("");
    const values = { ...disabledForm, reason: disabledForm.reason.trim() };
    const reportError = (message: string) => {
      setGlobalError(message);
      setSaveError(message);
    };
    const validationError = validateDisabledRange(
      values,
      getMinDisabledDate(),
      editingRange?.start_date,
    );
    if (validationError) {
      reportError(validationError);
      return;
    }

    savingRef.current = true;
    setDisabledActionLoadingId(editingRange?.id ?? "new");
    try {
      const datesChanged = !editingRange ||
        editingRange.start_date !== values.start_date ||
        editingRange.end_date !== values.end_date;
      if (datesChanged) {
        const { data: rangeReservations, error: rangeReservationsError } =
          await supabase
            .from("reservations")
            .select("id, customer_name, event_date, start_time, end_time, status")
            .gte("event_date", values.start_date)
            .lte("event_date", values.end_date)
            .neq("status", "rejected")
            .order("event_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (rangeReservationsError) {
          console.error(
            "Error checking reservations in disabled range:",
            rangeReservationsError,
          );
          reportError(
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

      }
      const payload = {
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason || null,
      };
      const mutation = editingRange
        ? supabase.from("disabled_reservation_dates").update(payload).eq("id", editingRange.id)
        : supabase.from("disabled_reservation_dates").insert(payload);
      const { data, error } = await mutation.select("id").single();
      if (error || !data) throw error ?? new Error("Missing saved disabled range");

      resetForm();
      setManualForm((prev) => ({
        ...prev,
        event_date: prev.event_date >= values.start_date && prev.event_date <= values.end_date
          ? getMinReservationDate()
          : prev.event_date,
      }));
      try {
        await Promise.all([fetchDisabledRanges(), fetchManualBlocks(), fetchManualMonthBlocks()]);
      } catch {
        setGlobalError("Las fechas se guardaron, pero no pudimos refrescar el calendario. Tocá Actualizar.");
      }
    } catch (error) {
      console.error("Error saving disabled reservation range:", error);
      reportError("No pudimos guardar las fechas inhabilitadas. Revisá los permisos o intentá nuevamente.");
    } finally {
      savingRef.current = false;
      setDisabledActionLoadingId(null);
    }
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
      if (editingRange?.id === id) resetForm();
      await fetchDisabledRanges();
      await fetchManualBlocks();
      await fetchManualMonthBlocks();
    }

    setDisabledActionLoadingId(null);
  }

  return { handleSaveDisabledRange, deleteDisabledRange, editingRange, saveError, startEditingRange, cancelEditingRange: resetForm };
}
