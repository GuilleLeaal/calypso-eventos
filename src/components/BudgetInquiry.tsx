import { createContext, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type FormEvent, type ReactNode } from "react";
import { MessageCircle, X } from "lucide-react";
import { EVENT_TYPES, MAX_ADULTS_COUNT, MAX_CHILDREN_COUNT } from "../pages/admin/constants";
import { useHeroMode } from "./home/heroMode";

const BudgetContext = createContext<() => void>(() => {});

export function BudgetButton({ children = "Consultar presupuesto", onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const open = useContext(BudgetContext);
  return <button {...props} type="button" onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) open(); }}>{children}</button>;
}

export function BudgetInquiryProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ children: "", adults: "", event: "" });
  const [error, setError] = useState("");
  const night = useHeroMode() === "night";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const childrenCount = Number(form.children);
    const adultsCount = Number(form.adults);
    if (!form.children.trim() || !form.adults.trim() || !Number.isInteger(childrenCount) || !Number.isInteger(adultsCount) || childrenCount < 0 || adultsCount < 0 || childrenCount > MAX_CHILDREN_COUNT || adultsCount > MAX_ADULTS_COUNT || !EVENT_TYPES.includes(form.event)) {
      setError("Completá el tipo de evento y las cantidades válidas de invitados.");
      return;
    }
    if (childrenCount + adultsCount === 0) { setError("Ingresá al menos un invitado."); return; }
    setError("");
    const message = `¡Hola, Calypso! Me gustaría consultar un presupuesto para un evento en la barbacoa.\n\nTipo de evento: ${form.event}\nCantidad de niños: ${childrenCount}\nCantidad de adultos: ${adultsCount}\n\n¿Me podrían compartir las opciones y el presupuesto? Tengo en cuenta que las reservas se coordinan con al menos 10 días de anticipación. ¡Gracias!`;
    window.open(`https://wa.me/59899372068?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return <BudgetContext.Provider value={() => { setError(""); setIsOpen(true); }}>
    {children}
    <dialog ref={dialogRef} onClose={() => setIsOpen(false)} aria-labelledby="budget-title" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl p-0 font-texto shadow-2xl backdrop:bg-black/60 ${night ? "bg-night text-paper" : "bg-paper text-ink"}`}>
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="budget-title" className="font-titular text-3xl font-normal">Consultar presupuesto</h2>
          <button type="button" aria-label="Cerrar consulta" onClick={() => dialogRef.current?.close()} className="rounded-md border border-current/20 p-2"><X size={20} /></button>
        </div>
        <p className="mt-3 text-sm leading-relaxed opacity-80">Contanos qué querés festejar y cuántos invitados van a venir. Las reservas se coordinan con al menos 10 días de anticipación.</p>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="block text-sm font-medium">Tipo de evento
            <select required autoFocus value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} className="mt-2 w-full rounded-md border border-ink/25 bg-paper p-3 text-ink">
              <option value="">Seleccioná una opción</option>
              {EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium">Cantidad de niños
              <input required type="number" inputMode="numeric" min={0} max={MAX_CHILDREN_COUNT} step={1} value={form.children} onChange={(event) => setForm({ ...form, children: event.target.value })} className="mt-2 w-full rounded-md border border-ink/25 bg-paper p-3 text-ink" />
              <span className="mt-1 block text-xs opacity-70">Máximo {MAX_CHILDREN_COUNT}</span>
            </label>
            <label className="block text-sm font-medium">Cantidad de adultos
              <input required type="number" inputMode="numeric" min={0} max={MAX_ADULTS_COUNT} step={1} value={form.adults} onChange={(event) => setForm({ ...form, adults: event.target.value })} className="mt-2 w-full rounded-md border border-ink/25 bg-paper p-3 text-ink" />
              <span className="mt-1 block text-xs opacity-70">Máximo {MAX_ADULTS_COUNT}</span>
            </label>
          </div>
          {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-calypso px-4 py-4 font-semibold text-ink hover:bg-[#25c3b6]"><MessageCircle size={20} />Enviar consulta por WhatsApp</button>
          <p className="text-center text-xs leading-relaxed opacity-70">Se abrirá WhatsApp con tu consulta lista para enviar.</p>
        </form>
      </div>
    </dialog>
  </BudgetContext.Provider>;
}
