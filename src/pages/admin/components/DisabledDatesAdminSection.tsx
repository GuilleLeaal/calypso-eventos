import type { Dispatch, FormEvent, SetStateAction } from "react";
import { CalendarOff, Check, Loader2 } from "lucide-react";
import type { DisabledReservationDateRange } from "../types";
import { getDisabledRangeLabel, getMinDisabledDate } from "../utils/dateHelpers";

export function DisabledDatesAdminSection({
  disabledRanges,
  loadingDisabledRanges,
  actionLoadingId,
  disabledForm,
  setDisabledForm,
  onCreate,
  onDelete,
}: {
  disabledRanges: DisabledReservationDateRange[];
  loadingDisabledRanges: boolean;
  actionLoadingId: string | null;
  disabledForm: {
    start_date: string;
    end_date: string;
    reason: string;
  };
  setDisabledForm: Dispatch<
    SetStateAction<{
      start_date: string;
      end_date: string;
      reason: string;
    }>
  >;
  onCreate: (event: FormEvent) => void;
  onDelete: (id: string) => void;
}) {
  const sortedRanges = [...disabledRanges].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );

  return (
    <div className="mt-10 grid gap-7 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
        <div className="flex items-start justify-between gap-4 border-b border-[#e4cfad] pb-5">
          <div>
            <h2 className="font-display text-3xl text-[#2f241e]">
              Inhabilitar fechas
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
              Marcá un día puntual o un rango para que no se puedan tomar nuevas
              reservas.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-red-100 text-red-700 sm:grid">
            <CalendarOff size={20} />
          </div>
        </div>

        <form onSubmit={onCreate} className="mt-6 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Desde
              </span>
              <input
                type="date"
                min={getMinDisabledDate()}
                value={disabledForm.start_date}
                onChange={(event) =>
                  setDisabledForm((prev) => ({
                    ...prev,
                    start_date: event.target.value,
                    end_date:
                      prev.end_date < event.target.value
                        ? event.target.value
                        : prev.end_date,
                  }))
                }
                className="input-contact"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Hasta
              </span>
              <input
                type="date"
                min={disabledForm.start_date || getMinDisabledDate()}
                value={disabledForm.end_date}
                onChange={(event) =>
                  setDisabledForm((prev) => ({
                    ...prev,
                    end_date: event.target.value,
                  }))
                }
                className="input-contact"
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
              Motivo interno
            </span>
            <textarea
              value={disabledForm.reason}
              onChange={(event) =>
                setDisabledForm((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              className="input-contact min-h-24 resize-none"
              placeholder="Ej: mantenimiento, evento privado, personal no disponible..."
            />
          </label>

          <button
            type="submit"
            disabled={actionLoadingId === "new"}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-red-700 px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(185,28,28,0.18)] transition hover:-translate-y-0.5 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoadingId === "new" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CalendarOff size={18} />
            )}
            Inhabilitar fecha
          </button>

          <div className="rounded-[1rem] border border-[#dfc8ab] bg-white/45 px-4 py-3 text-xs leading-relaxed text-[#6d5748]">
            Esto bloquea nuevas reservas para el público y también evita que se
            cree una reserva manual en esa fecha desde este panel. No borra
            reservas existentes.
          </div>
        </form>
      </section>

      <section className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-[#e4cfad] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-[#2f241e]">
              Fechas bloqueadas
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
              Controlá rápidamente qué días no se ofrecerán para reservas.
            </p>
          </div>

          <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-700">
            {disabledRanges.length} activas
          </span>
        </div>

        {loadingDisabledRanges ? (
          <div className="grid min-h-64 place-items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
          </div>
        ) : sortedRanges.length === 0 ? (
          <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm leading-relaxed text-[#5c473b]">
            No hay fechas inhabilitadas. El calendario queda disponible según
            reservas, separación horaria y reglas generales.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {sortedRanges.map((range) => (
              <article
                key={range.id}
                className="rounded-[1.35rem] border border-red-200 bg-red-50/70 p-5 shadow-[0_12px_32px_rgba(90,64,50,0.05)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-red-700">
                      <CalendarOff size={14} />
                      Inhabilitada
                    </span>

                    <h3 className="mt-3 font-display text-2xl text-[#2f241e]">
                      {getDisabledRangeLabel(range)}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                      {range.reason || "Sin motivo indicado."}
                    </p>

                    <p className="mt-3 text-xs font-medium text-[#8a7667]">
                      Creada el{" "}
                      {new Date(range.created_at).toLocaleString("es-UY")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(range.id)}
                    disabled={actionLoadingId === range.id}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
                  >
                    {actionLoadingId === range.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Check size={15} />
                    )}
                    Habilitar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
