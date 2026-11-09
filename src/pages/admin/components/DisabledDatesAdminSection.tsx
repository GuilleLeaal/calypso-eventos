import { useRef, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { CalendarOff, Check, Loader2, Pencil } from "lucide-react";
import type { DisabledReservationDateRange } from "../types";
import { getDisabledRangeLabel, getMinDisabledDate } from "../utils/dateHelpers";

export function DisabledDatesAdminSection({
  disabledRanges,
  loadingDisabledRanges,
  actionLoadingId,
  disabledForm,
  setDisabledForm,
  onSave,
  onDelete,
  editingRange,
  saveError,
  onEdit,
  onCancelEdit,
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
  onSave: (event: FormEvent) => void;
  onDelete: (id: string) => void;
  editingRange: DisabledReservationDateRange | null;
  saveError: string;
  onEdit: (range: DisabledReservationDateRange) => void;
  onCancelEdit: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const saving = actionLoadingId !== null;
  const sortedRanges = [...disabledRanges].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );

  return (
    <div className="mt-10 grid gap-7 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="rounded-xl border border-[#D8D2C5] bg-white/70 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-[#D8D2C5] pb-5">
          <div>
            <h2 className="font-titular font-normal text-3xl text-[#1C1915]">
              {editingRange ? "Editar fechas inhabilitadas" : "Inhabilitar fechas"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B443B]">
              Marcá un día puntual o un rango para que no se puedan tomar nuevas
              reservas.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-red-100 text-red-700 sm:grid">
            <CalendarOff size={20} />
          </div>
        </div>

        <form ref={formRef} onSubmit={onSave} className="mt-6 scroll-mt-28">
          <fieldset disabled={saving} className="grid min-w-0 gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6E6558]">
                  Desde
                </span>
                <input
                  type="date"
                  min={editingRange && editingRange.start_date < getMinDisabledDate() ? editingRange.start_date : getMinDisabledDate()}
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
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6E6558]">
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
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6E6558]">
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
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-red-700 px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(185,28,28,0.18)] transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CalendarOff size={18} />
              )}
              {saving ? "Guardando…" : editingRange ? "Guardar cambios" : "Inhabilitar fecha"}
            </button>
            {editingRange && <button type="button" onClick={onCancelEdit} className="min-h-11 rounded-md border border-ink/20 px-4 py-3 text-sm font-semibold text-ink">Cancelar edición</button>}
            {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}

            <div className="rounded-md border border-[#D8D2C5] bg-white/45 px-4 py-3 text-xs leading-relaxed text-[#6E6558]">
              Esto bloquea nuevas reservas para el público y también evita que se
              cree una reserva manual en esa fecha desde este panel. No borra
              reservas existentes.
            </div>
          </fieldset>
        </form>
      </section>

      <section className="rounded-xl border border-[#D8D2C5] bg-white/70 p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#D8D2C5] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-titular font-normal text-3xl text-[#1C1915]">
              Fechas bloqueadas
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B443B]">
              Controlá rápidamente qué días no se ofrecerán para reservas.
            </p>
          </div>

          <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-700">
            {disabledRanges.length} activas
          </span>
        </div>

        {loadingDisabledRanges ? (
          <div className="grid min-h-64 place-items-center">
            <Loader2 className="h-8 w-8 animate-spin text-calypso-700" />
          </div>
        ) : sortedRanges.length === 0 ? (
          <div className="mt-6 rounded-lg border border-[#D8D2C5] bg-white/45 p-6 text-sm leading-relaxed text-[#4B443B]">
            No hay fechas inhabilitadas. El calendario queda disponible según
            reservas, separación horaria y reglas generales.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {sortedRanges.map((range) => (
              <article
                key={range.id}
                className="rounded-lg border border-red-200 bg-red-50/70 p-5 shadow-[0_12px_32px_rgba(90,64,50,0.05)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-red-700">
                      <CalendarOff size={14} />
                      Inhabilitada
                    </span>

                    <h3 className="mt-3 font-titular font-normal text-2xl text-[#1C1915]">
                      {getDisabledRangeLabel(range)}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#4B443B]">
                      {range.reason || "Sin motivo indicado."}
                    </p>

                    <p className="mt-3 text-xs font-medium text-[#6E6558]">
                      Creada el{" "}
                      {new Date(range.created_at).toLocaleString("es-UY")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={saving} onClick={() => {
                      onEdit(range);
                      formRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
                      formRef.current?.querySelector("input")?.focus({ preventScroll: true });
                    }} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60">
                      <Pencil size={15} />Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(range.id)}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8D2C5] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#1C1915] transition hover:bg-[#FAF7F1] disabled:opacity-60"
                    >
                      {actionLoadingId === range.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}
                      Habilitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
