import { Loader2 } from "lucide-react";
import type { Review } from "../types";
import { ReviewAdminCard } from "./ReviewAdminCard";

export function ReviewsAdminSection({
  reviews,
  loadingReviews,
  reviewFilter,
  setReviewFilter,
  reviewActionLoadingId,
  onApprove,
  onHide,
  onDelete,
}: {
  reviews: Review[];
  loadingReviews: boolean;
  reviewFilter: "all" | "pending" | "approved";
  setReviewFilter: (filter: "all" | "pending" | "approved") => void;
  reviewActionLoadingId: string | null;
  onApprove: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const filteredReviews = reviews.filter((review) => {
    if (reviewFilter === "all") return true;
    if (reviewFilter === "approved") return review.approved;
    return !review.approved;
  });

  return (
    <section className="mt-10 rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-6 shadow-[0_22px_60px_rgba(90,64,50,0.10)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-[#e4cfad] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-3xl text-[#2f241e]">
            Gestión de reseñas
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
            Aprobá, ocultá o eliminá las reseñas recibidas desde el QR del
            salón.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setReviewFilter(item)}
              className={[
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
                reviewFilter === item
                  ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
                  : "border-[#dfc8ab] bg-white/50 text-[#5c473b] hover:bg-white",
              ].join(" ")}
            >
              {item === "all"
                ? "Todas"
                : item === "pending"
                  ? "Pendientes"
                  : "Publicadas"}
            </button>
          ))}
        </div>
      </div>

      {loadingReviews ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0BB3A6]" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="mt-6 rounded-[1.2rem] border border-[#dfc8ab] bg-white/45 p-6 text-sm text-[#5c473b]">
          No hay reseñas para este filtro.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filteredReviews.map((review) => (
            <ReviewAdminCard
              key={review.id}
              review={review}
              loading={reviewActionLoadingId === review.id}
              onApprove={() => onApprove(review.id)}
              onHide={() => onHide(review.id)}
              onDelete={() => onDelete(review.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
