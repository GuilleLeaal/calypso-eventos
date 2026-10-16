import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { DisabledReservationDateRange } from "../types";
import { getMinReservationDate } from "../utils/dateHelpers";

export function useDisabledRanges({
  isLoggedIn,
  setGlobalError,
}: {
  isLoggedIn: boolean;
  setGlobalError: (message: string) => void;
}) {
  const [disabledRanges, setDisabledRanges] = useState<
    DisabledReservationDateRange[]
  >([]);
  const [loadingDisabledRanges, setLoadingDisabledRanges] = useState(false);
  const [disabledActionLoadingId, setDisabledActionLoadingId] = useState<
    string | null
  >(null);

  const [disabledForm, setDisabledForm] = useState({
    start_date: getMinReservationDate(),
    end_date: getMinReservationDate(),
    reason: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchDisabledRanges();
    }
  }, [isLoggedIn]);

  async function fetchDisabledRanges() {
    if (!isLoggedIn) return;

    setLoadingDisabledRanges(true);

    try {
      const { data, error } = await supabase
        .from("disabled_reservation_dates")
        .select("id, start_date, end_date, reason, created_at")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error fetching disabled reservation dates:", error);
        setGlobalError("No pudimos cargar las fechas inhabilitadas.");
        setDisabledRanges([]);
        return;
      }

      setDisabledRanges((data || []) as DisabledReservationDateRange[]);
    } catch (error) {
      console.error("Unexpected disabled dates error:", error);
      setGlobalError("Ocurrió un error cargando las fechas inhabilitadas.");
      setDisabledRanges([]);
    } finally {
      setLoadingDisabledRanges(false);
    }
  }

  return {
    disabledRanges,
    setDisabledRanges,
    loadingDisabledRanges,
    disabledActionLoadingId,
    setDisabledActionLoadingId,
    disabledForm,
    setDisabledForm,
    fetchDisabledRanges,
  };
}
