import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, CalendarCheck, CheckCircle2, CircleDollarSign, Clock3, Loader2, RefreshCw, WalletCards, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { getTodayInputValue } from "../../../lib/reservations";
import { RESERVATION_EXPORT_COLUMNS, statusLabels } from "../constants";
import type { Reservation } from "../types";
import { fetchAllReservationPages, formatMoney, getReservationBalance } from "../utils/exportHelpers";
import { getMonthlySummary } from "../utils/monthlySummary";

export function MonthlySummaryButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => getTodayInputValue().slice(0, 7));
  const [revision, setRevision] = useState(0);
  const key = `${month}/${revision}`;
  const [result, setResult] = useState<{ key: string; rows: Reservation[]; error?: string } | null>(null);
  const ready = result?.key === key;
  const summary = useMemo(() => getMonthlySummary(result?.rows ?? []), [result]);
  const monthLabel = new Intl.DateTimeFormat("es-UY", { month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00`));

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      try {
        const [year, monthNumber] = month.split("-").map(Number);
        const lastDay = new Date(year, monthNumber, 0).getDate();
        const rows = await fetchAllReservationPages(async (from, to) => {
          const { data, error } = await supabase.from("reservations")
            .select(RESERVATION_EXPORT_COLUMNS)
            .gte("event_date", `${month}-01`).lte("event_date", `${month}-${lastDay}`)
            .order("event_date").order("start_time").order("id").range(from, to)
            .abortSignal(controller.signal);
          if (error) throw error;
          return (data || []) as Reservation[];
        });
        if (!cancelled) setResult({ key, rows });
      } catch {
        if (!cancelled) setResult({ key, rows: [], error: "No pudimos cargar el resumen. Intentá actualizarlo." });
      }
    }
    void load();
    return () => { cancelled = true; controller.abort(); };
  }, [open, month, key]);

  return <>
    <button type="button" onClick={() => { setRevision((value) => value + 1); setOpen(true); dialogRef.current?.showModal(); }} className="inline-flex items-center gap-2 rounded-md border border-night-line bg-night-soft px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-line">
      <BarChart3 size={16} />Resumen mensual
    </button>
    <dialog ref={dialogRef} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} aria-labelledby="monthly-summary-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto overscroll-contain rounded-[1.5rem] border border-[#BEB29F] bg-[#D8CEBC] p-0 font-texto text-[#352F28] shadow-xl backdrop:bg-black/60 [scrollbar-gutter:stable]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#183D39] via-[#17302E] to-[#172421] p-5 text-[#F0E8DA] sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-[#59C1AF]/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8ED3C4]"><BarChart3 size={15} />Calypso · Administración</p>
            <h2 id="monthly-summary-title" className="font-titular text-3xl sm:text-4xl">Tu mes, en números.</h2>
            <p className="mt-2 text-sm text-[#C8D3C9]">Resumen mensual <span className="mx-1 text-[#72B7A8]">/</span> <span className="capitalize text-[#F0E8DA]">{monthLabel}</span></p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Cerrar resumen mensual" className="rounded-full border border-[#8ED3C4]/25 bg-[#8ED3C4]/10 p-2 transition hover:bg-[#8ED3C4]/20"><X size={20} /></button>
        </div>
      </div>
      <div className="p-4 sm:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <label className="text-xs font-semibold text-[#6E6558]">Elegí el mes<input type="month" value={month} onChange={(event) => { if (/^\d{4}-\d{2}$/.test(event.target.value) && Number(event.target.value.slice(0, 4)) >= 1000) setMonth(event.target.value); }} className="mt-2 block rounded-xl border border-[#BEB29F] bg-[#E4DCCD] px-4 py-2.5 text-sm text-[#352F28]" /></label>
          <button type="button" onClick={() => setRevision((value) => value + 1)} disabled={!ready} className="inline-flex items-center gap-2 rounded-xl border border-[#BEB29F] px-3 py-2.5 text-xs font-semibold transition hover:bg-[#E4DCCD] disabled:opacity-50"><RefreshCw size={15} />Actualizar</button>
        </div>
        {!ready ? <p role="status" className="flex items-center gap-2 py-12"><Loader2 size={20} className="animate-spin" />Cargando resumen…</p> : result.error ? <p role="alert" className="rounded-md bg-red-100 p-4 text-sm text-red-800">{result.error}</p> : <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Eventos confirmados", value: String(summary.events.length).padStart(2, "0"), Icon: CalendarCheck, style: "border-[#BEB29F] bg-[#E4DCCD]", iconStyle: "bg-[#CDC2AF] text-[#665641]" },
              { label: "Total acordado", value: formatMoney(summary.agreed), Icon: WalletCards, style: "border-[#BEB29F] bg-[#E4DCCD]", iconStyle: "bg-[#CDC2AF] text-[#665641]" },
              { label: "Cobrado", value: formatMoney(summary.paid), Icon: CircleDollarSign, style: "border-[#8DAEA0] bg-[#C4D5C7]", iconStyle: "bg-[#A6C4B4] text-[#245F4C]" },
              { label: "Saldo pendiente", value: formatMoney(summary.pending), Icon: Clock3, style: "border-[#C3A373] bg-[#E0CCAA]", iconStyle: "bg-[#D0B58B] text-[#785226]" },
            ].map(({ label, value, Icon, style, iconStyle }) => <div key={label} className={`rounded-2xl border p-4 shadow-[0_3px_10px_rgba(55,44,25,0.04)] ${style}`}><div className={`mb-4 grid h-9 w-9 place-items-center rounded-xl ${iconStyle}`}><Icon size={19} aria-hidden="true" /></div><p className="text-xs font-medium text-[#5D5548]">{label}</p><p className="mt-1 break-words text-xl font-bold tracking-tight sm:text-2xl">{value}</p></div>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#BDCDBF] px-3 py-1.5 text-[#325640]"><CheckCircle2 size={13} />{summary.completed} finalizados</span>
            <span className="rounded-full bg-[#C4CABA] px-3 py-1.5 text-[#45513B]">{summary.events.length - summary.completed} aprobados</span>
            <span className="rounded-full border border-[#BEB29F] px-3 py-1.5 text-[#6E6558]">{summary.pendingRequests} solicitudes pendientes · fuera de los totales</span>
          </div>
          {summary.missingPrices > 0 && <p className="mt-2 rounded-md border border-[#B88B4D] bg-[#E1CDAA] p-3 text-sm">{summary.missingPrices} evento(s) sin precio acordado: su saldo aún no se puede calcular y no se incluye en el total acordado.</p>}
          <p className="mt-4 text-xs leading-relaxed text-[#6E6558]">Los importes corresponden a eventos que se realizan en este mes, aunque sus pagos se hayan recibido en otra fecha. Se cuentan señas marcadas como pagadas y pagos posteriores registrados. Se excluyen reservas rechazadas y vencidas.</p>
          <h3 className="mb-3 mt-7 flex items-center gap-2 font-titular text-xl"><span className="h-5 w-1 rounded-full bg-[#398E7F]" aria-hidden="true" />Los eventos del mes</h3>
          {summary.events.length === 0 ? <div className="rounded-2xl border border-dashed border-[#BEB29F] py-9 text-center"><CalendarCheck size={28} className="mx-auto mb-3 text-[#8B816E]" /><p className="text-sm">No hay eventos confirmados para este mes.</p></div> : <div className="overflow-x-auto rounded-2xl border border-[#BEB29F]">
            <table className="w-full text-left text-sm"><caption className="sr-only">Detalle de eventos de {monthLabel}</caption>
              <thead className="bg-[#C5BBA9] text-[#605443]"><tr>{["Fecha / cliente", "Estado", "Acordado", "Cobrado", "Saldo"].map((label) => <th key={label} scope="col" className="whitespace-nowrap p-3 text-[10px] font-bold uppercase tracking-wider">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-[#BEB29F]">{summary.events.map((item) => {
                const balance = getReservationBalance(item);
                return <tr key={item.id} className="bg-[#DED5C5] transition-colors even:bg-[#D8CEBC] hover:bg-[#CBCBB8]"><td className="p-3"><span className="block text-xs text-[#6E6558]">{item.event_date.split("-").reverse().join("/")}</span><span className="font-semibold">{item.customer_name}</span></td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.status === "completed" ? "bg-[#C5BBA9] text-[#5B503F]" : "bg-[#B8D1C0] text-[#305F48]"}`}>{statusLabels[item.status]}</span></td><td className="whitespace-nowrap p-3 tabular-nums">{formatMoney(item.agreed_price)}</td><td className="whitespace-nowrap p-3 tabular-nums text-[#305F48]">{formatMoney(balance.paid)}</td><td className="whitespace-nowrap p-3 font-semibold tabular-nums text-[#785226]">{balance.pending === null ? "Sin precio" : formatMoney(balance.pending)}</td></tr>;
              })}</tbody>
            </table>
          </div>}
        </>}
      </div>
    </dialog>
  </>;
}
