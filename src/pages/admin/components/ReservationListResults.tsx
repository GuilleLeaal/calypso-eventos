<<<<<<< Updated upstream
import type { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
=======
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2 } from "lucide-react";
>>>>>>> Stashed changes
import type {
  DisabledReservationDateRange,
  Reservation,
  ReservationDetailsUpdateValues,
  ReservationStatus,
  ReservationUpdateValues,
} from "../types";
import { ReservationCard } from "./ReservationCard";

export function ReservationListResults({
  reservations,
  loading,
  isCompletedView,
  emptyMessage,
  firstItem,
  lastItem,
  totalCount,
  page,
  totalPages,
  setPage,
  disabledRanges,
  actionLoadingId,
  onUpdateStatus,
  onUpdate,
  onUpdateDetails,
  onDelete,
}: {
  reservations: Reservation[];
  loading: boolean;
  isCompletedView: boolean;
  emptyMessage: string;
  firstItem: number;
  lastItem: number;
  totalCount: number;
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
  disabledRanges: DisabledReservationDateRange[];
  actionLoadingId: string | null;
  onUpdateStatus: (id: string, status: ReservationStatus) => Promise<boolean>;
  onUpdate: (id: string, values: ReservationUpdateValues) => Promise<boolean>;
  onUpdateDetails: (
    id: string,
    values: ReservationDetailsUpdateValues,
  ) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
<<<<<<< Updated upstream
  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
      </div>
    );
=======
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === resultsRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => { document.removeEventListener("fullscreenchange", sync); };
  }, []);

  async function toggleFullscreen() {
    try {
      setFullscreenError("");
      if (document.fullscreenElement === resultsRef.current) await document.exitFullscreen();
      else await resultsRef.current?.requestFullscreen();
    } catch {
      setFullscreenError("El navegador no permite pantalla completa en este momento.");
    }
>>>>>>> Stashed changes
  }

  if (reservations.length === 0) {
    return (
      <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
        {emptyMessage}
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
    <div className="mt-6 space-y-4">
      <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5748]">
        Mostrando {firstItem}-{lastItem} de {totalCount}
=======
    <div ref={resultsRef} className={`reservation-results mt-6 scroll-mt-24 overflow-hidden rounded-lg border border-[#BEB29F] bg-[#CFC5B5] ${fullscreen ? "!m-0 flex h-dvh flex-col !rounded-none" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BEB29F] bg-[#D8CEBC] px-4 py-3 text-[13px] font-semibold text-ink-soft" role="status" aria-live="polite" aria-atomic="true">
        <span>{loading ? "Cargando reservas…" : totalCount > 0 ? `Mostrando ${firstItem}–${lastItem} de ${totalCount}` : "Sin resultados"}</span>
        <span>Página {page} de {totalPages}</span>
        <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen} className="inline-flex items-center gap-2 rounded-md border border-[#BEB29F] bg-[#D8CEBC] px-3 py-2 text-[#352F28]" aria-label={fullscreen ? "Salir de pantalla completa" : "Ver reservas en pantalla completa"}>
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
>>>>>>> Stashed changes
      </div>
      {fullscreenError && <p role="alert" className="px-4 py-2 text-sm text-red-800">{fullscreenError}</p>}

<<<<<<< Updated upstream
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          isCompletedView={isCompletedView}
          disabledRanges={disabledRanges}
          loading={actionLoadingId === reservation.id}
          onApprove={() => onUpdateStatus(reservation.id, "approved")}
          onReject={() => onUpdateStatus(reservation.id, "rejected")}
          onDepositChange={(value) =>
            onUpdate(reservation.id, { deposit_paid: value })
          }
          onSaveDetails={(values) => onUpdateDetails(reservation.id, values)}
          onSaveNotes={(notes) => onUpdate(reservation.id, { notes })}
          onDelete={() => onDelete(reservation.id)}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-[#6d5748]">
            Página {page} de {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Siguiente
            </button>
          </div>
=======
      <div ref={scrollRef} tabIndex={0} role="region" aria-label={isCompletedView ? "Resultados de eventos finalizados" : "Resultados de reservas"} aria-busy={loading}
        className={`${fullscreen ? "min-h-0 flex-1" : "max-h-[calc(100dvh-9rem)]"} overflow-y-auto overscroll-contain bg-[#CFC5B5] p-3 shadow-inner [scrollbar-gutter:stable] [scrollbar-color:#8D806B_#CFC5B5]`}>
        {loading ? (
          <div className="grid h-full place-items-center">
            <div className="flex items-center gap-3 text-sm text-calypso-700">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              Cargando resultados…
            </div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-soft">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                isCompletedView={isCompletedView}
                disabledRanges={disabledRanges}
                loading={actionLoadingId === reservation.id}
                onApprove={() => onUpdateStatus(reservation.id, "approved")}
                onReject={() => onUpdateStatus(reservation.id, "rejected")}
                onDepositChange={(value) => onUpdate(reservation.id, { deposit_paid: value })}
                onSaveDetails={(values) => onUpdateDetails(reservation.id, values)}
                onSaveNotes={(notes) => onUpdate(reservation.id, { notes })}
                onDelete={() => onDelete(reservation.id)}
              />
            ))}
          </div>
        )}
      </div>

      <nav aria-label={isCompletedView ? "Paginación de eventos finalizados" : "Paginación de reservas"}
        className="flex flex-wrap items-center justify-between gap-3 border-t border-[#BEB29F] bg-[#D8CEBC] px-4 py-3">
        <p className="text-[13px] text-ink-soft">Página <span className="font-semibold text-ink">{page}</span> de {totalPages}</p>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/20 bg-[#E4DCCD] px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper-deep disabled:cursor-not-allowed disabled:opacity-45 sm:px-4">
            <ChevronLeft size={16} aria-hidden="true" />Anterior
          </button>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => changePage(page + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calypso-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-calypso-800 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4">
            Siguiente<ChevronRight size={16} aria-hidden="true" />
          </button>
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}
