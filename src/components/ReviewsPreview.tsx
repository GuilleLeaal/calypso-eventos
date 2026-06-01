import { useEffect, useMemo, useState } from "react";
import { motion, circOut } from "framer-motion";
import {
  ArrowUpRight,
  MessageCircle,
  Quote,
  RefreshCw,
  Star,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Review = {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-UY", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, message, created_at")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!error && data) {
        setReviews(data);
      }

      setLoading(false);
    };

    fetchReviews();
  }, []);

  const hasReviews = reviews.length > 0;

  const averageLabel = useMemo(() => {
    if (!hasReviews) return "Nuevas experiencias";
    return `${reviews.length} reseña${reviews.length === 1 ? "" : "s"} recientes`;
  }, [hasReviews, reviews.length]);

  if (!loading && !hasReviews) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#f6f0e7] py-18 sm:py-20">
      {/* Unión suave con Hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f6f0e7] via-[#f6f0e7]/85 to-transparent" />

      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-150px] top-[-160px] h-80 w-80 rounded-full bg-[#0BB3A6]/10 blur-3xl" />
        <div className="absolute right-[-150px] bottom-[-160px] h-80 w-80 rounded-full bg-[#e8c17f]/12 blur-3xl" />
        <div className="absolute left-0 top-10 h-72 w-72 opacity-[0.06] [background-image:radial-gradient(#0BB3A6_1.2px,transparent_1.2px)] [background-size:15px_15px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: circOut }}
          className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0BB3A6]/35 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#087d75] shadow-[0_10px_28px_rgba(63,42,28,0.05)]">
              <Star size={15} fill="currentColor" />
              Reseñas recientes
            </div>

            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-[#2f241e] md:text-5xl">
              Experiencias reales en{" "}
              <span className="relative inline-block text-[#0BB3A6]">
                Calypso
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
              </span>
              .
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#4a382e]">
              Las últimas opiniones de familias y clientes que celebraron en el
              salón.
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-[#dfc8ab] bg-[#fff9f0]/72 px-5 py-4 shadow-[0_14px_36px_rgba(90,64,50,0.07)] backdrop-blur">
            <div className="flex items-center gap-1 text-[#e8c17f]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              ))}
            </div>

            <p className="mt-2 text-sm font-semibold text-[#2f241e]">
              {averageLabel}
            </p>

            <p className="mt-1 text-xs text-[#6d5748]">
              Publicadas desde el QR del salón
            </p>
          </div>
        </motion.div>

        {/* Reviews */}
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[230px] animate-pulse rounded-[1.6rem] border border-[#dfc8ab] bg-white/45"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {reviews.map((review, index) => (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: circOut,
                  }}
                  className={[
                    "group relative flex min-h-[235px] flex-col overflow-hidden rounded-[1.65rem] border bg-[#fff9f0]/78 p-5 shadow-[0_16px_42px_rgba(90,64,50,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-[#fff9f0]",
                    index === 0
                      ? "border-[#0BB3A6]/45 lg:shadow-[0_22px_58px_rgba(11,179,166,0.12)]"
                      : "border-[#dfc8ab] hover:border-[#0BB3A6]/35",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute right-[-56px] top-[-64px] h-40 w-40 rounded-full bg-[#0BB3A6]/10 blur-2xl transition group-hover:bg-[#0BB3A6]/14" />
                    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#0BB3A6]/45 to-transparent" />
                  </div>

                  <div className="relative mb-5 flex items-center justify-between gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0BB3A6]/10 text-[#087d75] ring-1 ring-[#0BB3A6]/18">
                      <Quote size={19} />
                    </div>

                    <div className="flex gap-1 text-[#e8c17f]">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={13}
                          fill="currentColor"
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="relative line-clamp-6 text-[15px] leading-relaxed text-[#3f3028]">
                    “{review.message}”
                  </p>

                  <div className="relative mt-auto pt-5">
                    <div className="h-px w-full bg-gradient-to-r from-[#0BB3A6]/45 via-[#e8c17f]/45 to-transparent" />

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-[#2f241e]">
                          <MessageCircle
                            size={15}
                            className="shrink-0 text-[#0BB3A6]"
                          />
                          <span className="truncate">
                            {review.name?.trim() || "Cliente de Calypso"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#9a6b2f]">
                          {formatDate(review.created_at)}
                        </p>
                      </div>

                      {index === 0 && (
                        <span className="shrink-0 rounded-full bg-[#0BB3A6]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#087d75]">
                          Nueva
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        {/* Cierre */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, delay: 0.08, ease: circOut }}
          className="mt-9 flex flex-col items-center justify-between gap-5 rounded-[1.5rem] border border-[#dfc8ab] bg-[#fff9f0]/62 px-5 py-5 shadow-[0_14px_36px_rgba(90,64,50,0.06)] backdrop-blur sm:flex-row"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0BB3A6]/10 text-[#087d75] sm:grid">
              <RefreshCw size={18} />
            </div>

            <p className="text-sm leading-relaxed text-[#5c473b]">
              Las reseñas se actualizan con las últimas opiniones enviadas desde
              el QR disponible en el salón.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}