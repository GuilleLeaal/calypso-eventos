import { supabase } from "../../../lib/supabase";
import { getTodayInputValue } from "../../../lib/reservations";
import { RESERVATION_EXPORT_COLUMNS } from "../constants";
import type { Reservation } from "../types";
import {
  downloadExcelFile,
  fetchAllReservationPages,
  getClientExportKey,
  getEventTotalIncome,
} from "../utils/exportHelpers";

export function useAdminExports({
  setGlobalError,
  fetchReservations,
}: {
  setGlobalError: (message: string) => void;
  fetchReservations: (silent?: boolean) => Promise<void>;
}) {
  async function fetchCompletedReservationsForExport() {
    const { error: completeError } = await supabase.rpc(
      "mark_completed_reservations",
    );

    if (completeError) {
      console.error("Error marking completed before export:", completeError);
    }

    return fetchAllReservationPages(async (from, to) => {
      const { data, error } = await supabase
        .from("reservations")
        .select(RESERVATION_EXPORT_COLUMNS)
        .eq("status", "completed")
        .order("event_date", { ascending: false })
        .order("end_time", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to);

      if (error) {
        console.error("Error exporting completed reservations:", error);

        throw new Error("No pudimos obtener los eventos finalizados.");
      }

      return (data || []) as Reservation[];
    });
  }

  async function downloadClientsExcel() {
    setGlobalError("");

    try {
      const allReservations = await fetchAllReservationPages(
        async (from, to) => {
          const { data, error } = await supabase
            .from("reservations")
            .select(RESERVATION_EXPORT_COLUMNS)
            .order("created_at", { ascending: false })
            .order("id", { ascending: true })
            .range(from, to);

          if (error) {
            console.error("Error exporting clients:", error);

            throw new Error(
              "No pudimos obtener la información de los clientes.",
            );
          }

          return (data || []) as Reservation[];
        },
      );

      if (allReservations.length === 0) {
        setGlobalError("No hay clientes registrados todavía.");
        return;
      }

      const uniqueClients = new Map<string, Reservation>();

      for (const reservation of allReservations) {
        const key = getClientExportKey(reservation);

        // La consulta viene ordenada por creación, de la más reciente a la más antigua.
        // Si un cliente aparece en varias reservas, conservamos sus datos más recientes.
        if (!uniqueClients.has(key)) {
          uniqueClients.set(key, reservation);
        }
      }

      const headers = [
        "Nombre del cliente",
        "Teléfono",
        "Email",
        "Cómo conoció Calypso",
      ];

      const rows = Array.from(uniqueClients.values())
        .sort((a, b) => a.customer_name.localeCompare(b.customer_name, "es-UY"))
        .map((reservation) => [
          reservation.customer_name,
          reservation.phone,
          reservation.email || "",
          reservation.discovery_source || "",
        ]);

      await downloadExcelFile({
        filename: `clientes-calypso-${getTodayInputValue()}.xlsx`,
        sheetName: "Clientes",
        headers,
        rows,
        columnOptions: [
          { index: 1, minWidth: 20, maxWidth: 40 },
          { index: 2, minWidth: 16, maxWidth: 24 },
          { index: 3, minWidth: 24, maxWidth: 42 },
          { index: 4, minWidth: 22, maxWidth: 38 },
        ],
      });
    } catch (error) {
      console.error("Unexpected client export error:", error);
      setGlobalError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error generando el archivo de clientes.",
      );
    }
  }

  async function downloadEventsExcel() {
    setGlobalError("");

    try {
      const completedReservations = await fetchCompletedReservationsForExport();

      if (completedReservations.length === 0) {
        setGlobalError(
          "No hay eventos finalizados todavía para generar el archivo de eventos.",
        );
        return;
      }

      const headers = [
        "Nombre del cliente",
        "Evento",
        "Fecha",
        "Cantidad de adultos",
        "Cantidad de niños",
        "Cantidad de mozos",
        "Cantidad de animadores",
        "Ingreso total",
      ];

      const rows = completedReservations.map((reservation) => [
        reservation.customer_name,
        reservation.event_type,
        new Date(`${reservation.event_date}T12:00:00`),
        reservation.adults_count ?? "",
        reservation.children_count ?? "",
        reservation.waiters_count ?? "",
        reservation.animators_count ?? "",
        getEventTotalIncome(reservation),
      ]);

      await downloadExcelFile({
        filename: `eventos-finalizados-calypso-${getTodayInputValue()}.xlsx`,
        sheetName: "Eventos finalizados",
        headers,
        rows,
        columnOptions: [
          { index: 1, minWidth: 20, maxWidth: 40 },
          { index: 2, minWidth: 20, maxWidth: 38 },
          { index: 3, numberFormat: "dd/mm/yyyy", minWidth: 14, maxWidth: 16 },
          { index: 4, minWidth: 18, maxWidth: 22 },
          { index: 5, minWidth: 16, maxWidth: 20 },
          { index: 6, minWidth: 18, maxWidth: 22 },
          { index: 7, minWidth: 20, maxWidth: 24 },
          { index: 8, numberFormat: "$ #,##0", minWidth: 16, maxWidth: 24 },
        ],
      });

      await fetchReservations();
    } catch (error) {
      console.error("Unexpected event export error:", error);
      setGlobalError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error generando el archivo de eventos.",
      );
    }
  }

  return { downloadClientsExcel, downloadEventsExcel };
}
