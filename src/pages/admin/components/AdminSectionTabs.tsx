import { CalendarCheck, CalendarDays, CalendarRange, CalendarOff, MessageSquare } from "lucide-react";
import type { AdminSection } from "../types";

const sections = [
  { id: "reservations", label: "Reservas", description: "Agenda y solicitudes", icon: CalendarDays },
  { id: "completed_events", label: "Eventos finalizados", description: "Historial y cobros", icon: CalendarCheck },
  { id: "disabled_dates", label: "Fechas inhabilitadas", description: "Bloqueos de agenda", icon: CalendarOff },
  { id: "calendar", label: "Calendario", description: "Disponibilidad del salón", icon: CalendarRange },
  { id: "reviews", label: "Reseñas", description: "Opiniones del salón", icon: MessageSquare },
] as const;

export function AdminSectionTabs({ activeSection, onSelect }: {
  activeSection: AdminSection;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <nav aria-label="Secciones de administración" className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-3 [&>button:last-child]:col-span-2 lg:[&>button:last-child]:col-span-1">
      {sections.map(({ id, label, description, icon: Icon }) => (
        <button key={id} type="button" aria-current={activeSection === id ? "page" : undefined}
          onClick={() => onSelect(id)}
          className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition sm:p-4 ${activeSection === id
            ? "border-calypso-700 bg-calypso-700 text-white shadow-sm"
            : "border-ink/15 bg-white/50 text-ink-soft hover:border-calypso-700/50 hover:bg-white"}`}>
          <Icon size={20} className="hidden shrink-0 sm:block" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{label}</span>
            <span className={`mt-1 hidden text-xs sm:block ${activeSection === id ? "text-white/80" : "text-ink-mute"}`}>{description}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
