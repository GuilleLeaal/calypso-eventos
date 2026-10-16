import type { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
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
  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5748]">
        Mostrando {firstItem}-{lastItem} de {totalCount}
      </div>

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
        </div>
      )}
    </div>
  );
}
