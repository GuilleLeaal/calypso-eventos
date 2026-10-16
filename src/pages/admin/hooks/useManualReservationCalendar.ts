import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  getAvailableSlots,
  type ReservationBlock,
  type ReservationSlot,
} from "../../../lib/reservations";
import { RESERVATION_EXPORT_COLUMNS } from "../constants";
import type {
  AdminSection,
  DisabledReservationDateRange,
  ManualReservationFormValues,
  Reservation,
} from "../types";
import {
  createLocalDate,
  getMinReservationDate,
  getMonthEnd,
  getMonthStart,
  isDateInDisabledRange,
  toInputDate,
} from "../utils/dateHelpers";

export function useManualReservationCalendar({
  isLoggedIn,
  activeSection,
  disabledRanges,
}: {
  isLoggedIn: boolean;
  activeSection: AdminSection;
  disabledRanges: DisabledReservationDateRange[];
}) {
  const manualBlocksRequestIdRef = useRef(0);
  const manualMonthBlocksRequestIdRef = useRef(0);

  const [manualBlocks, setManualBlocks] = useState<ReservationBlock[]>([]);
  const [manualMonthBlocks, setManualMonthBlocks] = useState<
    ReservationBlock[]
  >([]);
  const [manualMonthReservations, setManualMonthReservations] = useState<
    Reservation[]
  >([]);
  const [loadingManualSlots, setLoadingManualSlots] = useState(false);
  const [loadingManualMonthBlocks, setLoadingManualMonthBlocks] =
    useState(false);

  const [manualCalendarMonth, setManualCalendarMonth] = useState(() =>
    createLocalDate(getMinReservationDate()),
  );

  const [manualForm, setManualForm] = useState<ManualReservationFormValues>({
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

  const manualSlots = useMemo(() => {
    if (isDateInDisabledRange(manualForm.event_date, disabledRanges)) {
      return [];
    }

    return getAvailableSlots(manualForm.event_date, manualBlocks);
  }, [manualForm.event_date, manualBlocks, disabledRanges]);

  useEffect(() => {
    if (isLoggedIn && activeSection === "reservations") {
      fetchManualBlocks();
    }
  }, [manualForm.event_date, isLoggedIn, activeSection]);

  useEffect(() => {
    if (isLoggedIn && activeSection === "reservations") {
      fetchManualMonthBlocks();
    }
  }, [manualCalendarMonth, isLoggedIn, activeSection]);

  async function fetchManualBlocks() {
    if (!manualForm.event_date || !isLoggedIn) return;

    const requestId = ++manualBlocksRequestIdRef.current;
    const targetDate = manualForm.event_date;

    setLoadingManualSlots(true);

    try {
      const { data, error } = await supabase.rpc(
        "get_public_reservation_blocks",
        {
          target_date: targetDate,
        },
      );

      if (requestId !== manualBlocksRequestIdRef.current) {
        return;
      }

      if (error) {
        console.error("Error fetching manual reservation blocks:", error);
        setManualBlocks([]);
        return;
      }

      setManualBlocks((data || []) as ReservationBlock[]);
    } catch (error) {
      if (requestId !== manualBlocksRequestIdRef.current) {
        return;
      }

      console.error("Unexpected manual blocks error:", error);
      setManualBlocks([]);
    } finally {
      if (requestId === manualBlocksRequestIdRef.current) {
        setLoadingManualSlots(false);
      }
    }
  }

  async function fetchManualMonthBlocks() {
    if (!isLoggedIn) return;

    const requestId = ++manualMonthBlocksRequestIdRef.current;

    const start = toInputDate(getMonthStart(manualCalendarMonth));
    const end = toInputDate(getMonthEnd(manualCalendarMonth));

    setLoadingManualMonthBlocks(true);

    try {
      const [blocksResult, reservationsResult] = await Promise.all([
        supabase.rpc("get_public_reservation_blocks_range", {
          start_date: start,
          end_date: end,
        }),
        supabase
          .from("reservations")
          .select(RESERVATION_EXPORT_COLUMNS)
          .gte("event_date", start)
          .lte("event_date", end)
          .neq("status", "rejected")
          .order("event_date", { ascending: true })
          .order("start_time", { ascending: true }),
      ]);

      if (requestId !== manualMonthBlocksRequestIdRef.current) {
        return;
      }

      if (blocksResult.error) {
        console.error(
          "Error fetching manual month blocks:",
          blocksResult.error,
        );
        setManualMonthBlocks([]);
      } else {
        setManualMonthBlocks((blocksResult.data || []) as ReservationBlock[]);
      }

      if (reservationsResult.error) {
        console.error(
          "Error fetching month reservations:",
          reservationsResult.error,
        );
        setManualMonthReservations([]);
      } else {
        setManualMonthReservations(
          (reservationsResult.data || []) as Reservation[],
        );
      }
    } catch (error) {
      if (requestId !== manualMonthBlocksRequestIdRef.current) {
        return;
      }

      console.error("Unexpected manual month blocks error:", error);

      setManualMonthBlocks([]);
      setManualMonthReservations([]);
    } finally {
      if (requestId === manualMonthBlocksRequestIdRef.current) {
        setLoadingManualMonthBlocks(false);
      }
    }
  }

  function applyManualSlot(slot: ReservationSlot) {
    setManualForm((prev) => ({
      ...prev,
      start_time: slot.startTime,
      end_time: slot.endTime,
    }));
  }

  return {
    setManualBlocks,
    manualMonthBlocks,
    setManualMonthBlocks,
    manualMonthReservations,
    setManualMonthReservations,
    loadingManualSlots,
    loadingManualMonthBlocks,
    manualCalendarMonth,
    setManualCalendarMonth,
    manualForm,
    setManualForm,
    manualSlots,
    fetchManualBlocks,
    fetchManualMonthBlocks,
    applyManualSlot,
  };
}
