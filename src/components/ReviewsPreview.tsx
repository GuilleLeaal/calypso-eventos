import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

type Review = { id: string; name: string | null; message: string; created_at: string };
const PAGE_SIZE = 4;

async function fetchReviewPage(offset: number) {
  const { data, error } = await supabase.from("reviews")
    .select("id, name, message, created_at").eq("approved", true)
    .order("created_at", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE);
  if (error) throw error;
  const rows = (data ?? []) as Review[];
  return { reviews: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-UY", { month: "long", year: "numeric" }).format(new Date(value));
}

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [navigation, setNavigation] = useState({ back: false, forward: false });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nextOffsetRef = useRef(0);
  const pendingIndexRef = useRef<number | null>(null);
  const loadingMoreRef = useRef(false);
  const mountedRef = useRef(false);

  const updateNavigation = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const back = node.scrollLeft > 2;
    const forward = node.scrollLeft + node.clientWidth < node.scrollWidth - 2;
    setNavigation((current) => current.back === back && current.forward === forward ? current : { back, forward });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchReviewPage(0);
        if (cancelled) return;
        setReviews(result.reviews);
        setHasMore(result.hasMore);
        nextOffsetRef.current = result.reviews.length;
      } catch {
        if (!cancelled) setError("No pudimos cargar las opiniones. Podés volver a intentar con la flecha.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(node);
    if (pendingIndexRef.current !== null) {
      const target = node.children[pendingIndexRef.current] as HTMLElement | undefined;
      if (target) node.scrollTo({ left: target.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      pendingIndexRef.current = null;
    }
    return () => observer.disconnect();
  }, [reviews.length, loading, updateNavigation]);

  async function next() {
    if (loading || loadingMoreRef.current) return;
    const node = scrollerRef.current;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (node && node.scrollLeft + node.clientWidth < node.scrollWidth - 2) {
      node.scrollBy({ left: node.clientWidth + 32, behavior });
      return;
    }
    if (!hasMore && !error) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError("");
    try {
      const result = await fetchReviewPage(nextOffsetRef.current);
      if (!mountedRef.current) return;
      const knownIds = new Set(reviews.map((review) => review.id));
      const additions = result.reviews.filter((review) => !knownIds.has(review.id));
      pendingIndexRef.current = additions.length > 0 ? reviews.length : null;
      nextOffsetRef.current += result.reviews.length;
      setReviews((current) => [...current, ...additions]);
      setHasMore(result.hasMore);
    } catch {
      if (mountedRef.current) setError("No pudimos cargar más opiniones. Tocá la flecha para reintentar.");
    } finally {
      loadingMoreRef.current = false;
      if (mountedRef.current) setLoadingMore(false);
    }
  }

  if (!loading && reviews.length === 0 && !error) return null;

  return (
    <section aria-labelledby="resenas-titulo" className="border-t border-ink/10 bg-paper py-20 font-texto text-ink lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-14 xl:px-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[15px] font-semibold text-ink-mute">Reseñas</p>
            <h2 id="resenas-titulo" className="mt-4 font-titular text-[clamp(2.4rem,4.6vw,3.8rem)] font-normal leading-[1] tracking-[-0.01em]">Lo que cuentan quienes ya festejaron.</h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink-soft lg:justify-self-end">Opiniones compartidas por quienes celebraron en Calypso.</p>
        </div>

        {loading ? (
          <div role="status" className="mt-12 flex min-h-40 items-center justify-center gap-3 text-ink-mute"><Loader2 className="animate-spin" size={20} aria-hidden="true" />Cargando opiniones…</div>
        ) : (
          <div id="public-reviews" ref={scrollerRef} onScroll={updateNavigation} tabIndex={0} role="region" aria-label="Opiniones de clientes" aria-busy={loadingMore}
            className="relative mt-10 grid snap-x snap-mandatory auto-cols-[100%] grid-flow-col gap-8 overflow-x-auto overscroll-x-contain py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso-700 sm:auto-cols-[calc((100%-2rem)/2)] lg:auto-cols-[calc((100%-6rem)/4)]">
            {reviews.map((review) => (
              <figure key={review.id} className="min-w-0 snap-start text-center">
                <blockquote className="break-words text-lg leading-relaxed text-ink-soft"><span aria-hidden="true" className="text-calypso">“</span>{review.message}<span aria-hidden="true" className="text-calypso">”</span></blockquote>
                <figcaption className="mt-4 break-words text-sm"><span className="font-semibold">{review.name?.trim() || "Cliente de Calypso"}</span><span className="text-ink-mute"> · {formatDate(review.created_at)}</span></figcaption>
              </figure>
            ))}
          </div>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-ink-soft">{error}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-mute">Deslizá o usá las flechas para ver más opiniones.</p>
          <div className="flex gap-3">
            <button type="button" aria-label="Ver opiniones anteriores" aria-controls="public-reviews" disabled={!navigation.back || loading || loadingMore}
              onClick={() => scrollerRef.current?.scrollBy({ left: -(scrollerRef.current.clientWidth + 32), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}
              className="grid h-12 w-12 place-items-center rounded-full border border-ink/25 transition hover:bg-paper-deep disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso-700"><ArrowLeft size={20} /></button>
            <button type="button" aria-label={error ? "Reintentar cargar opiniones" : "Ver más opiniones"} aria-controls="public-reviews" disabled={loading || loadingMore || (!navigation.forward && !hasMore && !error)} onClick={() => void next()}
              className="grid h-12 w-12 place-items-center rounded-full bg-calypso-700 text-white transition hover:bg-calypso-800 disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-calypso-700">{loadingMore ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
