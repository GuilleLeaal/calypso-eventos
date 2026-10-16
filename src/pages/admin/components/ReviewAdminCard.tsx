import { Check, Loader2, Trash2, X } from "lucide-react";
import type { Review } from "../types";

export function ReviewAdminCard({
  review,
  loading,
  onApprove,
  onHide,
  onDelete,
}: {
  review: Review;
  loading: boolean;
  onApprove: () => void;
  onHide: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-[1.45rem] border border-[#dfc8ab] bg-white/55 p-5 shadow-[0_12px_32px_rgba(90,64,50,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                review.approved
                  ? "border-[#0BB3A6]/35 bg-[#0BB3A6]/12 text-[#087d75]"
                  : "border-[#e8c17f]/45 bg-[#e8c17f]/18 text-[#8a5b1f]",
              ].join(" ")}
            >
              {review.approved ? "Publicada" : "Pendiente"}
            </span>

            <span className="rounded-full border border-[#dfc8ab] bg-[#fff9f0] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d5748]">
              5 estrellas
            </span>
          </div>

          <h3 className="mt-3 font-display text-2xl text-[#2f241e]">
            {review.name || "Anónimo"}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-[#5c473b]">
            “{review.message}”
          </p>

          <p className="mt-3 text-xs font-medium text-[#8a7667]">
            {new Date(review.created_at).toLocaleString("es-UY")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!review.approved && (
            <button
              onClick={onApprove}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0BB3A6] px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-white transition hover:bg-[#099f94] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Aprobar
            </button>
          )}

          {review.approved && (
            <button
              onClick={onHide}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#2f241e] transition hover:bg-[#fff9f0] disabled:opacity-60"
            >
              <X size={15} />
              Ocultar
            </button>
          )}

          <button
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.09em] text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Borrar
          </button>
        </div>
      </div>
    </article>
  );
}
