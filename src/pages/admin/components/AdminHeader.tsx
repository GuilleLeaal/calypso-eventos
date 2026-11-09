import { ArrowLeft, ChevronDown, Download, LogOut, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { MonthlySummaryButton } from "./MonthlySummaryButton";

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
    <div className="flex flex-col gap-6 rounded-xl border border-night-line bg-night p-6 text-paper shadow-sm lg:flex-row lg:items-center lg:justify-between sm:p-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-calypso-200 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Volver al sitio
        </Link>

        <h1 className="mt-5 max-w-2xl font-titular text-3xl font-normal leading-tight text-paper sm:text-4xl">
          Administración
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/75">
          Administrá reservas, reseñas, señas, notas internas y métricas de
          origen de clientes.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-sm lg:justify-end">
        <MonthlySummaryButton />
        <details className="group relative">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-md border border-night-line bg-night-soft px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-line [&::-webkit-details-marker]:hidden">
            <Download size={16} />
            Exportar Excel
            <ChevronDown
              size={15}
              className="transition-transform group-open:rotate-180"
            />
          </summary>

          <div className="absolute left-0 z-30 mt-2 w-64 sm:left-auto sm:right-0 sm:w-72 overflow-hidden rounded-lg border border-[#D8D2C5] bg-[#FAF7F1] p-2 shadow-[0_18px_45px_rgba(90,64,50,0.16)]">
            <button
              type="button"
              onClick={onDownloadClients}
              className="w-full rounded-md px-4 py-3 text-left transition hover:bg-white"
            >
              <span className="block text-sm font-bold text-[#1C1915]">
                Clientes
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#6E6558]">
                Todos los clientes registrados, sin importar el estado del
                evento.
              </span>
            </button>

            <button
              type="button"
              onClick={onDownloadEvents}
              className="w-full rounded-md px-4 py-3 text-left transition hover:bg-white"
            >
              <span className="block text-sm font-bold text-[#1C1915]">
                Eventos finalizados
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#6E6558]">
                Cliente, evento, fecha, invitados, personal e ingreso total.
              </span>
            </button>
          </div>
        </details>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-md border border-night-line bg-night-soft px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-line"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-md border border-paper/25 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-line"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </div>
  );
}
