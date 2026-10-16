import { ArrowLeft, ChevronDown, Download, LogOut, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminHeader({
  onDownloadClients,
  onDownloadEvents,
  onRefresh,
  onLogout,
}: {
  onDownloadClients: () => void;
  onDownloadEvents: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#087d75] transition hover:text-[#0BB3A6]"
        >
          <ArrowLeft size={17} />
          Volver al sitio
        </Link>

        <h1 className="mt-6 font-display text-4xl leading-tight text-[#2f241e] md:text-6xl">
          Panel de{" "}
          <span className="relative inline-block text-[#0BB3A6]">
            administración
            <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#0BB3A6] via-[#e8c17f] to-transparent" />
          </span>
          .
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5c473b] md:text-base">
          Administrá reservas, reseñas, señas, notas internas y métricas de
          origen de clientes.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <details className="group relative">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/55 px-5 py-3 text-sm font-semibold text-[#2f241e] transition hover:bg-white [&::-webkit-details-marker]:hidden">
            <Download size={16} />
            Exportar Excel
            <ChevronDown
              size={15}
              className="transition-transform group-open:rotate-180"
            />
          </summary>

          <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-[1.2rem] border border-[#dfc8ab] bg-[#fff9f0] p-2 shadow-[0_18px_45px_rgba(90,64,50,0.16)]">
            <button
              type="button"
              onClick={onDownloadClients}
              className="w-full rounded-[0.9rem] px-4 py-3 text-left transition hover:bg-white"
            >
              <span className="block text-sm font-bold text-[#2f241e]">
                Clientes
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#6d5748]">
                Todos los clientes registrados, sin importar el estado del
                evento.
              </span>
            </button>

            <button
              type="button"
              onClick={onDownloadEvents}
              className="w-full rounded-[0.9rem] px-4 py-3 text-left transition hover:bg-white"
            >
              <span className="block text-sm font-bold text-[#2f241e]">
                Eventos finalizados
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#6d5748]">
                Cliente, evento, fecha, invitados, personal e ingreso total.
              </span>
            </button>
          </div>
        </details>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-[#dfc8ab] bg-white/55 px-5 py-3 text-sm font-semibold text-[#2f241e] transition hover:bg-white"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full bg-[#2f241e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d1511]"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </div>
  );
}
