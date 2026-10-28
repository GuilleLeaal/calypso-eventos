import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Review = {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
};

const DESKTOP_COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-UY", {
    month: "long",
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

  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="resenas-titulo"
      className="border-t border-ink/10 bg-paper py-20 font-texto text-ink lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[15px] font-semibold text-ink-mute">Reseñas</p>
            <h2
              id="resenas-titulo"
              className="mt-4 font-titular text-[clamp(2.4rem,4.6vw,3.8rem)] font-normal leading-[1] tracking-[-0.01em]"
            >
              Lo que cuentan quienes ya festejaron.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink-soft lg:justify-self-end">
            Las dejan los invitados desde el QR que está en el salón.
          </p>
        </div>

        {loading ? (
          <div aria-hidden="true" className="mt-12 grid gap-10 md:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="space-y-3">
                <div className="h-7 w-4/5 animate-pulse rounded-sm bg-ink/10" />
                <div className="h-4 w-40 animate-pulse rounded-sm bg-ink/10" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={[
              "mt-12 grid gap-10 md:grid-cols-2",
              DESKTOP_COLUMNS[reviews.length] ?? "lg:grid-cols-4",
            ].join(" ")}
          >
            {reviews.map((review) => (
              <figure key={review.id} className="text-center">
                <blockquote className="font-texto text-lg font-normal leading-relaxed text-ink-soft">
                  <span aria-hidden="true" className="text-calypso">“</span>
                  {review.message}
                  <span aria-hidden="true" className="text-calypso">”</span>
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold">
                    {review.name?.trim() || "Cliente de Calypso"}
                  </span>
                  <span className="text-ink-mute"> · {formatDate(review.created_at)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div aria-hidden="true" className="mx-auto mt-16 flex max-w-sm items-center justify-center gap-5 text-calypso">
          <div className="h-px flex-1 bg-ink/15" />
          <span className="font-titular text-3xl">✦</span>
          <div className="h-px flex-1 bg-ink/15" />
        </div>
      </div>
    </section>
  );
}
