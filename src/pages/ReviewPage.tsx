import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const MAX_MESSAGE_LENGTH = 300;

export default function ReviewPage() {
  const [form, setForm] = useState({
    name: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const remaining = useMemo(() => {
    return MAX_MESSAGE_LENGTH - form.message.length;
  }, [form.message.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const name = form.name.trim();
    const message = form.message.trim();

    setError("");

    if (!message) {
      setError("Escribí una reseña antes de enviarla.");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError("La reseña no puede superar los 300 caracteres.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("reviews").insert({
      name: name || null,
      message,
      rating: 5,
      approved: false,
    });

    setSubmitting(false);

    if (insertError) {
      console.error("Error Supabase insert review:", insertError);
      setError(
        "No pudimos guardar la reseña. Intentá nuevamente en unos segundos."
      );
      return;
    }

    setSent(true);
    setForm({
      name: "",
      message: "",
    });
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#f6f0e7] pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-130px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/12 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
        <div className="absolute left-0 top-0 h-72 w-72 opacity-[0.08] [background-image:radial-gradient(#0BB3A6_1.2px,transparent_1.2px)] [background-size:15px_15px]" />
      </div>

      <section className="relative mx-auto max-w-5xl px-6 pb-24 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: circOut }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#087d75] transition hover:text-[#0BB3A6]"
            >
              <ArrowLeft size={17} />
              Volver al sitio
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#0BB3A6]/35 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087d75] shadow-[0_10px_28px_rgba(63,42,28,0.05)]">
              <Sparkles size={15} />
              Gracias por celebrar con nosotros
            </div>

            <h1 className="mt-5 font-display text-4xl leading-[1.02] tracking-tight text-[#2f241e] md:text-6xl">
              Dejá tu reseña sobre{" "}
              <span className="relative inline-block text-[#0BB3A6]">
                Calypso
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
              </span>
              .
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-[#4a382e] md:text-lg">
              Tu opinión ayuda a que otras familias conozcan la experiencia de
              celebrar en el salón.
            </p>

            <div className="mt-8 flex gap-1 text-[#e8c17f]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={22}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: circOut }}
            className="rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/82 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.11)] backdrop-blur md:p-7"
          >
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6]">
                  <CheckCircle2 size={34} />
                </div>

                <h2 className="mt-5 font-display text-3xl text-[#2f241e]">
                  Reseña enviada
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5c473b]">
                  Gracias por tomarte el tiempo de compartir tu experiencia. La
                  reseña será publicada luego de ser revisada.
                </p>

                <Link
                  to="/"
                  className="group mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#0BB3A6] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.09em] text-white shadow-[0_16px_38px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94]"
                >
                  Ver sitio
                  <ArrowUpRight
                    size={16}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-start justify-between gap-4 border-b border-[#e4cfad] pb-5">
                  <div>
                    <h2 className="font-display text-3xl text-[#2f241e]">
                      Contanos cómo estuvo
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
                      La reseña quedará pendiente y será publicada luego de ser
                      revisada.
                    </p>
                  </div>

                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6] sm:grid">
                    <MessageCircle size={20} />
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Nombre opcional
                    </span>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value.slice(0, 60),
                        }))
                      }
                      placeholder="Tu nombre"
                      className="input-contact"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                      Reseña
                    </span>

                    <textarea
                      value={form.message}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          message: event.target.value.slice(
                            0,
                            MAX_MESSAGE_LENGTH
                          ),
                        }))
                      }
                      rows={6}
                      placeholder="Escribí tu experiencia en Calypso..."
                      className="input-contact resize-none"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <span
                        className={
                          error ? "text-red-700" : "text-[#6d5748]/75"
                        }
                      >
                        {error || "Máximo 300 caracteres."}
                      </span>

                      <span
                        className={[
                          "font-semibold",
                          remaining <= 30 ? "text-[#b45309]" : "text-[#087d75]",
                        ].join(" ")}
                      >
                        {remaining}
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Send size={18} />
                  {submitting ? "Enviando..." : "Enviar reseña"}
                  <ArrowUpRight
                    size={17}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-5 text-[#c49a5b]">
          <div className="h-px flex-1 bg-[#c49a5b]/55" />
          <span className="font-display text-3xl">✦</span>
          <div className="h-px flex-1 bg-[#c49a5b]/55" />
        </div>
      </section>
    </main>
  );
}