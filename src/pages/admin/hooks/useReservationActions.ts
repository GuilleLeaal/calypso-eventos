import { useRef, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  DisabledReservationDateRange,
  ManualReservationFormValues,
  ReservationDetailsUpdateValues,
  ReservationStatus,
  ReservationUpdateValues,
} from "../types";
import {
  createLocalDate,
  getMinReservationDate,
  isDateInDisabledRange,
} from "../utils/dateHelpers";
import {
  parseReservationAmounts,
  validateContactAndGuests,
  validateReservationTimes,
} from "../utils/reservationValidation";

export function useReservationActions({
  setGlobalError,
  disabledRanges,
  manualForm,
  setManualForm,
  setManualCalendarMonth,
  fetchReservations,
  fetchManualBlocks,
  fetchManualMonthBlocks,
}: {
  setGlobalError: (message: string) => void;
  disabledRanges: DisabledReservationDateRange[];
  manualForm: ManualReservationFormValues;
  setManualForm: Dispatch<SetStateAction<ManualReservationFormValues>>;
  setManualCalendarMonth: Dispatch<SetStateAction<Date>>;
  fetchReservations: (silent?: boolean) => Promise<void>;
  fetchManualBlocks: () => Promise<void>;
  fetchManualMonthBlocks: () => Promise<void>;
}) {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [creatingReservation, setCreatingReservation] = useState(false);
  const creatingReservationRef = useRef(false);

  async function updateReservation(
    id: string,
    values: ReservationUpdateValues,
  ) {
    setActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase
      .from("reservations")
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating reservation:", error);
      setGlobalError("No pudimos actualizar la reserva.");
      setActionLoadingId(null);
      return false;
    }

    const affectsAvailability = [
      "event_date",
      "start_time",
      "end_time",
      "status",
    ].some((field) => field in values);

    await fetchReservations(true);

    if (affectsAvailability) {
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);
    }

    setActionLoadingId(null);
    return true;
  }

  async function updateReservationStatus(
    id: string,
    status: ReservationStatus,
  ) {
    setActionLoadingId(id);
    setGlobalError("");

    try {
      const { error } = await supabase.rpc("set_admin_reservation_status_v2", {
        p_reservation_id: id,
        p_status: status,
      });

      if (error) {
        console.error("Error updating reservation status:", error);
        setGlobalError(
          error.message || "No pudimos actualizar el estado de la reserva.",
        );
        return false;
      }

      await fetchReservations(true);
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);

      return true;
    } catch (error) {
      console.error("Unexpected reservation status update error:", error);
      setGlobalError("Ocurrió un error actualizando el estado de la reserva.");
      return false;
    } finally {
      setActionLoadingId(null);
    }
  }

  async function updateReservationDetails(
    id: string,
    values: ReservationDetailsUpdateValues,
  ): Promise<string | null> {
    setActionLoadingId(id);

    try {
      const { error } = await supabase.rpc("update_admin_reservation_v2", {
        p_reservation_id: id,
        p_customer_name: values.customer_name,
        p_event_type: values.event_type,
        p_phone: values.phone,
        p_email: values.email,
        p_children_count: values.children_count,
        p_adults_count: values.adults_count,
        p_event_date: values.event_date,
        p_start_time: values.start_time,
        p_end_time: values.end_time,
        p_status: values.status,
        p_deposit_paid: values.deposit_paid,
        p_agreed_price: values.agreed_price,
        p_settlement_amount: values.settlement_amount,
        p_deposit_amount: values.deposit_amount,
        p_waiters_count: values.waiters_count,
        p_animators_count: values.animators_count,
        p_discovery_source: values.discovery_source,
        p_clear_legacy_staff: values.staff_count === null,
      });

      if (error) {
        console.error("Error updating reservation details:", error);
        return error.message || "No pudimos actualizar la reserva.";
      }

      await fetchReservations(true);
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);

      return null;
    } catch (error) {
      console.error("Unexpected reservation details update error:", error);
      return "Ocurrió un error actualizando la reserva.";
    } finally {
      setActionLoadingId(null);
    }
  }

  async function deleteReservation(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar esta reserva? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;

    setActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
      console.error("Error deleting reservation:", error);
      setGlobalError("No pudimos borrar la reserva.");
    } else {
      await fetchReservations(true);
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);
    }

    setActionLoadingId(null);
  }

  async function handleCreateManualReservation(event: FormEvent) {
    event.preventDefault();

    setGlobalError("");

    const guests = validateContactAndGuests(manualForm);

    if (!guests.ok) {
      setGlobalError(guests.error);
      return;
    }

    const amounts = parseReservationAmounts({
      agreed_price: manualForm.agreed_price,
      deposit_amount: manualForm.deposit_amount,
      waiters_count: manualForm.waiters_count,
      animators_count: manualForm.animators_count,
    });

    if (!amounts.ok) {
      setGlobalError(amounts.error);
      return;
    }

    if (isDateInDisabledRange(manualForm.event_date, disabledRanges)) {
      setGlobalError(
        "Esta fecha está inhabilitada. Habilitala primero para crear una reserva.",
      );
      return;
    }

    const times = validateReservationTimes(
      manualForm.start_time,
      manualForm.end_time,
    );

    if (!times.ok) {
      setGlobalError(times.error);
      return;
    }

    const { childrenCount, adultsCount } = guests.value;
    const { agreedPrice, depositAmount, waitersCount, animatorsCount } =
      amounts.value;
    const { startTime, endTime } = times.value;

    if (creatingReservationRef.current) return;

    creatingReservationRef.current = true;
    setCreatingReservation(true);

    try {
      const { error } = await supabase.rpc("create_admin_reservation_v2", {
        p_customer_name: manualForm.customer_name.trim(),
        p_event_type: manualForm.event_type,
        p_phone: manualForm.phone.trim(),
        p_email: manualForm.email.trim(),
        p_event_date: manualForm.event_date,
        p_start_time: startTime,
        p_end_time: endTime,
        p_children_count: childrenCount,
        p_adults_count: adultsCount,
        p_deposit_paid: manualForm.deposit_paid,
        p_notes: manualForm.notes.trim(),
        p_discovery_source: manualForm.discovery_source,
        p_agreed_price: agreedPrice,
        p_deposit_amount: depositAmount,
        p_waiters_count: waitersCount,
        p_animators_count: animatorsCount,
      });

      if (error) {
        console.error("Error creating manual reservation:", error);
        setGlobalError(
          error.message ||
            "No pudimos crear la reserva manual. Revisá los datos ingresados.",
        );
        return;
      }

      setManualForm({
        customer_name: "",
        event_type: "",
        phone: "",
        email: "",
        children_count: "",
        adults_count: "",
        event_date: getMinReservationDate(),
        start_time: "17:00",
        end_time: "20:00",
        notes: "",
        deposit_paid: false,
        agreed_price: "",
        deposit_amount: "",
        waiters_count: "",
        animators_count: "",
        discovery_source: "",
      });

      setManualCalendarMonth(createLocalDate(getMinReservationDate()));

      await fetchReservations(true);
      await Promise.all([fetchManualBlocks(), fetchManualMonthBlocks()]);
    } finally {
      creatingReservationRef.current = false;
      setCreatingReservation(false);
    }
  }

  return {
    actionLoadingId,
    creatingReservation,
    updateReservation,
    updateReservationStatus,
    updateReservationDetails,
    deleteReservation,
    handleCreateManualReservation,
  };
}
