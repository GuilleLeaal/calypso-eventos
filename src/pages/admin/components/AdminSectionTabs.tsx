import type { AdminSection } from "../types";

export function AdminSectionTabs({
  activeSection,
  onSelect,
}: {
  activeSection: AdminSection;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <div className="-mx-1 mt-8 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onSelect("reservations")}
          className={[
            "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
            activeSection === "reservations"
              ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
              : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
          ].join(" ")}
        >
          Reservas
        </button>

        <button
          type="button"
          onClick={() => onSelect("completed_events")}
          className={[
            "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
            activeSection === "completed_events"
              ? "border-[#2f241e] bg-[#2f241e] text-white"
              : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
          ].join(" ")}
        >
          Eventos finalizados
        </button>

        <button
          type="button"
          onClick={() => onSelect("disabled_dates")}
          className={[
            "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
            activeSection === "disabled_dates"
              ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
              : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
          ].join(" ")}
        >
          Fechas inhabilitadas
        </button>

        <button
          type="button"
          onClick={() => onSelect("reviews")}
          className={[
            "shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.09em] transition sm:px-5 sm:py-3 sm:text-sm",
            activeSection === "reviews"
              ? "border-[#0BB3A6] bg-[#0BB3A6] text-white"
              : "border-[#dfc8ab] bg-white/55 text-[#2f241e] hover:bg-white",
          ].join(" ")}
        >
          Reseñas
        </button>
      </div>
    </div>
  );
}
