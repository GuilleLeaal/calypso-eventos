import { useMemo, useState } from "react";
import { motion, circOut } from "framer-motion";
import { Instagram, Phone, CalendarDays, MapPin, Facebook } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/calypso.eventos.uy/";
const FACEBOOK_URL =
  "https://www.facebook.com/share/1DwfAsZoqQ/?mibextid=wwXIfr";

// WhatsApp real del cliente:
const WHATSAPP_BASE = "https://wa.me/59899372068";

type FormState = {
  name: string;
  contact: string;
  month: string; // "01".."12"
  year: string; // "2026"...
  eventType: string;
  message: string;
};

const MONTHS: { value: string; label: string }[] = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function buildYearOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  // 5 años de rango (ajustable)
  return Array.from({ length: 6 }, (_, i) => String(currentYear + i));
}

export default function Contact() {
  const yearOptions = useMemo(() => buildYearOptions(), []);

  const initialForm: FormState = {
    name: "",
    contact: "",
    month: "",
    year: yearOptions[0] ?? String(new Date().getFullYear()),
    eventType: "",
    message: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);

  const monthLabel = useMemo(() => {
    const found = MONTHS.find((m) => m.value === form.month);
    return found?.label ?? "";
  }, [form.month]);

  const monthYearLabel = useMemo(() => {
    if (!form.month || !form.year) return "(mes/año a definir)";
    return `${monthLabel} ${form.year}`;
  }, [form.month, form.year, monthLabel]);

  const composedMessage = useMemo(() => {
    const lines = [
      "Hola! 👋 Quiero consultar por un evento en Calypso.",
      "",
      `• Nombre: ${form.name || "-"}`,
      `• Contacto (Tel): ${form.contact || "-"}`,
      `• Mes / Año: ${monthYearLabel}`,
      `• Tipo de evento: ${form.eventType || "-"}`,
      "",
      "Mensaje:",
      form.message || "-",
    ];
    return lines.join("\n");
  }, [form, monthYearLabel]);

  const whatsappHref = useMemo(() => {
    const text = encodeURIComponent(composedMessage);
    return `${WHATSAPP_BASE}?text=${text}`;
  }, [composedMessage]);

  const openWhatsApp = () => {
    window.open(whatsappHref, "_blank", "noreferrer");
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  return (
    <section id="contact" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Left */}
          <div>
            <div className="text-xs tracking-[0.22em] uppercase text-black/50">
              Reservas y consultas
            </div>

            <h2 className="mt-2 font-display text-4xl tracking-tight">
              Contacto<span className="text-calypso">.</span>
            </h2>

            <p className="mt-4 text-black/70 max-w-xl">
              Completa los datos y al enviar se abrirá WhatsApp con tu mensaje
              listo para mandar.
            </p>

            <div className="mt-8 grid gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white p-5 hover:border-calypso/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-calypso/10 text-calypso flex items-center justify-center">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Instagram</div>
                    <div className="text-sm text-black/60">
                      @calypso.eventos.uy
                    </div>
                  </div>
                </div>
                <span className="text-sm text-black/60 group-hover:text-black transition">
                  Abrir →
                </span>
              </a>

              <a
                href={WHATSAPP_BASE}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white p-5 hover:border-black/20 transition"
                title="Abrir WhatsApp"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-black/5 text-black flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">WhatsApp</div>
                    <div className="text-sm text-black/60">+598 99 372 068</div>
                  </div>
                </div>
                <span className="text-sm text-black/60 group-hover:text-black transition">
                  Abrir →
                </span>
              </a>

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white p-5 hover:border-black/20 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-black/5 text-black flex items-center justify-center">
                    <Facebook size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Facebook</div>
                    <div className="text-sm text-black/60">Página oficial</div>
                  </div>
                </div>
                <span className="text-sm text-black/60 group-hover:text-black transition">
                  Abrir →
                </span>
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: CalendarDays,
                  label: "Disponibilidad",
                  value: "Por mes",
                },
                { icon: MapPin, label: "Zona", value: "El Pinar" },
                { icon: Phone, label: "Respuesta", value: "Rápida" },
              ].map((x) => (
                <div
                  key={x.label}
                  className="rounded-2xl border border-black/10 bg-zinc-50 p-4"
                >
                  <div className="flex items-center gap-2 text-black/60">
                    <x.icon size={16} />
                    <div className="text-[11px] tracking-[0.22em] uppercase">
                      {x.label}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">{x.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: circOut }}
            className="rounded-3xl border border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.10)] overflow-hidden"
          >
            <div className="p-7 md:p-8">
              <div className="text-sm font-medium">Enviar consulta</div>
              <p className="mt-2 text-sm text-black/60">
                Elegí el <b>mes</b> y el <b>año</b> aproximado. Al enviar se
                abrirá WhatsApp con el mensaje prearmado.
              </p>
              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  openWhatsApp();
                  resetForm();
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                  />
                  <Field
                    label="Teléfono"
                    placeholder="teléfono"
                    value={form.contact}
                    onChange={(v) => setForm((p) => ({ ...p, contact: v }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Mes"
                    value={form.month}
                    onChange={(v) => setForm((p) => ({ ...p, month: v }))}
                    placeholder="Seleccionar mes"
                    options={MONTHS}
                  />

                  <SelectField
                    label="Año"
                    value={form.year}
                    onChange={(v) => setForm((p) => ({ ...p, year: v }))}
                    placeholder="Seleccionar año"
                    options={yearOptions.map((y) => ({ value: y, label: y }))}
                  />
                </div>

                <Field
                  label="Tipo de evento"
                  placeholder="Cumple, reunión, casamiento…"
                  value={form.eventType}
                  onChange={(v) => setForm((p) => ({ ...p, eventType: v }))}
                />

                <TextArea
                  label="Mensaje"
                  placeholder="Contanos cantidad aproximada de invitados y lo que tenés en mente…"
                  value={form.message}
                  onChange={(v) => setForm((p) => ({ ...p, message: v }))}
                />

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90 transition"
                >
                  Enviar por WhatsApp{" "}
                  <span className="ml-2 text-calypso">●</span>
                </button>

                <p className="text-xs text-black/50">
                  * El mensaje se completa automáticamente con los datos del
                  formulario.
                </p>

                {/* Preview (sin copiar) */}
                <div className="mt-4 rounded-2xl border border-black/10 bg-zinc-50 p-4">
                  <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                    Previsualización del mensaje
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap text-sm text-black/70 leading-relaxed">
                    {composedMessage}
                  </pre>
                </div>
              </form>
            </div>

            <div className="h-px bg-black/10" />

            <div className="p-6 md:p-7 bg-zinc-50">
              <div className="text-xs tracking-[0.22em] uppercase text-black/50">
                Tip
              </div>
              <div className="mt-2 text-sm text-black/70">
                Para reservar más rápido, indicá: <b>mes</b>, <b>horario</b> y{" "}
                <b>cantidad de invitados</b>.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs tracking-[0.22em] uppercase text-black/50">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-calypso/60 focus:ring-4 focus:ring-calypso/10 transition"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs tracking-[0.22em] uppercase text-black/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-calypso/60 focus:ring-4 focus:ring-calypso/10 transition"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs tracking-[0.22em] uppercase text-black/50">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-calypso/60 focus:ring-4 focus:ring-calypso/10 transition resize-none"
      />
    </label>
  );
}
