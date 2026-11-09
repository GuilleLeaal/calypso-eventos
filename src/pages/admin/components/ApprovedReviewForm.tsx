import { useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { MAX_REVIEW_MESSAGE_LENGTH, validateReview } from "../../../lib/reviewValidation";

export function ApprovedReviewForm({ creating, onCreate, onCancel, onSaved }: {
  creating: boolean;
  onCreate: (values: { name: string; message: string }) => Promise<string | null>;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: "", message: "" });
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    const validationError = validateReview(form.name, form.message, true);
    setError(validationError);
    if (validationError) return;
    const saveError = await onCreate(form);
    if (saveError) setError(saveError);
    else onSaved();
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-lg border border-calypso-700/25 bg-paper p-4 sm:p-6">
      <h3 className="font-titular text-2xl text-ink">Crear reseña aprobada</h3>
      <p className="mt-2 text-sm text-ink-soft">Pegá el texto de la reseña y revisalo antes de guardar. Se publicará directamente en el sitio.</p>
      <fieldset disabled={creating} className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-ink-soft">
          Nombre del cliente
          <input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input-contact mt-2" placeholder="Nombre del cliente" />
        </label>
        <label className="block text-sm font-semibold text-ink-soft">
          Reseña
          <textarea required rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="input-contact mt-2 resize-y" placeholder="Copiá la opinión del cliente" />
        </label>
        <p className={`text-xs ${form.message.length > MAX_REVIEW_MESSAGE_LENGTH ? "text-red-700" : "text-ink-mute"}`}>
          {form.message.length}/{MAX_REVIEW_MESSAGE_LENGTH} caracteres
        </p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calypso-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {creating ? "Guardando…" : "Guardar y publicar"}
          </button>
          <button type="button" onClick={onCancel} className="min-h-11 rounded-md border border-ink/20 px-4 py-3 text-sm font-semibold text-ink">Cancelar</button>
        </div>
      </fieldset>
    </form>
  );
}
