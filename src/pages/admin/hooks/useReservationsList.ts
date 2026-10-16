import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { RESERVATIONS_PER_PAGE } from "../constants";
import type { AdminSection, Reservation, ReservationStatus } from "../types";

export function useReservationsList({
  isLoggedIn,
  activeSection,
  setGlobalError,
}: {
  isLoggedIn: boolean;
  activeSection: AdminSection;
  setGlobalError: (message: string) => void;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationPage, setReservationPage] = useState(1);
  const [reservationTotalCount, setReservationTotalCount] = useState(0);
  const [reservationSearch, setReservationSearch] = useState("");
  const [debouncedReservationSearch, setDebouncedReservationSearch] =
    useState("");
  const [reservationDateFromFilter, setReservationDateFromFilter] =
    useState("");
  const [reservationDateToFilter, setReservationDateToFilter] = useState("");
  const [loadingReservations, setLoadingReservations] = useState(false);
  const reservationsRequestIdRef = useRef(0);

  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedReservationSearch(reservationSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [reservationSearch]);

  useEffect(() => {
    if (
      isLoggedIn &&
      (activeSection === "reservations" || activeSection === "completed_events")
    ) {
      fetchReservations();
    }
  }, [
    isLoggedIn,
    activeSection,
    filter,
    reservationPage,
    debouncedReservationSearch,
    reservationDateFromFilter,
    reservationDateToFilter,
  ]);

  useEffect(() => {
    if (
      !isLoggedIn ||
      (activeSection !== "reservations" && activeSection !== "completed_events")
    ) {
      return;
    }

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void fetchReservations(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchReservations(true);
      }
    };

    const intervalId = window.setInterval(refreshIfVisible, 60_000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isLoggedIn,
    activeSection,
    filter,
    reservationPage,
    debouncedReservationSearch,
    reservationDateFromFilter,
    reservationDateToFilter,
  ]);

  const reservationTotalPages = Math.max(
    1,
    Math.ceil(reservationTotalCount / RESERVATIONS_PER_PAGE),
  );

  const reservationFirstItem =
    reservationTotalCount === 0
      ? 0
      : (reservationPage - 1) * RESERVATIONS_PER_PAGE + 1;

  const reservationLastItem = Math.min(
    reservationPage * RESERVATIONS_PER_PAGE,
    reservationTotalCount,
  );

  const hasReservationFilters = Boolean(
    reservationSearch.trim() ||
    reservationDateFromFilter ||
    reservationDateToFilter ||
    (activeSection === "reservations" && filter !== "all"),
  );

  function clearReservationFilters() {
    setReservationSearch("");
    setDebouncedReservationSearch("");
    setReservationDateFromFilter("");
    setReservationDateToFilter("");
    setFilter("all");
    setReservationPage(1);
  }

  async function fetchReservations(silent = false) {
    const requestId = ++reservationsRequestIdRef.current;

    if (!silent) {
      setLoadingReservations(true);
      setGlobalError("");
    }

    try {
      const { error: expiredError } = await supabase.rpc(
        "mark_expired_reservations",
      );

      if (expiredError) {
        console.error("Error marking expired reservations:", expiredError);
      }

      const { error: completeError } = await supabase.rpc(
        "mark_completed_reservations",
      );

      if (completeError) {
        console.error("Error marking completed reservations:", completeError);
      }

      if (requestId !== reservationsRequestIdRef.current) {
        return;
      }

      const from = (reservationPage - 1) * RESERVATIONS_PER_PAGE;
      const to = from + RESERVATIONS_PER_PAGE - 1;

      let query = supabase.from("reservations").select("*", { count: "exact" });

      if (activeSection === "completed_events") {
        query = query.eq("status", "completed");
      } else {
        query = query.neq("status", "completed");

        if (filter !== "all") {
          query = query.eq("status", filter);
        }
      }

      if (debouncedReservationSearch) {
        query = query.ilike("customer_name", `%${debouncedReservationSearch}%`);
      }

      if (reservationDateFromFilter) {
        query = query.gte("event_date", reservationDateFromFilter);
      }

      if (reservationDateToFilter) {
        query = query.lte("event_date", reservationDateToFilter);
      }

      const showNewestFirst = activeSection === "completed_events";

      const { data, error, count } = await query
        .order("event_date", {
          ascending: !showNewestFirst,
        })
        .order("start_time", {
          ascending: !showNewestFirst,
        })
        .range(from, to);

      if (requestId !== reservationsRequestIdRef.current) {
        return;
      }

      if (error) {
        console.error("Error fetching reservations:", error);

        setGlobalError(
          "No pudimos cargar las reservas. Revisá permisos de Supabase.",
        );

        setReservations([]);
        setReservationTotalCount(0);
        return;
      }

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / RESERVATIONS_PER_PAGE));

      if (reservationPage > totalPages) {
        setReservationPage(totalPages);
        return;
      }

      setReservations((data || []) as Reservation[]);
      setReservationTotalCount(total);
    } catch (error) {
      if (requestId !== reservationsRequestIdRef.current) {
        return;
      }

      console.error("Unexpected fetch reservations error:", error);

      setGlobalError("Ocurrió un error cargando las reservas.");

      setReservations([]);
      setReservationTotalCount(0);
    } finally {
      if (requestId === reservationsRequestIdRef.current) {
        setLoadingReservations(false);
      }
    }
  }

  return {
    reservations,
    setReservations,
    reservationPage,
    setReservationPage,
    reservationTotalCount,
    reservationSearch,
    setReservationSearch,
    reservationDateFromFilter,
    setReservationDateFromFilter,
    reservationDateToFilter,
    setReservationDateToFilter,
    loadingReservations,
    filter,
    setFilter,
    reservationTotalPages,
    reservationFirstItem,
    reservationLastItem,
    hasReservationFilters,
    clearReservationFilters,
    fetchReservations,
  };
}
