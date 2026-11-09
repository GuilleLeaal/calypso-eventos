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

import { MAX_REVIEW_MESSAGE_LENGTH as MAX_MESSAGE_LENGTH, MAX_REVIEW_NAME_LENGTH, validateReview } from "../lib/reviewValidation";

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

    if (submitting) return;
    const validationError = validateReview(name, message);
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("reviews").insert({ name: name || null, message, rating: 5, approved: false });
      if (insertError) throw insertError;
    } catch (error) {
      console.error("Error saving public review:", error);
      setError("No pudimos guardar la reseña. Intentá nuevamente en unos segundos.");
      return;
    } finally {
      setSubmitting(false);
    }

    setSent(true);
    setForm({
      name: "",
      message: "",
    });
  };

  return (
    <main id="review-page" className="relative min-h-[100svh] bg-paper pt-28 font-texto text-ink lg:pt-32">
      <section className="relative mx-auto max-w-6xl px-6 pb-12 md:px-10 lg:pb-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: circOut }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-calypso-700 transition hover:text-calypso-900"
            >
              <ArrowLeft size={17} />
              Volver al sitio
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-calypso-700">
              <Sparkles size={15} />
              Gracias por celebrar con nosotros
            </div>

            <h1 className="mt-5 font-titular text-[clamp(2.6rem,5vw,4rem)] font-normal leading-[1.08] tracking-[-0.025em] text-ink">
              Dejá tu reseña sobre{" "}
              <span className="inline-block text-calypso-700">
                Calypso
              </span>
              .
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">
              Tu opinión ayuda a que otras familias conozcan la experiencia de
              celebrar en el salón.
            </p>

            <div className="mt-8 flex gap-1 text-brick">
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
            className="min-w-0 rounded-sm border border-ink/15 bg-white/40 p-6 sm:p-8"
          >
            {sent ? (
              <div role="status" className="py-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-calypso-700/10 text-calypso-700">
                  <CheckCircle2 size={34} />
                </div>

                <h2 className="mt-5 font-titular font-normal text-3xl text-ink">
                  Reseña enviada
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                  Gracias por tomarte el tiempo de compartir tu experiencia. La
                  reseña será publicada luego de ser revisada.
                </p>

                <Link
                  to="/"
                  className="group mt-7 inline-flex items-center justify-center gap-2 rounded-sm bg-calypso-700 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.09em] text-white transition hover:bg-calypso-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700"
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
                <div className="flex items-start justify-between gap-4 border-b border-ink/15 pb-5">
                  <div>
                    <h2 className="font-titular font-normal text-3xl text-ink">
                      Contanos cómo estuvo
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      La reseña quedará pendiente y será publicada luego de ser
                      revisada.
                    </p>
                  </div>

                  <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-calypso-700/10 text-calypso-700 sm:grid">
                    <MessageCircle size={20} />
                  </div>
                </div>

                <div className="mt-6 space-y-5 [&>label]:block">
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-mute">
                      Nombre opcional
                    </span>

                    <input
                      autoComplete="given-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value.slice(0, MAX_REVIEW_NAME_LENGTH),
                        }))
                      }
                      placeholder="Tu nombre"
                      className="input-contact"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink-mute">
                      Reseña
                    </span>

                    <textarea
                      aria-describedby="review-message-feedback"
                      aria-invalid={Boolean(error)}
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
                      className="input-contact resize-y"
                    />

                    <div id="review-message-feedback" className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <span
                        role={error ? "alert" : undefined}
                        className={
                          error ? "text-red-700" : "text-ink-mute/75"
                        }
                      >
                        {error || "Máximo 300 caracteres."}
                      </span>

                      <span
                        className={[
                          "font-semibold",
                          remaining <= 30 ? "text-[#b45309]" : "text-calypso-700",
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
                  className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-calypso-700 px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-calypso-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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

        <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-5 text-calypso-700">
          <div className="h-px flex-1 bg-ink/15" />
          <span className="font-titular font-normal text-3xl">✦</span>
          <div className="h-px flex-1 bg-ink/15" />
        </div>
      </section>
    </main>
  );
}