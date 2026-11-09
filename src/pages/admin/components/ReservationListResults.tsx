import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2 } from "lucide-react";
import type {
  DisabledReservationDateRange, Reservation, ReservationDetailsUpdateValues,
  ReservationStatus, ReservationUpdateValues,
} from "../types";
import { ReservationCard } from "./ReservationCard";

export function ReservationListResults({
  reservations, loading, isCompletedView, emptyMessage, firstItem, lastItem,
  totalCount, page, totalPages, setPage, disabledRanges, actionLoadingId,
  onUpdateStatus, onUpdate, onUpdateDetails, onDelete,
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
  onUpdateDetails: (id: string, values: ReservationDetailsUpdateValues) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
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
  }

  function changePage(nextPage: number) {
    if (loading || nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
    resultsRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    setPage(nextPage);
  }

  return (
    <div ref={resultsRef} className={`reservation-results mt-6 scroll-mt-24 overflow-hidden rounded-lg border border-[#D7CFC1] bg-[#EEEAE2] ${fullscreen ? "!m-0 flex h-dvh flex-col !rounded-none" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D7CFC1] bg-[#F5F1E9] px-4 py-3 text-[13px] font-semibold text-ink-soft" role="status" aria-live="polite" aria-atomic="true">
        <span>{loading ? "Cargando reservas…" : totalCount > 0 ? `Mostrando ${firstItem}–${lastItem} de ${totalCount}` : "Sin resultados"}</span>
        <span>Página {page} de {totalPages}</span>
        <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen} className="inline-flex items-center gap-2 rounded-md border border-[#D7CFC1] bg-white px-3 py-2 text-ink" aria-label={fullscreen ? "Salir de pantalla completa" : "Ver reservas en pantalla completa"}>
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
      </div>
      {fullscreenError && <p role="alert" className="px-4 py-2 text-sm text-red-800">{fullscreenError}</p>}

      <div ref={scrollRef} tabIndex={0} role="region" aria-label={isCompletedView ? "Resultados de eventos finalizados" : "Resultados de reservas"} aria-busy={loading}
        className={`${fullscreen ? "min-h-0 flex-1" : "max-h-[calc(100dvh-9rem)]"} overflow-y-auto overscroll-contain bg-[#EEEAE2] p-3 shadow-inner [scrollbar-gutter:stable] [scrollbar-color:#A99F8F_#EEEAE2]`}>
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
        className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D7CFC1] bg-[#F5F1E9] px-4 py-3">
        <p className="text-[13px] text-ink-soft">Página <span className="font-semibold text-ink">{page}</span> de {totalPages}</p>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper-deep disabled:cursor-not-allowed disabled:opacity-45 sm:px-4">
            <ChevronLeft size={16} aria-hidden="true" />Anterior
          </button>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => changePage(page + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calypso-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-calypso-800 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4">
            Siguiente<ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  );
}
