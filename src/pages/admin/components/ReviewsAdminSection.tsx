import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { Review } from "../types";
import { ReviewAdminCard } from "./ReviewAdminCard";
import { ApprovedReviewForm } from "./ApprovedReviewForm";

export function ReviewsAdminSection({
  reviews,
  loadingReviews,
  reviewFilter,
  setReviewFilter,
  reviewActionLoadingId,
  onApprove,
  onHide,
  onDelete,
  creatingReview,
  onCreate,
}: {
  reviews: Review[];
  loadingReviews: boolean;
  reviewFilter: "all" | "pending" | "approved";
  setReviewFilter: (filter: "all" | "pending" | "approved") => void;
  reviewActionLoadingId: string | null;
  onApprove: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  creatingReview: boolean;
  onCreate: (values: { name: string; message: string }) => Promise<string | null>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [created, setCreated] = useState(false);
  const filteredReviews = reviews.filter((review) => {
    if (reviewFilter === "all") return true;
    if (reviewFilter === "approved") return review.approved;
    return !review.approved;
  });

  return (
    <section className="mt-10 rounded-xl border border-[#D8D2C5] bg-white/70 p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#D8D2C5] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-titular font-normal text-3xl text-[#1C1915]">
            Gestión de reseñas
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#4B443B]">
            Aprobá, ocultá o eliminá reseñas, o cargá una opinión del cliente ya aprobada.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setShowCreate(true); setCreated(false); }} disabled={showCreate}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-night px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            <Plus size={16} />Crear reseña aprobada
          </button>
          {(["all", "pending", "approved"] as const).map((item) => (
            <button
              key={item}
              aria-pressed={reviewFilter === item}
              onClick={() => setReviewFilter(item)}
              className={[
                "rounded-md border px-4 py-2 text-xs font-semibold transition",
                reviewFilter === item
                  ? "border-calypso-700 bg-calypso-700 text-white"
                  : "border-[#D8D2C5] bg-white/50 text-[#4B443B] hover:bg-white",
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

      {showCreate && <ApprovedReviewForm creating={creatingReview} onCreate={onCreate} onCancel={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); setCreated(true); }} />}
      {created && <p role="status" className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">La reseña se creó y quedó publicada.</p>}

      {loadingReviews ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-calypso-700" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="mt-6 rounded-lg border border-[#D8D2C5] bg-white/45 p-6 text-sm text-[#4B443B]">
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
