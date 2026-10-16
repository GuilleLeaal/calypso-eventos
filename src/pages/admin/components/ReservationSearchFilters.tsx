import { Search, X } from "lucide-react";
import { formatDateForDisplay } from "../../../lib/reservations";

export function ReservationSearchFilters({
  search,
  dateFrom,
  dateTo,
  totalCount,
  loading,
  hasFilters,
  resultLabel,
  ariaContext,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: {
  search: string;
  dateFrom: string;
  dateTo: string;
  totalCount: number;
  loading: boolean;
  hasFilters: boolean;
  resultLabel: string;
  ariaContext: string;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}) {
  const rangeText =
    dateFrom && dateTo
      ? `${formatDateForDisplay(dateFrom)} → ${formatDateForDisplay(dateTo)}`
      : dateFrom
        ? `Desde ${formatDateForDisplay(dateFrom)}`
        : dateTo
          ? `Hasta ${formatDateForDisplay(dateTo)}`
          : "";

  return (
    <div className="mt-5">
      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
            Buscar por cliente
          </span>

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8a7667]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ej: Santiago, Victoria, Rivas..."
              className="input-contact !pl-12"
              aria-label={`Buscar ${ariaContext} por cliente`}
            />
          </div>
        </label>

        <div className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
            Filtrar por rango de fechas
          </span>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a7667]">
                Desde
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => onDateFromChange(event.target.value)}
                className="input-contact"
                aria-label={`Filtrar ${ariaContext} desde`}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a7667]">
                Hasta
              </span>
              <input
                type="date"
                min={dateFrom || undefined}
                value={dateTo}
                onChange={(event) => onDateToChange(event.target.value)}
                className="input-contact"
                aria-label={`Filtrar ${ariaContext} hasta`}
              />
            </label>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-[#6d5748]/75">
            Para un solo día, usá la misma fecha en Desde y Hasta.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-[#6d5748]">
          {loading
            ? "Actualizando resultados..."
            : `${totalCount} ${resultLabel}`}
          {search.trim() ? ` · Cliente: “${search.trim()}”` : ""}
          {rangeText ? ` · ${rangeText}` : ""}
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dfc8ab] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2f241e] transition hover:bg-[#fff9f0]"
          >
            <X size={13} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
