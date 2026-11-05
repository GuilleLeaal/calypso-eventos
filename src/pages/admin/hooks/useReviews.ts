import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { validateReview } from "../../../lib/reviewValidation";
import type { AdminSection, Review } from "../types";

export function useReviews({
  isLoggedIn,
  activeSection,
  setGlobalError,
}: {
  isLoggedIn: boolean;
  activeSection: AdminSection;
  setGlobalError: (message: string) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [creatingReview, setCreatingReview] = useState(false);
  const creatingReviewRef = useRef(false);
  const [reviewActionLoadingId, setReviewActionLoadingId] = useState<
    string | null
  >(null);
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "pending" | "approved"
  >("all");

  useEffect(() => {
    if (isLoggedIn && activeSection === "reviews") {
      fetchReviews();
    }
  }, [isLoggedIn, activeSection]);

  async function fetchReviews() {
    setLoadingReviews(true);
    setGlobalError("");

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, message, rating, approved, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        setGlobalError("No pudimos cargar las reseñas.");
        setReviews([]);
        return;
      }

      setReviews((data || []) as Review[]);
    } catch (error) {
      console.error("Unexpected reviews error:", error);
      setGlobalError("Ocurrió un error cargando las reseñas.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function createApprovedReview(values: { name: string; message: string }) {
    if (creatingReviewRef.current) return "La reseña se está guardando.";
    const validationError = validateReview(values.name, values.message, true);
    if (validationError) return validationError;

    setGlobalError("");
    creatingReviewRef.current = true;
    setCreatingReview(true);
    try {
      const { data, error } = await supabase.from("reviews").insert({
        name: values.name.trim(),
        message: values.message.trim(),
        rating: 5,
        approved: true,
      }).select("id, name, message, rating, approved, created_at").single();
      if (error || !data) throw error ?? new Error("Missing created review");
      setReviews((current) => [data as Review, ...current]);
      setReviewFilter("approved");
      return null;
    } catch (error) {
      console.error("Error creating approved review:", error);
      return "No pudimos crear la reseña aprobada. Revisá los permisos o intentá nuevamente.";
    } finally {
      creatingReviewRef.current = false;
      setCreatingReview(false);
    }
  }

  async function updateReviewStatus(id: string, approved: boolean) {
    setReviewActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase
      .from("reviews")
      .update({ approved })
      .eq("id", id);

    if (error) {
      console.error("Error updating review:", error);
      setGlobalError("No pudimos actualizar la reseña.");
    } else {
      await fetchReviews();
    }

    setReviewActionLoadingId(null);
  }

  async function deleteReview(id: string) {
    const confirmed = window.confirm(
      "¿Seguro que querés borrar esta reseña? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;

    setReviewActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("Error deleting review:", error);
      setGlobalError("No pudimos borrar la reseña.");
    } else {
      await fetchReviews();
    }

    setReviewActionLoadingId(null);
  }

  return {
    reviews,
    setReviews,
    loadingReviews,
    creatingReview,
    createApprovedReview,
    reviewActionLoadingId,
    reviewFilter,
    setReviewFilter,
    fetchReviews,
    updateReviewStatus,
    deleteReview,
  };
}
